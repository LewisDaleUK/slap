import { ActorGateway } from "../actor/mod.ts";
import { SiteDetailsGateway } from "../site/mod.ts"
import Database from "../lib/Database.ts";

const gateways = [
	SiteDetailsGateway,
	ActorGateway,
];

export const handler = () => {
	const database = new Database("app.db");

	console.log("Creating tables...");
	gateways.forEach(gateway => new gateway(database).build());
}

handler();