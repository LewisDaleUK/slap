import * as Actor from "../actor/mod.ts";
import * as Site from "../site/mod.ts";
import type { Handler } from "../types.d.ts";

export const handler: Handler = async (req, matches) => {
	const resource = matches.search.groups.resource;

	if (resource) {
		const [_type, id] = resource.split(/\:(.*)/, 2);
		const [handle, domain] = id.split("@", 2);

		const site = new Site.Gateway(req.database).find("domain", domain);

		if (!site) {
			return new Response(null, { status: 404 });
		}

		const actor = await new Actor.Gateway(req.database).find("handle", handle);

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