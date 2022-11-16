import { assertEquals, assertExists } from "../../testdeps.ts";
import {
	assertSpyCall,
	assertSpyCalls,
	returnsNext,
	stub,
  } from "https://deno.land/std@0.164.0/testing/mock.ts";
import Database from "../../lib/Database.ts";
import { Key, KeyPair } from "../../crypto/mod.ts";
import ActorGateway from "../gateway.ts";
import { Actor, ActorEntity } from "../models.ts";

Deno.test("ActorGateway", async (t) => {
	const database = new Database(":memory:");
	const gateway = new ActorGateway(database);

	await t.step("Create tables", () => {
		gateway.build();
	});

	let actorId: number;
	const actor = await Actor.from({
		handle: "My handle",
		preferred_username: "My preferred username",
		followers: null,
		following: null,
		private_key_pem: undefined,
		public_key_pem: undefined,
		external: false,
		inbox: null,
		outbox: null,
		domain: null,
	});

	await t.step("Add a new actor", async () => {
		const id = await gateway.save(actor);
		assertExists(id);

		actorId = id as number;
	});

	await t.step("Get an actor by id", async () => {
		const retrieved = await gateway.get(actorId);

		const expected = await Actor.from({ ...await actor.entity(), id: actorId });
		assertExists(retrieved);
		assertEquals(retrieved, expected);
	});

	await t.step("Get an actor by handle", async () => {
		const retrieved = await gateway.find("handle", actor.handle);

		const expected = await Actor.from({ ...await actor.entity(), id: actorId });

		assertExists(retrieved);
		assertEquals(retrieved, expected);
	});

	await t.step("Update an actor", async () => {
		const updated = await Actor.from({
			...await actor.entity(),
			id: actorId,
			handle: "New handle",
			preferred_username: "An Updated Display Name",
			summary: "More summaries"
		});
			
		await gateway.save(updated);
		const retrieved = await gateway.get(actorId);

		assertEquals(retrieved, updated);
	});

	await t.step("Delete an actor", async () => {
		gateway.delete(await Actor.from({ ...await actor.entity(), id: actorId }));
		assertEquals(await gateway.get(actorId), undefined);
	});
});

Deno.test("Retrieving remote actors", async (t) => {
	const database = new Database(':memory:');
	const gateway = new ActorGateway(database);

	await t.step("Build tables", () => {
		gateway.build();
	});
	const webfinger = {
		subject: "testhandle@domain.com",
		aliases: [
			`https://domain.com/@testhandle`,
			`https://domain.com/users/testhandle`,
		],
		links: [
			{
				rel: "http://webfinger.net/rel/profile-page",
				type: "text/html",
				href: `https://domain.com/@testhandle`
			},
			{
				rel: "self",
				type: "application/activity+json",
				href: `https://domain.com/users/testhandle`
			}
		]
	};
	const ldJson = {
		"@context": [
		"https://www.w3.org/ns/activitystreams",
		"https://w3id.org/security/v1"
		],
		"id": "https://domain.com/users/testhandle",
		"type": "Person",
		"preferredUsername": "testhandle",
		"inbox": "https://domain.com/users/testhandle/inbox",
		"outbox": "https://domain.com/users/testhandle/outbox",
		"followers": "https://domain.com/users/testhandle/followers",
		"following": "https://domain.com/users/testhandle/following",
		"summary": "",
		"name": "Test User",
		"publicKey": {
			"id": "https://domain.com/users/testhandle/#main-key",
			"owner": "https://domain.com/users/testhandle",
			"publicKeyPem": await (await KeyPair.generate()).publicKey?.toPem()
		}
	};
	await t.step("Retrieve external actor for the first time", async () => {
		
		const fetchstub = stub(
			window,
			'fetch',
			returnsNext([
				new Promise(resolve => resolve(
					new Response(JSON.stringify(webfinger))
				)),
				new Promise(resolve => resolve(new Response(JSON.stringify(ldJson)))),
			])
		);
		const actor = await gateway.get_external("testhandle", "domain.com");
		
		assertSpyCall(fetchstub, 0, { args: ['https://domain.com/.well-known/webfinger?resource=testhandle@domain.com'] });
		assertSpyCall(fetchstub, 1, {
			args: [
				'https://domain.com/users/testhandle',
				{
					headers: {
						"Content-Type": "application/activity+json",
					}
				}
			],
		});

		const expected = {
			id: 1,
			handle: "testhandle",
			summary: "",
			preferred_username: "testhandle",
			public_key_pem: ldJson.publicKey.publicKeyPem,
			external: true,
			inbox: ldJson.inbox,
			outbox: ldJson.outbox,
			followers: ldJson.followers,
			following: ldJson.following,
			domain: "domain.com"
		} as ActorEntity;
		assertEquals(await actor?.entity(), expected);
		fetchstub.restore();
	});

	await t.step("Should fetch the actor from the database a second time", async () => {
		const fetchstub = stub(window, 'fetch');
		const actor = await gateway.get_external("testhandle", "domain.com");

		assertSpyCalls(fetchstub, 0);

		assertEquals(
			await actor?.entity(),
			{
				id: 1,
				handle: "testhandle",
				summary: "",
				preferred_username: "testhandle",
				public_key_pem: ldJson.publicKey.publicKeyPem,
				external: true,
				inbox: ldJson.inbox,
				outbox: ldJson.outbox,
				followers: ldJson.followers,
				following: ldJson.following,
				domain: "domain.com",
			} as ActorEntity
		);
	});
});

