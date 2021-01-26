import * as express from "express";
import { use } from "passport";
import { db, User, UserType } from "./auth";

export let apiRouter = express.Router();

apiRouter.use(express.urlencoded({ extended: false }));

apiRouter.post("/access", (request, response, next) => {
	const user = request.user as User | undefined;
	if (request.isAuthenticated() && user?.type === UserType.Admin) {
		next();
	}
	else {
		response.status(403).send("You do not have permission to perform that action");
	}
}, async (request, response) => {
	let username = request.body?.username as string | undefined;
	let action = request.body?.action as "grant" | "deny" | "admin" | "demote" | undefined;
	if (!username || !action) {
		response.redirect("/cadets");
		return;
	}
	if (action === "grant") {
		await db.asyncUpdate({ username }, { $set: { type: UserType.Viewer } });
	}
	else if (action === "deny") {
		await db.asyncRemove({ username });
	}
	else if (action === "admin") {
		await db.asyncUpdate({ username }, { $set: { type: UserType.Admin } });
	}
	else if (action === "demote") {
		await db.asyncUpdate({ username }, { $set: { type: UserType.Viewer } });
	}
	response.redirect("/cadets");
});
