export const handler = (req: Request, matches: URLPatternResult) : Response => {
	const domain = req.headers.get("host");
	const actor = matches.pathname.groups.actor;

	const actorJson = {
		"@context": [
			"https://www.w3.org/ns/activitystreams",
			"https://w3id.org/security/v1"
		],
		"id": `https://${domain}/${actor}`,
		"type": "Person",
		"preferredUsername": "Lewis Dale's Blog",
		"inbox": `https://${domain}/${actor}/inbox`,
		"followers": `https://${domain}/${actor}/followers`,
		"following": `https://${domain}/${actor}/following`,
		"summary": "Posts, streamed from @lewisdaleuk@dapchat.online 's blog",
		"attachment": [
			{
				"type": "PropertyValue",
				"name": "Website",
				"value": "https://lewisdale.dev"
			}
		],
		"publicKey": {
			"id": `https://${domain}/${actor}#main-key`,
			"owner": `https://${domain}/${actor}`,
			"publicKeyPem": "",
		}
	};

	return new Response(JSON.stringify(actorJson));
}