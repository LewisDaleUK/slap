import { assert, assertEquals, assertStringIncludes } from "https://deno.land/std@0.163.0/testing/asserts.ts";
import { Key, KeyPair } from "../key.ts";

Deno.test("Convert a key to PEM and back again", async (t) => {
	let keypair: KeyPair;

	await t.step("Generate keypair", async () => {
		keypair = await KeyPair.generate();
	});

	let publicPem: string;
	let privatePem: string;

	await t.step("Convert keys to PEM", async () => {
		publicPem = await keypair.publicKey.toPem();
		assertStringIncludes(publicPem, "BEGIN PUBLIC KEY");

		privatePem = await keypair.privateKey.toPem()
		assertStringIncludes(privatePem, "BEGIN PRIVATE KEY");
	});

	await t.step("Convert private key back", async () => {
		const key = await Key.fromPem(privatePem, "private");

		assertEquals(key.toPem(), keypair.privateKey.toPem());
	});

	await t.step("Convert public key back", async () => {
		const key = await Key.fromPem(publicPem, "public");

		assertEquals(key.toPem(), keypair.publicKey.toPem());
	});
});

Deno.test("Verify certificate", async (t) => {
	let keypair: KeyPair;

	await t.step("Create keypair", async () => {
		keypair = await KeyPair.generate();
	});

	const secret = "my-string-content";
	let signature: string;

	await t.step("Sign key", async () => {
		signature = await keypair.privateKey.sign(secret);
	});

	await t.step("Verify signature", async () => {
		const verified = await keypair.publicKey.verify(signature, secret);
		assert(verified);
	});
});