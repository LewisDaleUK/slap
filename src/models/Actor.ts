import { Key, KeyPair } from "../crypto/index.ts";

export type ActorEntity = {
	id?: number;
	handle: string;
	preferred_username: string;
	private_key_pem: string;
	public_key_pem: string;
	summary?: string;
}
export class Actor {
	public id?: number;
	public handle: string;
	public preferred_username: string;
	public summary?: string;
	public readonly keys: KeyPair;

	constructor(handle: string, preferred_username: string, keys: KeyPair, summary?: string, id?: number) {
		this.id = id;
		this.handle = handle;
		this.preferred_username = preferred_username;
		this.summary = summary;
		this.keys = keys;
	}

	static async from(props: ActorEntity): Promise<Actor> {
		const privateKey = await Key.fromPem(props.private_key_pem, "private");
		const publicKey = await Key.fromPem(props.public_key_pem, "public");

		return new Actor(
			props.handle,
			props.preferred_username,
			new KeyPair(privateKey, publicKey),
			props.summary || "",
			props.id,
		);
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
					private_key_pem: await this.keys.privateKey.toPem(),
					public_key_pem: await this.keys.publicKey.toPem()
				}
			)
		);
	}
};