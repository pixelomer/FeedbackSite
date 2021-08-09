import { Form, Database } from ".";

const localDatabase: { [key: string]: Form } = {
	"f3onuj5w": {
		title: "Litcord Feedback",
		description: "Thank you for being a member of Litcord. Do you have any complaints? How can we improve Litcord?",
		placeholder: "Type your feedback here",
		responseTitle: "Feedback discarded",
		response: "Your opinion is invalid."
	},
	"example0": {
		title: "SendFeedback",
		description: "Thank you for using SendFeedback. We'd love to hear your feedback so that we can improve our products.",
		placeholder: "Type your feedback here",
		responseTitle: "Thank You",
		response: "Thank you for your feedback."
	}
};

function randomID(length: number): string {
	const charmap = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "";
	for (let i=0; i<length; i++) {
		result += charmap[Math.floor(Math.random() * charmap.length)];
	}
	return result;
}

class MemoryDatabase implements Database {
	async fetchForm(formID: string): Promise<Form> {
		return localDatabase[formID];
	}
	async createForm(form: Form): Promise<string> {
		let formID;
		do formID = randomID(8);
		while (localDatabase[formID] != null);
		localDatabase[formID] = {...form};
		return formID;
	}
}

export { MemoryDatabase };