import { Maybe } from "../types.ts";
import { IGateway } from "./index.ts";
import { SiteDetails } from "../models/index.ts";
import { Database } from "../lib/Database.ts";

export default class SiteDetailsGateway implements IGateway<SiteDetails> {
	private readonly _database: Database;

	constructor(database: Database) {
		this._database = database;
	}

	get(id: string): Maybe<SiteDetails> {
		return this
			._database
			.queryEntries<SiteDetails>(`SELECT * FROM site WHERE id = :id LIMIT 1`, { id })[0];
	}

	list(): SiteDetails[] {
		return this
			._database
			.queryEntries<SiteDetails>(`SELECT * FROM site`);
	}

	save(item: SiteDetails): Maybe<string|number> {
		throw new Error("Method not implemented.");
	}

	delete(item: SiteDetails): void {
		throw new Error("Method not implemented.");
	}
}