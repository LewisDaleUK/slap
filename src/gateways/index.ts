import { SiteDetails } from '../models/index.ts';
import type { Maybe } from '../types.ts';

export interface IGateway<T> {
	get(id: string | number): Maybe<T>;
	list(): T[];
	save(item: T): Maybe<string | number>;
	delete(item: T): void;
}
