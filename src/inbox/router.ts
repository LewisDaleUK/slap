import { Activity, Object } from "../requests/index.ts";
import * as Actor from "../actor/mod.ts";
import * as Crypto from "../crypto/mod.ts";
import { Values } from "https://deno.land/x/sqlite@v3.7.0/src/constants.ts";

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

const verify = async (req: Request, activity: Activity): Promise<boolean> => {
	const url = new URL(activity.actor as string);
	const host = url.hostname;

	// TODO: We should use WebFinger to get actual URLs and request using application/activity+json
	const response = await fetch(`${url}`, {
		headers: {
			"accept": "application/activity+json"
		}
	});
	const body = await response.json();
	const inboxFragment = `${req.actor?.handle}/inbox`;

	const key = await Crypto.Key.fromPem(body.publicKey.publicKeyPem as string, "public");
	const signature = extractSignature(req.headers.get("signature") as string);
	const expected = `(request-target): post ${inboxFragment}\nhost: ${req.site.domain}\ndate: ${req.headers.get("date")}\ndigest: ${req.headers.get("digest")}`

	console.log(signature, expected);
	return false;
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

					if (!verified) {
						return new Response(null, { status: 403 });
					}

					// Verify request
					// Send accept
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