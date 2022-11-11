import { decode as base64Decode } from 'https://deno.land/std@0.162.0/encoding/base64.ts';

/**
 * Class for decoding/encoding between different data formats.
 * 
 * Based on https://github.com/skymethod/denoflare/blob/master/common/bytes.ts
 */
export class Bytes {
	private readonly _bytes: Uint8Array;
	public length: number;

	constructor(bytes: Uint8Array) {
		this._bytes = bytes;
		this.length = bytes.length;
	}

	public array(): Uint8Array {
        return this._bytes;
    }

	public utf8(): string {
		return new TextDecoder().decode(this._bytes);
	}

	public base64(): string {
		const str = String.fromCharCode(...this._bytes);
		return btoa(str);
	}

	public arrayBuffer(): ArrayBuffer {
		return this._bytes.buffer.slice(0);
	}

	public async sha256(): Promise<Bytes> {
        const hash = await crypto.subtle.digest('SHA-256', this._bytes);
        return new Bytes(new Uint8Array(hash));
    }

	static fromBase64(str: string): Bytes {
		return new Bytes(base64Decode(str));
	}

	static fromUtf8(str: string): Bytes {
		return new this(new TextEncoder().encode(str));
	}

	static fromArrayBuffer(buffer: ArrayBuffer): Bytes {
		return new this(new Uint8Array(buffer));
	}

	static from(obj: string | ArrayBuffer, encoding: "utf-8" | "base64" = "utf-8") {
		if (obj instanceof String) {
			if (encoding === "utf-8") {
				return Bytes.fromUtf8(obj as string);
			} else if (encoding === "base64") {
				return Bytes.fromBase64(obj as string);
			}
		} else if (obj instanceof ArrayBuffer) {
			return Bytes.fromArrayBuffer(obj as ArrayBuffer);
		}

		return new Bytes(new Uint8Array());
	}
}