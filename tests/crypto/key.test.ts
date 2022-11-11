import { assertEquals, assertObjectMatch, assertStringIncludes } from "https://deno.land/std@0.163.0/testing/asserts.ts";
import { pem, unpem } from "../../src/crypto/key.ts";

Deno.test("Convert a key to PEM and back again", async (t) => {
	let keypair: CryptoKeyPair;

	await t.step("Generate keypair", async () => {
		keypair = await crypto.subtle.generateKey({
			name: "RSASSA-PKCS1-v1_5",
			modulusLength: 2048,
			publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
			hash: "SHA-256"
		} as RsaHashedKeyGenParams, true, ["verify", "sign"]);
	});

	let publicPem: string;
	let privatePem: string;

	await t.step("Convert keys to PEM", async () => {
		publicPem = await pem(keypair.publicKey, "public");
		assertStringIncludes(publicPem, "BEGIN PUBLIC KEY");

		privatePem = await pem(keypair.privateKey, "private");
		assertStringIncludes(privatePem, "BEGIN PRIVATE KEY");
	});

	await t.step("Convert private key back", async () => {
		const key = await unpem(privatePem, "private");
		const exported = await crypto.subtle.exportKey("pkcs8", key);
		const exportedOriginal = await crypto.subtle.exportKey("pkcs8", keypair.privateKey);

		assertEquals(exported, exportedOriginal);
	});

	await t.step("Convert public key back", async () => {
		const key = await unpem(publicPem, "public");
		const exported = await crypto.subtle.exportKey("spki", key);
		const exportedOriginal = await crypto.subtle.exportKey("spki", keypair.publicKey);

		assertEquals(exported, exportedOriginal);
	});
});