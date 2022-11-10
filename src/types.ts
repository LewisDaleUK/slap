import { Database } from "./lib/Database.ts";
import { SiteDetails } from "./models/index.ts";

export type Maybe<T> = T | undefined | null;

declare global {
	interface Request {
		database: Database;
		site: SiteDetails;
	}
}