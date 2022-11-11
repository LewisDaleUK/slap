import { Bytes } from "./bytes.ts";

const chunk = (value: string | any[], size: number): (string | any[])[] => {
	const chunks = [];
	for(let i = 0; i < value.length; i += size) {
		chunks.push(value.slice(i, i + size));
	}

	return chunks;
}

export const pem = async (key: CryptoKey, type: "private" | "public"): Promise<string> => {
	const bytes = Bytes.from(await crypto.subtle.exportKey(type === "private" ? "pkcs8" : "spki", key));
	const base64 = chunk(bytes.base64(), 64).join('\n');

	return `-----BEGIN ${type.toUpperCase()} KEY-----
	${base64}
	-----END ${type.toUpperCase()} KEY-----`;
}

export const unpem = async (pem: string, type: "private" | "public"): Promise<CryptoKey> => {
	const content = pem.substring(`-----BEGIN ${type.toUpperCase()} KEY-----`.length, pem.length - `-----END ${type.toUpperCase()} KEY-----`.length).replaceAll(/\s+/g, '');

	const bytes = Bytes.fromBase64(content).arrayBuffer();
	return await crypto.subtle.importKey(
		type === "private" ? "pkcs8" : "spki",
		bytes,
		{
			name: "RSASSA-PKCS1-v1_5",
			hash: "SHA-256"
		},
		true,
		[type === 'private' ? 'sign' : 'verify']
	);
}