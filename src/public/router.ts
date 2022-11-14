// Serve static files
export const handler = (_: Request, matches: URLPatternResult) : Response => {
	const filename = `public/${matches.pathname.groups["0"]}`;

	if (Deno.statSync(filename)) {
		return new Response(Deno.readFileSync(filename));
	}

	return new Response("Not found", { status: 404 });
}