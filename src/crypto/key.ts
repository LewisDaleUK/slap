import { Bytes } from "./bytes.ts";

const chunk = <T> (value: string | T[], size: number): (string | T[])[] => {
	const chunks = [];
	for(let i = 0; i < value.length; i += size) {
		chunks.push(value.slice(i, i + size));
	}

	return chunks;
}

type KeyType = "public" | "private";

export class Key {
	private _key: CryptoKey;
	public readonly type: KeyType;

	constructor(key: CryptoKey, type: KeyType) {
		this._key = key;
		this.type = type;
	}
 
	static async fromPem(pem: string, type: KeyType): Promise<Key> {
		const content = pem.trim()
			.replace(`-----BEGIN ${type.toUpperCase()} KEY-----`, '')
			.replace(`-----END ${type.toUpperCase()} KEY-----`, '')
			.replaceAll(/\s+/g, '');

		const bytes = Bytes.fromBase64(content).arrayBuffer();
		return new Key(
			await crypto.subtle.importKey(
				type === "private" ? "pkcs8" : "spki",
				bytes,
				{
					name: "RSASSA-PKCS1-v1_5",
					hash: "SHA-256"
				},
				true,
				[type === 'private' ? 'sign' : 'verify']
			),
			type
		);
	}

	public async toPem(): Promise<string> {
		const bytes = Bytes.from(await crypto.subtle.exportKey(this.type === "private" ? "pkcs8" : "spki", this._key));
		const base64 = chunk(bytes.base64(), 64).join('\n');

		return `-----BEGIN ${this.type.toUpperCase()} KEY-----
		${base64}
		-----END ${this.type.toUpperCase()} KEY-----`.replaceAll('\t', '');
	}

	public async verify(signature: string, data: string): Promise<boolean> {
		return await crypto.subtle.verify(
			"RSASSA-PKCS1-v1_5",
			this._key,
			Bytes.fromBase64(signature).arrayBuffer(),
			Bytes.fromUtf8(data).arrayBuffer()
		);
	}

	/**
	 * @param data text-encoded data to sign
	 * @returns a base64-encoded string containing the signature of the data
	 */
	public async sign(data: string): Promise<string> {
		return Bytes.from(
			await crypto.subtle.sign("RSASSA-PKCS1-v1_5", this._key, Bytes.fromUtf8(data).arrayBuffer())
		).base64();
	}
}

export class KeyPair {
	public privateKey?: Key;
	public publicKey?: Key;

	constructor(privateKey?: Key, publicKey?: Key) {
		this.privateKey = privateKey;
		this.publicKey = publicKey;
	}

	static async generate(modulusLength = 2048): Promise<KeyPair> {
		const { privateKey, publicKey } = await crypto.subtle.generateKey({
			name: "RSASSA-PKCS1-v1_5",
			modulusLength,
			publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
			hash: "SHA-256"
		} as RsaHashedKeyGenParams, true, ["verify", "sign"]);
		return new KeyPair(
			new Key(privateKey, "private"),
			new Key(publicKey, "public")
		);
	}
}