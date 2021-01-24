import * as crypto from "crypto";
import * as util from "util";
import * as express from "express";
import session from "express-session";
import passport from "passport";
const NeDBStore = require("nedb-session-store")(session);
import NeDB from "nedb-async";
const CASStrategyProvider: StrategyConstructor = require("passport-cas2").Strategy;

// Custom types for Passport
type Strategy = passport.Strategy & {
	logout?(request: Request, response: Response, returnURL: string): void;
};
type PassportDone = (err: Error | null, user?: User | false, errMessage?: { message: string }) => void;
type Profile = passport.Profile & {
	profileUrl?: string;
	_json: any;
};
interface StrategyOptions {
	passReqToCallback: true; // Forced to true for our usecase
}
interface CASStrategyOptions extends StrategyOptions {
	casURL: string;
	pgtURL?: string;
	sessionKey?: string;
	propertyMap?: object;
	sslCA?: any[];
}
interface StrategyConstructor {
	// CAS constructor
	new(options: CASStrategyOptions, cb: (request: Request, username: string, profile: Profile, done: PassportDone) => Promise<void>): Strategy;
}

// Passport authentication
import { app, COOKIE_OPTIONS } from "./app";

app.enable("trust proxy");
if (!process.env.SESSION_SECRET) {
	console.warn("No session secret set; sessions won't carry over server restarts");
}

app.use(session({
	name: "sessionid",
	secret: process.env.SESSION_SECRET ?? crypto.randomBytes(16).toString("hex"),
	cookie: COOKIE_OPTIONS as session.CookieOptions,
	resave: false,
	store: new NeDBStore({
		filename: "db/sessions.db"
	}),
	saveUninitialized: false
}));

enum UserType {
	NoAccess,
	Viewer,
	Admin,
}
interface User {
	id: string;
	username: string;
	type: UserType
}

const db = new NeDB({ filename: "db/users.db", autoload: true });

passport.serializeUser((user, done) => {
	done(null, (user as User).id);
});
passport.deserializeUser((id, done) => {
	db.findOne({ id }, done);
});

export let authRouter = express.Router();

abstract class CASStrategy {
	public readonly passportStrategy: Strategy;

	constructor(
		public readonly name: string,
		url: string,
		private readonly logoutLink: string,
	) {
		this.passportStrategy = new CASStrategyProvider({
			casURL: url,
			passReqToCallback: true
		}, this.passportCallback.bind(this));
	}

	private async passportCallback(request: Request, username: string, profile: Profile, done: PassportDone) {
		// GT login will pass long invalid usernames of different capitalizations
		username = username.toLowerCase().trim();
		// Reject username@gatech.edu usernames because the CAS allows those for some reason
		// Bonus fact: using a @gatech.edu username bypasses 2FA and the OIT team in charge refuses to fix this
		if (username.indexOf("@") !== -1) {
			done(null, false, { message: `Usernames of the format ${username} with an email domain are insecure and therefore disallowed. Please log in with <strong>${username.split("@")[0]}</strong> instead. <a href="${this.logoutLink}" target="_blank">Click here</a> to do this.` });
			return;
		}

		// If `user` exists, the user has already logged in before and is good-to-go
		let user = await db.asyncFindOne<User>({ username });

		if (!user) {
			user = {
				id: crypto.randomBytes(16).toString("hex"),
				username,
				type: UserType.NoAccess,
			};
			await db.asyncInsert(user);
		}

		done(null, user);
	}

	public use(authRoutes: express.Router) {
		passport.use(this.name, this.passportStrategy);

		authRoutes.get(`/${this.name}`, passport.authenticate(this.name, {
			failureRedirect: "/",
			successReturnToOrRedirect: "/",
			failureFlash: true
		}));
	}
}

export class GeorgiaTechCAS extends CASStrategy {
	constructor() {
		// Application must be hosted on a *.gatech.edu domain for this to work
		super("gatech", "https://login.gatech.edu/cas", "https://login.gatech.edu/cas/logout");
	}
}

let GTCASMethod = new GeorgiaTechCAS();
GTCASMethod.use(authRouter);

app.use(passport.initialize());
app.use(passport.session());

authRouter.all("/logout", (request, response) => {
	request.logout();
	if (request.session) {
		request.session.destroy(() => {
			response.redirect("/");
		});
	}
	else {
		response.redirect("/");
	}
});
