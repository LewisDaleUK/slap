import { Actor } from "../../actor/models.ts";
import { assertEquals } from "../../testdeps.ts";
import * as Signature from "../utils/signature.ts";

Deno.test("Extract signature", () => {
	const signature = `keyId="123456",headers="host date digest",algorithm="SHA-256",signature="abcdeferdasdas"`;
	const expected = {
		keyId: "123456",
		headers: "host date digest",
		algorithm: "SHA-256",
		signature: "abcdeferdasdas",
	};
	const result = Signature.extractSignature(signature);
	assertEquals(expected, result);
});

Deno.test("Calculate expected headers", async () => {
	const req = new Request("http://a.url", {
		headers: {
			"Host": "my-host",
			"Date": "a-date",
			"Digest": `SHA-256="asdzxdasdasdas"`,
		},
	});
	req.actor = await Actor.from({
		handle: "myhandle",
		preferred_username: "Preferred username",
		private_key_pem: null,
		public_key_pem: null,
		summary: "",
		external: false,
		inbox: null,
		outbox: null,
		followers: null,
		following: null,
		domain: null
	});

	const headers = {
		headers: "(request-target) host date digest"
	} as Signature.SignatureHeaders;

	const expected = `(request-target): post /myhandle/inbox\nhost: my-host\ndate: a-date\ndigest: SHA-256="asdzxdasdasdas"`;
	const result = Signature.expectedSignature(headers, req);
	assertEquals(expected, result);
});

Deno.test("Header to signature", () => {
	const expected = `(request-target): post /myhandle/inbox\nhost: my-host\ndate: a-date\ndigest: SHA-256="asdzxdasdasdas"`;
	const headers = {
		"(request-target)": "post /myhandle/inbox",
		"Host": "my-host",
		"Date": "a-date",
		"Digest": `SHA-256="asdzxdasdasdas"`,
	};
	const result = Signature.headersToSignature(headers);
	assertEquals(expected, result);
});
