import { Database } from "../lib/Database.ts";
import { Actor } from "../models/index.ts";
import { Maybe } from "../types.ts";
import { IGateway } from "./index.ts";

export default class ActorGateway implements IGateway<Actor> {
	private readonly _database: Database;

	constructor(database: Database) {
		this._database = database;
	}

	build(): void {
		this._database.execute(
			`CREATE TABLE IF NOT EXISTS actor (
				id INTEGER PRIMARY KEY,
				handle TEXT NOT NULL,
				preferred_username TEXT NOT NULL,
				summary TEXT NOT NULL DEFAULT ""
			)`
		);
	}

	get(id: string|number): Maybe<Actor> {
		return this._database.queryEntries<Actor>("SELECT * FROM actor WHERE id = ? LIMIT 1", [id])[0];
	}
	
	list(): Actor[] {
		throw new Error("Method not implemented.");
	}
	
	save(item: Actor): Maybe<string|number> {
		if (item.id) {
			this._database.query(
				"UPDATE actor SET handle = :handle, preferred_username = :preferred_username, summary = :summary WHERE id = :id",
				item
			);
			return item.id;
		}

		this._database.query(
			"INSERT INTO actor (handle, preferred_username, summary) VALUES (:handle, :preferred_username, :summary)",
			item
		);
		return this._database.lastInsertRowId;
	}
	
	delete(item: Actor): void {
		this._database.query("DELETE FROM actor WHERE id = ?", [ item.id ]);
	}
}