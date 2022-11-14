import { assertEquals, assertExists } from "https://deno.land/std@0.163.0/testing/asserts.ts";
import { KeyPair } from "../../crypto/index.ts";
import Database from "../../lib/Database.ts";
import ActorGateway from "../gateway.ts";
import { Actor } from "../models.ts";

Deno.test("ActorGateway", async (t) => {
	const database = new Database(":memory:");
	const gateway = new ActorGateway(database);

	await t.step("Create table", () => {
		gateway.build();
	});

	let actorId: number;
	const actor = new Actor(
		"username",
		"Display Name",
		await KeyPair.generate(),
		"A summary",
	);

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

