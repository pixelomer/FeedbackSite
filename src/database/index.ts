interface Form {
	title: string,
	description: string,
	placeholder: string,
	responseTitle: string,
	response: string
};

interface Database {
	fetchForm(formID: string): Promise<Form>;
	createForm(form: Form): Promise<string>;
}

export { Form, Database };