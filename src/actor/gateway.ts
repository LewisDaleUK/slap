import { Database } from "../lib/Database.ts";
import { Actor, ActorEntity } from "./models.ts";
import { Maybe, IGateway } from "../types.d.ts";
import { ActorLdJson, Object, WebFinger } from "../requests/index.ts";
import { Key, KeyPair } from "../crypto/key.ts";

export default class ActorGateway implements IGateway<Actor> {
	private readonly _database: Database;

	constructor(database: Database) {
		this._database = database;
	}

	private async map(row?: ActorEntity): Promise<Maybe<Actor>> {
		if (row) {
			// SQlite returns booleans as integers - force value to be a bool
			row.external = !!row.external;
			return await Actor.from(row);
		}

		return;
	}

	build(): void {
		this._database.execute(
			`CREATE TABLE IF NOT EXISTS actor (
				id INTEGER PRIMARY KEY,
				handle TEXT NOT NULL,
				preferred_username TEXT NOT NULL,
				summary TEXT NOT NULL DEFAULT "",
				public_key_pem TEXT,
				private_key_pem TEXT,
				external BOOLEAN NOT NULL DEFAULT FALSE,
				inbox TEXT,
				outbox TEXT,
				followers TEXT,
				following TEXT,
				domain TEXT
			)`
		);
	}

	async get(id: string|number): Promise<Maybe<Actor>> {
		return await this.map(
			this._database.queryEntries<ActorEntity>("SELECT * FROM actor WHERE id = ? LIMIT 1", [id])[0]
		);
	}

	async find(column: string, value: Maybe<number | string>): Promise<Maybe<Actor>> {
		return await this.map(
			this._database.queryEntries<ActorEntity>(`SELECT * FROM actor WHERE ${column} = ? LIMIT 1`, [value])[0]
		);
	}
	
	list(): Actor[] {
		throw new Error("Method not implemented.");
	}
	
	async save(item: Actor): Promise<Maybe<string|number>> {
		const entity = await item.entity();

		if (item.id) {
			this._database.query<ActorEntity[]>(
				`UPDATE actor SET
					handle = :handle,
					preferred_username = :preferred_username,
					summary = :summary,
					private_key_pem = :private_key_pem,
					public_key_pem = :public_key_pem,
					external = :external,
					domain = :domain,
					inbox = :inbox,
					outbox = :outbox,
					followers = :followers,
					following = :following
				WHERE id = :id`,
				entity
			);
			return item.id;
		}

		this._database.query<ActorEntity[]>(
			`INSERT INTO actor (
				handle,
				preferred_username,
				summary,
				public_key_pem,
				private_key_pem,
				external,
				domain,
				inbox,
				outbox,
				followers,
				following
			) VALUES (
				:handle,
				:preferred_username,
				:summary,
				:public_key_pem,
				:private_key_pem,
				:external,
				:domain,
				:inbox,
				:outbox,
				:followers,
				:following
			)`,
			entity,
		);
		return this._database.lastInsertRowId;
	}
	
	delete(item: Actor): void {
		this._database.query("DELETE FROM actor WHERE id = ?", [ item.id ]);
	}

	async get_external(handle: string, domain: string): Promise<Maybe<Actor>> {
		let actor = await this.map(
			this._database.queryEntries<ActorEntity>(`SELECT * FROM actor WHERE handle = ? AND domain = ?`, [handle, domain])[0]
		);

		if (actor) {
			return actor;
		}

		const response = await fetch(`https://${domain}/.well-known/webfinger?resource=${handle}@${domain}`);
		const body = await response.json() as WebFinger;

		const selfLink = body.links.find(link => link.rel === "self");

		if (selfLink) {
			const ldJson = await (await fetch(selfLink.href, {
				headers: {
					"Content-Type": selfLink.type as string
				}
			})).json() as ActorLdJson;

			const actor = await Actor.from({
				handle,
				domain,
				external: true,
				public_key_pem: ldJson.publicKey.publicKeyPem,
				private_key_pem: null,
				followers: ldJson.followers as string,
				following: ldJson.following as string,
				inbox: ldJson.inbox as string,
				outbox: ldJson.outbox as string,
				preferred_username: ldJson.preferredUsername,
			});

			const id = await this.save(actor);
			actor.id = id as number;

			return actor;
		}

		return null;
	}
}