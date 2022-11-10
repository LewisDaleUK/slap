import { DB } from "https://deno.land/x/sqlite/mod.ts";

export default class Database {
	private readonly _database: DB;

	constructor(dbname: string = ":memory:") {
		this._database = new DB(dbname);

		this._database.execute(`PRAGMA foreign_keys = ON`);
	}
}