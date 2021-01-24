import * as fs from "fs";
import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import * as cookieSignature from "cookie-signature";
import * as chalk from "chalk";
import morgan from "morgan";
import flash from "connect-flash";
import dotenv from "dotenv";

// Throw and show a stack trace on an unhandled Promise rejection instead of logging an unhelpful warning
process.on("unhandledRejection", err => {
	throw err;
});

// Load .env file
dotenv.config();

// Set up Express and its middleware
export let app = express();

morgan.token("sessionid", (request: express.Request, response) => {
	const FAILURE_MESSAGE = "Unknown session";
	if (!request.cookies["sessionid"]) {
		return FAILURE_MESSAGE;
	}
	let rawID: string = request.cookies["sessionid"].slice(2);
	let id = cookieSignature.unsign(rawID, /*config.secrets.session*/ "TODO");
	if (typeof id === "string") {
		return id;
	}
	return FAILURE_MESSAGE;
});
morgan.format("requestlog", (tokens, request, response) => {
	let statusColorizer: (input?: string) => string | undefined = input => input; // Default passthrough function

	if (response.statusCode >= 500) {
		statusColorizer = chalk.default.red;
	} else if (response.statusCode >= 400) {
		statusColorizer = chalk.default.yellow;
	} else if (response.statusCode >= 300) {
		statusColorizer = chalk.default.cyan;
	} else if (response.statusCode >= 200) {
		statusColorizer = chalk.default.green;
	}

	return [
		tokens.date(request, response, "iso"),
		tokens["remote-addr"](request, response),
		tokens.sessionid(request, response),
		tokens.method(request, response),
		tokens.url(request, response),
		statusColorizer(tokens.status(request, response)),
		tokens["response-time"](request, response), "ms", "-",
		tokens.res(request, response, "content-length")
	].join(" ");
});

// Middleware
app.use(compression());
app.use(cookieParser(undefined, {
	"path": "/",
	"maxAge": 60 * 60 * 24 * 30 * 6, // 6 months
	"secure": false, // Whether cookies can only be accessed over HTTPS - false because GT webhosting sometimes reverts to HTTP
	"httpOnly": true
} as cookieParser.CookieParseOptions));
app.use(morgan("requestlog"));
app.use(flash());

// import "./auth/auth";

// Auth needs to be the first route configured or else requests handled before it will always be unauthenticated
// import { authRouter } from "./routes/auth";
// app.use("/auth", authRouter);

app.route("/version").get((request, response) => {
	response.json({
		"hash": fs.existsSync("../.git") ? require("git-rev-sync").short("../") : "",
		"node": process.version
	});
});

// If no dynamic route is found above, look for static content in `rendered/`, then 404
app.use("/", express.static("../rendered"));

app.listen(process.env.PORT, () => {
	console.log(`Detachment 165 site started on port ${process.env.PORT}`);
});
