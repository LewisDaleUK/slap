import { Activity, Object } from "../requests/index.ts";
import * as Actor from "../actor/mod.ts";
import * as Crypto from "../crypto/mod.ts";

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

	console.log(body);
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