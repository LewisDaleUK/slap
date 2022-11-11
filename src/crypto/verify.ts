import { Bytes } from "./bytes.ts"

export const verify = async (key: CryptoKey, signature: string, data: string) => {
	return await crypto.subtle.verify(
		"RSASSA-PKCS1-v1_5",
		key,
		Bytes.fromBase64(signature).arrayBuffer(),
		Bytes.fromUtf8(data).arrayBuffer()
	);
}