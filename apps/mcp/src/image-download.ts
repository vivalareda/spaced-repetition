// biome-ignore-all lint/style/noMagicNumbers: address ranges and HTTP statuses read best as literals
// Downloads images from URLs given by the assistant. The URL comes from a
// conversation, so it must not be able to reach the server's own network:
// only https, only public addresses (checked when connecting, so DNS can't
// change the answer after the check), each redirect checked again, and the
// download stops as soon as it exceeds the size limit.

import { type LookupAddress, lookup } from "node:dns";
import { BlockList, isIP } from "node:net";
import { Agent, fetch } from "undici";

// Mirror `ALLOWED_IMAGE_TYPES` and `MAX_FILE_SIZE` of @shared/types (which this
// server can't import at runtime). The backend checks the stored file again.
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const FETCH_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 3;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

const NON_PUBLIC_ADDRESSES = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  NON_PUBLIC_ADDRESSES.addSubnet(network, prefix, "ipv4");
}
for (const [network, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["64:ff9b::", 96],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const) {
  NON_PUBLIC_ADDRESSES.addSubnet(network, prefix, "ipv6");
}

const IPV6_FAMILY = 6;

export function isPublicAddress(address: string) {
  const type = isIP(address) === IPV6_FAMILY ? "ipv6" : "ipv4";
  return !NON_PUBLIC_ADDRESSES.check(address, type);
}

/** `dns.lookup` that fails for hosts resolving to any non-public address. */
const publicOnlyLookup: typeof lookup = ((
  hostname: string,
  options: { all?: boolean },
  callback: (
    error: Error | null,
    address: string | LookupAddress[],
    family?: number
  ) => void
) => {
  lookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) {
      callback(error, []);
      return;
    }
    const [first] = addresses;
    if (!first || addresses.some((a) => !isPublicAddress(a.address))) {
      callback(new Error("Image URL must point to a public address"), []);
      return;
    }
    if (options.all) {
      callback(null, addresses);
    } else {
      callback(null, first.address, first.family);
    }
  });
}) as typeof lookup;

const publicOnlyAgent = new Agent({ connect: { lookup: publicOnlyLookup } });

/** Throws unless `url` is https and, if it names an IP, a public one. */
function assertAllowedUrl(url: URL) {
  if (url.protocol !== "https:") {
    throw new Error("Image URLs must use https");
  }
  // IP literals are connected to without a lookup, so check them here.
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host) && !isPublicAddress(host)) {
    throw new Error("Image URL must point to a public address");
  }
}

/** Reads `body`, failing as soon as it exceeds `MAX_IMAGE_BYTES`. */
export async function readLimited(
  body: AsyncIterable<Uint8Array> | Iterable<Uint8Array>
) {
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of body) {
    size += chunk.byteLength;
    if (size > MAX_IMAGE_BYTES) {
      throw new Error("Image is larger than 5 MB");
    }
    chunks.push(chunk);
  }
  return chunks;
}

/** Downloads the image at `url` (https, public, at most 5 MB). */
export async function downloadImage(url: string) {
  const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  let current = new URL(url);
  for (let redirects = 0; ; redirects++) {
    assertAllowedUrl(current);
    const response = await fetch(current, {
      dispatcher: publicOnlyAgent,
      redirect: "manual",
      signal,
    }).catch((error: Error) => {
      // undici reports connection failures as "fetch failed", with the
      // reason (e.g. a refused address) as the cause.
      const { cause } = error as { cause?: unknown };
      const reason = cause instanceof Error ? cause : error;
      throw new Error(`Could not download image: ${reason.message}`);
    });

    const location = response.headers.get("location");
    if (REDIRECT_STATUSES.has(response.status) && location) {
      await response.body?.cancel();
      if (redirects >= MAX_REDIRECTS) {
        throw new Error("Too many redirects downloading the image");
      }
      current = new URL(location, current);
      continue;
    }

    if (!(response.ok && response.body)) {
      throw new Error(`Could not download image (HTTP ${response.status})`);
    }
    const type = response.headers.get("content-type")?.split(";")[0] ?? "";
    if (!ALLOWED_IMAGE_TYPES.includes(type)) {
      await response.body.cancel();
      throw new Error(
        `Unsupported image type "${type}"; use PNG, JPEG or WebP`
      );
    }
    const length = Number(response.headers.get("content-length"));
    if (length > MAX_IMAGE_BYTES) {
      await response.body.cancel();
      throw new Error("Image is larger than 5 MB");
    }
    return new Blob(await readLimited(response.body), { type });
  }
}
