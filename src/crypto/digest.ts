import { Bytes } from "./bytes.ts"

export const digest = async (data: string) => {
	return Bytes.from(
		await crypto.subtle.digest("SHA-256", Bytes.fromUtf8(data).arrayBuffer())
	).base64();
}