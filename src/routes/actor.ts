import ActorGateway from "../gateways/Actor.ts";

import Profile from '../views/profile.tsx';

export const handler = (req: Request, matches: URLPatternResult) : Response => {
	const site = req.site;
	const actor = new ActorGateway(req.database).find("handle", matches.pathname.groups.actor);

	if (!actor) {
		return new Response("Not found", { status: 404 });
	}

	const actorUri = `https://${site.domain}/${actor.handle}`;

	const ext = matches.pathname.groups.ext;

	if (ext !== ".json") {	
		return new Response(
			new TextEncoder().encode(Profile(actor))
		);
	}
			
	const actorJson = {
		"@context": [
			"https://www.w3.org/ns/activitystreams",
			"https://w3id.org/security/v1"
		],
		"id": actorUri,
		"type": "Person",
		"preferredUsername": actor.preferred_username,
		"inbox": `${actorUri}/inbox`,
		"followers": `${actorUri}/followers`,
		"following": `${actorUri}/following`,
		"summary": actor.summary,
		"attachment": [
			{
				"type": "PropertyValue",
				"name": "Website",
				"value": "https://lewisdale.dev"
			}
		],
		"publicKey": {
			"id": `${actorUri}#main-key`,
			"owner": actorUri,
			"publicKeyPem": "",
		}
	};

	return new Response(JSON.stringify(actorJson));
}