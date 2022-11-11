import ActorGateway from "../gateways/Actor.ts";
import SiteDetailsGateway from "../gateways/SiteDetails.ts";
import type { Handler } from "../types.ts";

export const handler: Handler = (req, matches) => {
	const resource = matches.search.groups.resource;

	if (resource) {
		const [_type, id] = resource.split(/\:(.*)/, 2);
		const [handle, domain] = id.split("@", 2);

		const site = new SiteDetailsGateway(req.database).find("domain", domain);

		if (!site) {
			return new Response(null, { status: 404 });
		}

		const actor = new ActorGateway(req.database).find("handle", handle);

		if (!actor) {
			return new Response(null, { status: 404 });
		}

		const webfinger = {
			subject: resource,
			aliases: [
				`https://${req.site.domain}/@${actor.handle}`,
				`https://${req.site.domain}/${actor.handle}`,
			],
			links: [
				{
					rel: "http://webfinger.net/rel/profile-page",
					type: "text/html",
					href: `https://${req.site.domain}/@${actor.handle}`
				},
				{
					rel: "self",
					type: "application/activity+json",
					href: `https://${req.site.domain}/${actor.handle}`
				}
			]
		};
		return new Response(JSON.stringify(webfinger), { status: 200 });
	}
	return new Response(null, { status: 400 });
}