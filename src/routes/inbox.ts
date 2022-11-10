import { Object } from "../requests/index.ts";

export const handler = async (req: Request): Promise<Response> => {
	let activity: Object;

	switch (req.method) {
		case "POST":
			activity = await req.json() as Object;
			return new Response(JSON.stringify(activity));
		default:
			return new Response("Not found", { status: 404 });
	}
}