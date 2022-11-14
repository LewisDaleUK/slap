
import SiteDetailsGateway from "../gateways/SiteDetails.ts";
import ActorGateway from "../gateways/Actor.ts";
import Database from "../lib/Database.ts";
import { Actor, SiteDetails } from "../models/index.ts";
import { KeyPair } from "../crypto/index.ts";

export const handler = async () => {
	const database = new Database("app.db");

	const domain = prompt("What domain will your website use?");
	const title = prompt("What is the name of your site?", domain as string);
	
	const site = { domain, title } as SiteDetails;

	new SiteDetailsGateway(database).save(site);

	const handle = prompt("What is your handle?");
	const preferred_username = prompt("What is your preferred username?");
	const summary = prompt("Enter a brief summary of your profile");

	const actor = new Actor(handle as string, preferred_username as string, await KeyPair.generate(), summary as string);

	await new ActorGateway(database).save(actor);
}

await handler();
