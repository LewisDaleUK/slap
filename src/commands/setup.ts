
import * as Site from "../site/mod.ts";
import * as Actor from "../actor/mod.ts";

import Database from "../lib/Database.ts";
import { KeyPair } from "../crypto/mod.ts";

export const handler = async () => {
	const database = new Database("app.db");

	const domain = prompt("What domain will your website use?");
	const title = prompt("What is the name of your site?", domain as string);
	
	const site = { domain, title } as Site.Model;

	new Site.Gateway(database).save(site);

	const handle = prompt("What is your handle?");
	const preferred_username = prompt("What is your preferred username?");
	const summary = prompt("Enter a brief summary of your profile");

	const actor = new Actor.Model(
		await KeyPair.generate(),
	);

	actor.handle = handle as string;
	actor.preferred_username = preferred_username as string;
	actor.external = false;
	actor.summary = summary as string;

	await new Actor.Gateway(database).save(actor);
}

await handler();
