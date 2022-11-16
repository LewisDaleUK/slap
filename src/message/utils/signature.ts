export type SignatureHeaders = {
	keyId: string;
	signature: string;
	algorithm: string;
	headers: string; 
};

export const extractSignature = (signature: string): SignatureHeaders => {
	return signature.split(',').reduce((values, current) => {
		const [key, value] = current.split("=", 2);
		const [_, text] = value.split('"', 2);
		values[key] = text;

		return values;
	}, {} as { [k: string]: string }) as SignatureHeaders;
}

export const expectedSignature = (headers: SignatureHeaders, req: Request) => 
	headers.headers.split(' ').map(h => {
		if (h === "(request-target)") {
			return `(request-target): post /${req.actor?.handle}/inbox`;
		}
		return `${h}: ${req.headers.get(h)}`;
	}).join('\n');

export const headersToSignature = (headers: { [k: string]: string }) =>
	Object.entries(headers)
		.map(([k, v]) => `${k.toLowerCase()}: ${v}`)
		.join('\n');
