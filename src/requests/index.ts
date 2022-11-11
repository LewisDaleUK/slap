export type Link = {
	href: string;
	rel?: string | string[];
	mediaType?: string;
	name: string;
	hreflang?: string;
	height?: number;
	width?: number;
	preview?: LinkOrObject;
};

type ObjectEntry = Object | string;
type LinkEntry = Link | string;
type LinkOrObject = LinkEntry | ObjectEntry | Array<LinkEntry | ObjectEntry>;

export type Object = {
	attachment?: LinkOrObject | Array<LinkOrObject>;
	attributedTo?: string | LinkOrObject | Array<LinkOrObject>;
	audience?: LinkOrObject;
	content?: string;
	"@context": string | { [k: string]: string } | Array<string | { [k: string]: string }>;
	name?: string;
	endTime?: string | Date;
	generator?: LinkOrObject;
	icon?: LinkOrObject;
	inReplyTo?: LinkOrObject;
	location?: LinkOrObject;	
	preview?: LinkOrObject;
	published: string;
	replies?: Collection;
	startTime?: string;
	summary?: string;
	tag?: LinkOrObject | Array<LinkOrObject>;
	updated?: string;
	url?: string | Link;
	to?: LinkOrObject | Array<LinkOrObject>;
	bto?: LinkOrObject | Array<LinkOrObject>;
	cc?: LinkOrObject | Array<LinkOrObject>;
	bcc?: LinkOrObject | Array<LinkOrObject>;
	type: string;
	mediaType?: string;
	duration?: string;
};

export type Collection = Object & {
	totalItems: number;
	items: LinkOrObject | Array<LinkOrObject>;
}

type ActivityType = "Accept"
	| "Add"
	| "Announce"
	| "Arrive"
	| "Block"
	| "Create"
	| "Delete"
	| "Dislike"
	| "Flag"
	| "Follow"
	| "Ignore"
	| "Invite"
	| "Join"
	| "Leave"
	| "Like"
	| "Listen"
	| "Move"
	| "Offer"
	| "Question"
	| "Reject"
	| "Read"
	| "Remove"
	| "TentativeReject"
	| "TentativeAccept"
	| "Undo"
	| "Update"
	| "View";

export type Activity = Object & {
	actor: LinkOrObject;
	object?: Object;
	target?: LinkOrObject;
	result?: LinkOrObject;
	origin?: LinkOrObject;
	instrument?: LinkOrObject;
	type: ActivityType;
}

export type Actor = Object & {
	type: "Application" | "Group" | "Organization" | "Person" | "Service";
}

export type Application = Actor & { type: "Application" };
export type Group = Actor & { type: "Group" };
export type Organization = Actor & { type: "Organization" };
export type Person = Actor & { type: "Person" };
export type Service = Actor & { type: "Service" };
