import { Maybe, IGateway } from "../types.ts";
import { SiteDetails } from "./models.ts";
import { Database } from "../lib/Database.ts";

export default class SiteDetailsGateway implements IGateway<SiteDetails> {
	private readonly _database: Database;

	constructor(database: Database) {
		this._database = database;
	}

	build(): void {
		this._database.execute(`
			CREATE TABLE IF NOT EXISTS site (
				id INTEGER PRIMARY KEY,
				domain TEXT NOT NULL,
				title TEXT NOT NULL
			);
		`)
	}

	get(id: number): Maybe<SiteDetails> {
		return this
			._database
			.queryEntries<SiteDetails>(`SELECT * FROM site WHERE id = :id LIMIT 1`, { id })[0];
	}

	find(column: string, value: any): Maybe<SiteDetails> {
		return this
			._database
			.queryEntries<SiteDetails>(`SELECT * FROM site WHERE ${column} = ? LIMIT 1`, [value])[0];
	}

	list(): SiteDetails[] {
		return this
			._database
			.queryEntries<SiteDetails>(`SELECT * FROM site`);
	}

	save(item: SiteDetails): Maybe<string|number> {
		if (item.id) {
			this._database.query("UPDATE site SET domain = :domain, title = :title WHERE id = :id", item);
			return item.id;
		} else {
			this._database.query("INSERT INTO site (domain, title) VALUES (:domain, :title)", item);
			return this._database.lastInsertRowId;
		}
	}

	delete(item: SiteDetails): void {
		if (item.id) {
			this._database.query("DELETE FROM site WHERE id = :id", { id: item.id });
		}
	}
}