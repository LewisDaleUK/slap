import { Key, KeyPair } from "../crypto/mod.ts";
import { Maybe } from "../types.d.ts";

export type ActorEntity = {
	id?: number;
	handle: string;
	preferred_username: string;
	private_key_pem: Maybe<string>;
	public_key_pem: Maybe<string>;
	summary?: string;
	external: boolean;
	inbox: Maybe<string>;
	outbox: Maybe<string>;
	followers: Maybe<string>;
	following: Maybe<string>;
	domain: Maybe<string>;
}

export class Actor {
	public id?: number;
	public handle: string;
	public preferred_username: string;
	public summary?: string;
	public readonly keys: KeyPair;
	public external = false;
	public inbox: Maybe<string>;
	public outbox: Maybe<string>;
	public followers: Maybe<string>;
	public following: Maybe<string>;
	public domain: Maybe<string>;

	constructor(keys: KeyPair) {
		this.keys = keys;
		this.handle = "";
		this.preferred_username = "";

	}

	static async from(entity: ActorEntity): Promise<Actor> {
		const privateKey = entity.private_key_pem
			? await Key.fromPem(entity.private_key_pem, "private")
			: undefined;
		const publicKey = entity.public_key_pem
			? await Key.fromPem(entity.public_key_pem, "public")
			: undefined;

		const actor = new Actor(new KeyPair(privateKey, publicKey));

		actor.handle = entity.handle;
		actor.preferred_username = entity.preferred_username;
		actor.summary = entity.summary || "";
		actor.id = entity.id;
		actor.external = entity.external;
		actor.domain = entity.domain;
		actor.followers = entity.followers;
		actor.following = entity.following;
		actor.inbox = entity.inbox;
		actor.outbox = entity.outbox;

		return actor;
	}

	/**
	 * @returns an ActorProps object with any undefined fields removed
	 */
	public async entity(): Promise<ActorEntity> {
		return JSON.parse(
			JSON.stringify(
				{
					id: this.id,
					handle: this.handle,
					summary: this.summary || "",
					preferred_username: this.preferred_username,
					private_key_pem: await this.keys.privateKey?.toPem(),
					public_key_pem: await this.keys.publicKey?.toPem(),
					external: false,
					inbox: this.inbox || null,
					outbox: this.outbox || null,
					followers: this.followers || null,
					following: this.following || null,
					domain: this.domain || null
				}
			)
		);
	}
}