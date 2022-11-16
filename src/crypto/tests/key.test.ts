import { assert, assertEquals, assertStringIncludes } from "../../testdeps.ts";
import { Key, KeyPair } from "../key.ts";

Deno.test("Convert a key to PEM and back again", async (t) => {
	let keypair: KeyPair;

	await t.step("Generate keypair", async () => {
		keypair = await KeyPair.generate();
	});

	let publicPem: string;
	let privatePem: string;

	await t.step("Convert keys to PEM", async () => {
		publicPem = await keypair.publicKey?.toPem() as string;
		assertStringIncludes(publicPem, "BEGIN PUBLIC KEY");

		privatePem = await keypair.privateKey?.toPem() as string;
		assertStringIncludes(privatePem, "BEGIN PRIVATE KEY");
	});

	await t.step("Convert private key back", async () => {
		const key = await Key.fromPem(privatePem, "private");

		assertEquals(key.toPem(), keypair.privateKey?.toPem());
	});

	await t.step("Convert public key back", async () => {
		const key = await Key.fromPem(publicPem, "public");

		assertEquals(key.toPem(), keypair.publicKey?.toPem());
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
		signature = await keypair.privateKey?.sign(secret) as string;
	});

	await t.step("Verify signature", async () => {
		const verified = await keypair.publicKey?.verify(signature, secret);
		assert(verified);
	});
});

Deno.test("Can decode PEM from external source", async (t) => {
	const keyPem = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzasvy2Md90rEdFUhhQwm\nI2vj4zyJwiLdsJztacG1pNNbEbxwZFylJc4o30rOTqQ/jr5tGNPnJqxe0gOP49QV\nBRRIl2/0IP09JqyjmGNhjIi/FNAh+kntgYsxnUvQNPpYp0bqKfffIOFLBEwSfrxp\nCTS4g2zQARlaj85XaAXTawHH034bSlN9esuO6xvXY84XJK0gsHSluUvbw3mDBawp\nijXBVWi0xWRbNd7Sghkva9HfVwooPoMAWnyB8tVhtK7i8whlO9mU1WO6Hyecb9PQ\ncFSYhyZi0u94yVaJRptwQiBZ5uq+DFL2/tkhea3Sf6VXR9mzGvvzWEj0vAhoQERb\nRwIDAQAB\n-----END PUBLIC KEY-----\n";

	const key = await Key.fromPem(keyPem, "public");
	assertStringIncludes(keyPem, await key.toPem());
})