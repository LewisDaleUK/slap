import * as Actor from "../actor/mod.ts";
import { Gateway } from "../site/mod.ts"
import Database from "../lib/Database.ts";

const gateways = [
	Gateway,
	Actor.Gateway,
];

export const handler = () => {
	const database = new Database("app.db");

	console.log("Creating tables...");
	gateways.forEach(gateway => new gateway(database).build());
}

handler();