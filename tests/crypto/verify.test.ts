import { verify } from "../../src/crypto/verify.ts";
import { Bytes } from "../../src/crypto/bytes.ts";
import { assert } from "https://deno.land/std@0.163.0/testing/asserts.ts";

Deno.test("Verify certificate", async (t) => {
	let keypair: CryptoKeyPair;

	await t.step("Create keypair", async () => {
		keypair = await crypto.subtle.generateKey({
			name: "RSASSA-PKCS1-v1_5",
			modulusLength: 2048,
			publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
			hash: "SHA-256"
		} as RsaHashedKeyGenParams, true, ["verify", "sign"])
	});

	const secret = "my-string-content";
	let signature: string;

	await t.step("Sign key", async () => {
		signature = Bytes.fromArrayBuffer(
			await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keypair.privateKey, Bytes.fromUtf8(secret).arrayBuffer())
		).base64();
	});

	await t.step("Verify signature", async () => {
		const verified = await verify(keypair.publicKey, signature, secret);
		assert(verified);
	});
});