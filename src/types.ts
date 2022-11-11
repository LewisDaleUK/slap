import { Database } from "./lib/Database.ts";
import { SiteDetails } from "./models/index.ts";

export type Maybe<T> = T | undefined | null;
export type Handler = (req: Request, match: URLPatternResult) => Response | Promise<Response>;

declare global {
	interface Request {
		database: Database;
		site: SiteDetails;
	}

}