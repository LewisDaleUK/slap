import { Database } from "./lib/Database.ts";
import { SiteDetails } from "./models/index.ts";

export type Maybe<T> = T | undefined | null;
export type Handler = (req: Request, match: URLPatternResult) => Response | Promise<Response>;

export interface IGateway<T> {
	build(): void;
	get(id: string | number): Maybe<T> | Promise<Maybe<T>>;
	// deno-lint-ignore no-explicit-any
	find(column: string, value: any): Maybe<T> | Promise<Maybe<T>>;
	list(): T[] | Promise<T[]>;
	save(item: T): Maybe<string | number> | Promise<Maybe<string | number>>;
	delete(item: T): void | Promise<void>;
}

declare global {
	interface Request {
		database: Database;
		site: SiteDetails;
	}

}