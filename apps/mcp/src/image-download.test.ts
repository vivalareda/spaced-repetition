// biome-ignore-all lint/style/noMagicNumbers: addresses and sizes read best as literals
import { describe, expect, it } from "vitest";
import {
  downloadImage,
  isPublicAddress,
  MAX_IMAGE_BYTES,
  readLimited,
} from "./image-download.js";

function* chunksOf(...sizes: number[]) {
  for (const size of sizes) {
    yield new Uint8Array(size);
  }
}

describe("isPublicAddress", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.20.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "::1",
    "fd00::1",
    "::ffff:127.0.0.1",
  ])("rejects %s", (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it.each(["93.184.215.14", "2606:4700::6810:84e5"])(
    "accepts %s",
    (address) => {
      expect(isPublicAddress(address)).toBe(true);
    }
  );
});

describe("readLimited", () => {
  it("reads bodies up to the limit", async () => {
    const chunks = await readLimited(chunksOf(MAX_IMAGE_BYTES - 1, 1));
    expect(chunks).toHaveLength(2);
  });

  it("fails as soon as the body exceeds the limit", async () => {
    await expect(readLimited(chunksOf(MAX_IMAGE_BYTES, 1))).rejects.toThrow(
      "Image is larger than 5 MB"
    );
  });
});

describe("downloadImage", () => {
  it("refuses plain http", async () => {
    await expect(downloadImage("http://example.com/a.png")).rejects.toThrow(
      "Image URLs must use https"
    );
  });

  it.each(["https://127.0.0.1/a.png", "https://[::1]/a.png"])(
    "refuses private IP literals (%s)",
    async (url) => {
      await expect(downloadImage(url)).rejects.toThrow(
        "Image URL must point to a public address"
      );
    }
  );

  it("refuses hosts that resolve to private addresses", async () => {
    await expect(downloadImage("https://localhost/a.png")).rejects.toThrow(
      "Image URL must point to a public address"
    );
  });
});
