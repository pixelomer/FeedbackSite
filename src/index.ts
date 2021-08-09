import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import { MemoryDatabase as Database } from "./database/memory";
import { Form } from "./database";

const database = new Database();
const PORT = process.env.PORT ?? 8080;

function sanitizeString(str: string): string {
	return (str ? str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/\n/g, "<br>")
	: "");
}

function templateFile(templatePath, replacements: { [key: string]: string }, sanitize: boolean = true): string {
	let result = fs.readFileSync(path.join("templates", templatePath), { encoding: "utf-8" });
	for (const [key, value] of Object.entries(replacements)) {
		const finalValue = sanitize ? sanitizeString(value) : value;
		result = result.replace(new RegExp(`&&${key}&&`, "g"), finalValue);
	}
	return result;
}

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public", { maxAge: "1h" }));

app.get("/forms/:formID([a-zA-Z0-9]{8})", async(request, response, next) => {
	const formID = request.params.formID;
	const form = await database.fetchForm(formID);
	if (form == null) {
		next();
		return;
	}
	response.send(templateFile("feedback-input.html", {
		"title": form.title,
		"description": form.description,
		"placeholder": form.placeholder,
		"path": request.path
	}));
});

app.get("/forms/:formID([a-zA-Z0-9]{8})/submit", async(request, response, next) => {
	const formID = request.params.formID;
	const form = await database.fetchForm(formID);
	if (form == null) {
		next();
		return;
	}
	response.send(templateFile("response.html", {
		"title": form.responseTitle,
		"description": form.response
	}));
});

app.post("/new", async(request, response) => {
	const form = request.body;
	let error = null;
	const defaults = {
		title: null,
		description: null,
		placeholder: "Type your feedback here",
		responseTitle: "Thank You",
		response: "Thank you for your feedback."
	};
	if (form == null) {
		error = "Empty body";
	}
	for (const [key, value] of Object.entries(defaults)) {
		if ((typeof form[key] !== 'string') || (form[key].length <= 0)) {
			if (value != null) {
				form[key] = value;
			}
			else {
				error = "Missing values";
				break;
			}
		}
	}
	if (error != null) {
		response.status(400).send(error);
		return;
	}
	try {
		const id = await database.createForm(form);
		response.send(templateFile("response.html", {
			"title": "Success",
			"description": `Your form has been created <a href="/forms/${id}">here</a>.`
		}, false));
	}
	catch (err) {
		console.log(err);
		response.status(500).send("Internal Server Error");
	}
});

app.get('*', (request, response) => {
	response.status(404).sendFile("static/404.html", { root: process.cwd() });
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});