import { Activity, Object, ActivityType } from "../requests/index.ts";

export const handler = async (req: Request): Promise<Response> => {
	let activity: Activity;

	switch (req.method) {
		case "POST":
			activity = await req.json() as Activity;

			switch (activity.type) {
				case "Follow":
					return new Response("Follow");
				default:
					return new Response(JSON.stringify(activity));
			}
		default:
			return new Response("Not found", { status: 404 });
	}
}