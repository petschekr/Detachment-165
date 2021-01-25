import * as fs from "fs";
import * as path from "path";
import * as express from "express";
import * as Handlebars from "handlebars";
import moment, { Moment } from "moment";

Handlebars.registerHelper("ifCond", function (this: any, v1: any, v2: any, options: any) {
	if (v1 === v2) {
		return options.fn(this);
	}
	return options.inverse(this);
});
Handlebars.registerHelper("ifIn", function <T>(this: any, elem: T, list: T[], options: any) {
	if (list.includes(elem)) {
		return options.fn(this);
	}
	return options.inverse(this);
});
Handlebars.registerHelper("join", <T>(arr: T[]): string => {
	return arr.join(", ");
});

Handlebars.registerPartial("base", fs.readFileSync(path.resolve("../content", "base.hbs"), "utf8"));

export class Template<T> {
	private template: Handlebars.TemplateDelegate<T> | null = null;
	private readonly filePath: string;
	private modifiedDate: Moment;

	constructor(private file: string) {
		this.filePath = path.resolve("../content", this.file);
		this.modifiedDate = moment();
		fs.stat(this.filePath, (err, stats) => {
			if (err) {
				console.error(err);
				return;
			}
			this.modifiedDate = moment(stats.mtime);
		});

		this.loadTemplate();
	}

	private loadTemplate(): void {
		let data = fs.readFileSync(this.filePath, "utf8");
		this.template = Handlebars.compile(data);
	}

	public render(input?: T): string {
		Handlebars.registerHelper("date", (): string => {
			return this.modifiedDate.format("MMM Y");
		});

		return this.template!(input ?? {} as T);
	}
}

const AboutTemplate = new Template("about.hbs");
const CadreTemplate = new Template("cadre.hbs");
const ContactTemplate = new Template("contact.hbs");
const CovidTemplate = new Template("covid.hbs");
const IndexTemplate = new Template("index.hbs");
const JoinTemplate = new Template("join.hbs");
const PrivacyTemplate = new Template("privacy.hbs");

export let uiRoutes = express.Router();

uiRoutes.route("/about").get((request, response) => {
	response.send(AboutTemplate.render());
});

uiRoutes.route("/cadre").get((request, response) => {
	response.send(CadreTemplate.render());
});

uiRoutes.route("/contact").get((request, response) => {
	response.send(ContactTemplate.render());
});

uiRoutes.route("/covid").get((request, response) => {
	response.send(CovidTemplate.render());
});

uiRoutes.route("/index").get((request, response) => {
	response.redirect("/");
});
uiRoutes.route("/").get((request, response) => {
	response.send(IndexTemplate.render());
});

uiRoutes.route("/join").get((request, response) => {
	response.send(JoinTemplate.render());
});

uiRoutes.route("/privacy").get((request, response) => {
	response.send(PrivacyTemplate.render());
});

/*uiRoutes.route("/login").get(async (request, response) => {
	if (request.isAuthenticated() && request.user && (request.user as IUser).verifiedEmail) {
		response.redirect("/");
		return;
	}
	let templateData = {
		title: "Log in",
		includeJS: "login",

		error: request.flash("error"),
		success: request.flash("success"),
		loginMethods: config.loginMethods,
		localOnly: config.loginMethods && config.loginMethods.length === 1 && config.loginMethods[0] === "local",
		email: request.session ? request.session.email : null,
	};
	response.send(LoginTemplate.render(templateData));
});*/
