import { serve } from "https://deno.land/std@0.162.0/http/server.ts";

import { handler as inbox } from "./routes/inbox.ts";
import { handler as actor } from "./routes/actor.ts";

type Handler = (req: Request, match: URLPatternResult) => Response;

const routes: [URLPattern, Handler][] = [
	[new URLPattern({ pathname: "/followers" }), () => new Response("This is where the followers live"),],
	[new URLPattern({ pathname: "/inbox" }), inbox],
	[new URLPattern({ pathname: "/output" }), () => new Response("Outbox")],
	[new URLPattern({ pathname: "/:actorId" }), actor],
	[new URLPattern({ pathname: "/" }), () => new Response("Hello, welcome to S.L.A.P." )]
];

const handler = (req: Request): Response => {
	const route = routes.find(([matcher]) => matcher.test(req.url));

	if (route) {
		const [matcher, handler] = route;
		return handler(req, matcher.exec(req.url) as URLPatternResult);
	}

	return new Response("Not found", {
		status: 404,
		statusText: "Not found"
	});
}

serve(handler, { port: 8000 });