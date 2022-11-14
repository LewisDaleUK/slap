import { handler as inbox } from './inbox.ts';
import ActorGateway from "../gateways/Actor.ts";
import Profile from '../views/profile.tsx';
import { Handler } from "../types.ts";


const actor: Handler = async (req, matches) : Promise<Response> => {
	const accept = req.headers.get("accept")?.includes("application/activity+json");

	const site = req.site;
	const actor = await new ActorGateway(req.database).find("handle", matches.pathname.groups.actor);

	if (!actor) {
		return new Response("Not found", { status: 404 });
	}

	const actorUri = `https://${site.domain}/${actor.handle}`;

	const ext = matches.pathname.groups.ext;

	if (ext !== ".json" && !accept) {	
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
		"preferredUsername": actor.handle,
		"inbox": `${actorUri}/inbox`,
		"followers": `${actorUri}/followers`,
		"following": `${actorUri}/following`,
		"summary": actor.summary,
		"name": actor.preferred_username, // TODO: Rename this
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
			"publicKeyPem": await actor.keys.publicKey.toPem(),
		}
	};

	return new Response(JSON.stringify(actorJson));
}

const subroutes: [URLPattern, Handler][] = [
	[new URLPattern({ pathname: "/followers" }), () => new Response("Followers page")],
	[new URLPattern({ pathname: "/inbox" }), inbox],
];

export const handler = async (req: Request, matches: URLPatternResult) : Promise<Response> => {
	const route = subroutes.find(([matcher]) => matcher.test(`.${matches.pathname.groups.path}`, `https://${req.site.domain}`));

	if (route) {
		return route[1](req, route[0].exec(`.${matches.pathname.groups.path}`, `https://${req.site.domain}`) as URLPatternResult);
	}

	return await actor(req, matches);
}