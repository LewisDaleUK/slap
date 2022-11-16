import { Activity } from "../requests/index.ts";
import * as Crypto from "../crypto/mod.ts";
import * as Signature from "../message/utils/signature.ts";

const verify = async (req: Request, activity: Activity): Promise<boolean> => {
	const response = await fetch(activity.actor as string, {
		headers: {
			"accept": "application/activity+json"
		}
	});
	const body = await response.json();

	const key = await Crypto.Key.fromPem(body.publicKey.publicKeyPem as string, "public");
	const signature = Signature.extractSignature(req.headers.get("signature") as string);
	const expected = Signature.expectedSignature(signature, req);

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
	const actor = (activity.actor as string).replace(`https://${domain}`, '');
	const date = new Date();

	const inbox = `${url.toString()}/inbox`; // TODO: Get these URLS from webfinger
	const fragment = `${actor}/inbox`;
	const hash = await Crypto.digest(JSON.stringify(createMessage));

	const signatureHeaders = {
		"(request-target)": `post ${fragment}`,
		host: domain,
		date: date.toUTCString(),
		digest: `SHA-256=${hash}`,
		"content-type": "application/activity+json"
	};

	const signature = await req.actor?.keys.privateKey?.sign(Signature.headersToSignature(signatureHeaders));
	const header = `keyId="https://${req.site.domain}/${req.actor?.handle}",headers="(request-target) host date digest content-type",signature="${signature}"`;
	const headers = {
		Signature: header,
		Host: signatureHeaders.host,
		Date: signatureHeaders.date,
		Digest: signatureHeaders.digest,
		"Content-Type": signatureHeaders["content-type"],
	};

	await fetch(inbox, {
		headers,
		method: "POST",
		body: JSON.stringify(createMessage)
	});

}

export const handler = async (req: Request): Promise<Response> => {
	let activity: Activity;

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