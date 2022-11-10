import { Database } from "./lib/Database.ts";

export type Maybe<T> = T | undefined | null;

declare global {
	interface Request {
		database: Database;
	}
}