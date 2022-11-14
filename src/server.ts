import { serve } from "https://deno.land/std@0.162.0/http/server.ts";

import { renderToString } from "./deps.ts";

import * as Actor from "./actor/mod.ts";
import * as Site from "./site/mod.ts";
import * as Public from './public/mod.ts';
import * as Webfinger from './webfinger/mod.ts';

import Index from "./views/index.tsx";
import Database from "./lib/Database.ts";

type Handler = (req: Request, match: URLPatternResult) => Response | Promise<Response>;

const routes: [URLPattern, Handler][] = [
	[new URLPattern({ pathname: "/.well-known/webfinger", search: "(resource=)?:resource?" }), Webfinger.router],
	[new URLPattern({ pathname: "/public/*" }), Public.router],
	[new URLPattern({ pathname: "/(@?):actor:path(/followers|/inbox|/outbox)?:ext(\.json)?" }), Actor.router],
	[new URLPattern({ pathname: "/" }), () => new Response( new TextEncoder().encode(renderToString(Index)) )]
];

const handler = async (req: Request): Promise<Response> => {
	console.log(`Received ${req.method} request to ${req.url}`);

	const route = routes.find(([matcher]) => matcher.test(req.url));

	req.database = new Database("app.db");
	req.database.execute("PRAGMA foreign_keys = ON");

	const site  = new Site.Gateway(req.database).find("domain", req.headers.get("host"));

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