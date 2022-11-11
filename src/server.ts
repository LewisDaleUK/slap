import { serve } from "https://deno.land/std@0.162.0/http/server.ts";

import { renderToString } from "./deps.ts";

import { handler as inbox } from "./routes/inbox.ts";
import { handler as actor } from "./routes/actor.ts";
import { handler as publicFiles } from "./routes/public.ts";

import Index from "./views/index.tsx";
import Database from "./lib/Database.ts";
import SiteDetailsGateway from "./gateways/SiteDetails.ts";

type Handler = (req: Request, match: URLPatternResult) => Response | Promise<Response>;

const routes: [URLPattern, Handler][] = [
	[new URLPattern({ pathname: "/public/*" }), publicFiles],
	[new URLPattern({ pathname: "/:actor/followers" }), () => new Response("This is where the followers live"),],
	[new URLPattern({ pathname: "/:actor/inbox" }), inbox],
	[new URLPattern({ pathname: "/:actor/output" }), () => new Response("Outbox")],
	[new URLPattern({ pathname: "/(@?):actor:ext(\.json)?" }), actor],
	[new URLPattern({ pathname: "/" }), () => new Response( new TextEncoder().encode(renderToString(Index)) )]
];

const handler = async (req: Request): Promise<Response> => {
	const route = routes.find(([matcher]) => matcher.test(req.url));

	req.database = new Database("app.db");
	req.database.execute("PRAGMA foreign_keys = ON");

	const site  = new SiteDetailsGateway(req.database).find("domain", req.headers.get("host"));

	if (!site) {
		return new Response("Site not found", { status: 404 });
	}

	req.site = site;

	if (route) {
		const [matcher, handler] = route;
		return await handler(req, matcher.exec(req.url) as URLPatternResult);
	}

	return new Response("Route not found", {
		status: 404,
		statusText: "Not found"
	});
}

serve(handler, { port: 8000 });