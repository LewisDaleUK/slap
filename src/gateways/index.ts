import { Database } from '../lib/Database.ts';
import { SiteDetails } from '../models/index.ts';
import type { Maybe } from '../types.ts';

export interface IGateway<T> {
	build(): void;
	get(id: string | number): Maybe<T>;
	// deno-lint-ignore no-explicit-any
	find(column: string, value: any): Maybe<T>;
	list(): T[];
	save(item: T): Maybe<string | number>;
	delete(item: T): void;
}
