export const handler = (req: Request, matches: URLPatternResult) : Response => {
	console.log(matches.pathname.groups.actorId);

	const actorJson = {
		id: `${matches.pathname.groups.actorId}@mydomain.com`
	}
	return new Response(JSON.stringify(actorJson));
}