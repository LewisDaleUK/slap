import { assertEquals, assertExists } from "https://deno.land/std@0.164.0/testing/asserts.ts";
import Gateway from "../gateway.ts";
import Database from "../../lib/Database.ts";

Deno.test("SiteDetailsGateway", async (t) => {
	const database = new Database(":memory:");
	const gateway = new Gateway(database);

	await t.step("Create table", () => {
		gateway.build();
	});

	let siteId: number;
	const site = {
		domain: "My domain",
		title: "My title"
	};
	await t.step("Add a new site", () => {
		const id = gateway.save(site);
		assertExists(id);

		siteId = id as number;
	});

	await t.step("Get a site by id", () => {
		const retrieved = gateway.get(siteId);

		assertExists(retrieved);
		assertEquals(retrieved, { ...site, id: siteId });
	});

	await t.step("Get a site by domain", () => {
		const retrieved = gateway.find("domain", site.domain);

		assertExists(retrieved);
		assertEquals(retrieved, { ...site, id: siteId });
	});
	
	await t.step("Update a site", () => {
		const updated = {
			id: siteId,
			domain: "My new domain",
			title: "My new title",
		};
		gateway.save(updated);
		const retrieved = gateway.get(siteId);

		assertEquals(retrieved, updated);
	});

	await t.step("Delete a site", () => {
		gateway.delete({ id: siteId, ...site });
		assertEquals(gateway.get(siteId), undefined);
	});
});

