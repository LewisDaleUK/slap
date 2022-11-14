import { Activity } from "../requests/index.ts";
import * as Actor from "../actor/mod.ts";
import * as Crypto from "../crypto/mod.ts";

type SignatureHeaders = {
	keyId: string;
	signature: string;
	algorithm: string;
	headers: string; 
};

const extractSignature = (signature: string): SignatureHeaders => {
	return signature.split(',').reduce((values, current) => {
		const [key, value] = current.split("=", 2);
		const [_, text] = value.split('"', 2);
		values[key] = text;

		return values;
	}, {} as { [k: string]: string }) as SignatureHeaders;
}

const expectedSignature = (headers: SignatureHeaders, req: Request) => 
	headers.headers.split(' ').map(h => {
		if (h === "(request-target)") {
			return `(request-target): post /${req.actor?.handle}/inbox`;
		}
		return `${h}: ${req.headers.get(h)}`;
	}).join('\n');

const headersToSignature = (headers: { [k: string]: string }) =>
	Object.entries(headers)
		.map(([k, v]) => `${k.toLowerCase()}: ${v}`)
		.join('\n');

const verify = async (req: Request, activity: Activity): Promise<boolean> => {
	const response = await fetch(activity.actor as string, {
		headers: {
			"accept": "application/activity+json"
		}
	});
	const body = await response.json();

	const key = await Crypto.Key.fromPem(body.publicKey.publicKeyPem as string, "public");
	const signature = extractSignature(req.headers.get("signature") as string);
	const expected = expectedSignature(signature, req);

	return await key.verify(signature.signature, expected);
}

const sendAcceptMessage = async (req: Request, activity: Activity): Promise<void> => {
	const uuid = crypto.randomUUID();

	const createMessage = {
		"@context": "https://www.w3.org/ns/activitystreams",
	
		"id": `https://${req.site.domain}/${req.actor?.handle}/${uuid}`,
		"type": "Create",
		"actor": `https://${req.site.domain}/${req.actor?.handle}`,
		'to': ['https://www.w3.org/ns/activitystreams#Public'],
		"object": activity,
		"cc": [activity.actor]
	}
	const url = new URL(activity.actor as string);
	const domain = url.hostname;
	const actor = req.url.replace(`https://${domain}`, '');
	const date = new Date();

	const inbox = `${url.toString()}/inbox`; // TODO: Get these URLS from webfinger
	const fragment = `${actor}/inbox`;
	const hash = await Crypto.digest(JSON.stringify(activity));

	const signatureHeaders = {
		"(request-target)": `post ${fragment}`,
		date: date.toUTCString(),
		host: domain,
		digest: `SHA-256=${hash}`,
		"content-type": "application/activity+json"
	};
	const signature = await req.actor?.keys.privateKey.sign(headersToSignature(signatureHeaders));
	const header = `keyId="https://${req.site.domain}/${req.actor?.handle}",headers="host date digest content-type",signature="${signature}"`;
	const headers = {
		Signature: header,
		Date: signatureHeaders.date,
		Host: signatureHeaders.host,
		Digest: signatureHeaders.digest,
		"Content-Type": signatureHeaders["content-type"],
	};

	const res = await fetch(inbox, {
		headers,
		method: "POST",
		body: JSON.stringify(createMessage)
	});

	console.log(res);
	console.log(await res.text());
}

export const handler = async (req: Request): Promise<Response> => {
	let activity: Activity;
	const actor = req.actor as Actor.Model;

	switch (req.method) {
		case "POST":
			activity = await req.json() as Activity;

			switch (activity.type) {
				case "Follow": {
					const verified = await verify(req, activity);

					// Verify request
					if (!verified) {
						return new Response(null, { status: 403 });
					}

					// Send accept
					await sendAcceptMessage(req, activity);

					// Store follower

					return new Response("Follow");
				}
				default: {
					return new Response(JSON.stringify(activity));
				}
			}
		default:
			return new Response("Not found", { status: 404 });
	}
}