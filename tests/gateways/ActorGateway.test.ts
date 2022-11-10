import { assertEquals, assertExists } from "https://deno.land/std@0.163.0/testing/asserts.ts";
import ActorGateway from "../../src/gateways/Actor.ts";
import Database from "../../src/lib/Database.ts";

Deno.test("ActorGateway", async (t) => {
	const database = new Database(":memory:");
	const gateway = new ActorGateway(database);

	await t.step("Create table", () => {
		gateway.build();
	});

	let actorId: number;
	const actor = {
		handle: "username",
		preferred_username: "Display Name",
		summary: "A summary"
	};
	await t.step("Add a new actor", () => {
		const id = gateway.save(actor);
		assertExists(id);

		actorId = id as number;
	});

	await t.step("Get an actor by id", () => {
		const retrieved = gateway.get(actorId);

		assertExists(retrieved);
		assertEquals(retrieved, { ...actor, id: actorId });
	});

	await t.step("Get an actor by handle", () => {
		const retrieved = gateway.find("handle", actor.handle);

		assertExists(retrieved);
		assertEquals(retrieved, { ...actor, id: actorId });
	});

	await t.step("Update an actor", () => {
		const updated = {
			id: actorId,
			handle: "New username",
			preferred_username: "An Updated Display Name",
			summary: "More of a summary"
		};
		gateway.save(updated);
		const retrieved = gateway.get(actorId);

		assertEquals(retrieved, updated);
	});

	await t.step("Delete an actor", () => {
		gateway.delete({ id: actorId, ...actor });
		assertEquals(gateway.get(actorId), undefined);
	});
});

