export type SiteDetails = {
	id?: number;
	domain: string;
	title: string;
}

export type Actor = {
	id?: number;
	handle: string;
	preferred_username: string;
	summary?: string;
}