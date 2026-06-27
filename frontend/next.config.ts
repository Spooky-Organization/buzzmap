import type { NextConfig } from "next";

// next/image only loads remote images from explicitly allow-listed hosts. Media
// reaches the client from two places: pre-signed storage URLs (the public
// storage host) and seed placeholder images (placehold.co). The storage host is
// environment-specific, so derive it from NEXT_PUBLIC_STORAGE_URL when set and
// fall back to localhost for local dev.
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "placehold.co" },
];

const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;
if (storageUrl) {
  try {
    const { protocol, hostname, port } = new URL(storageUrl);
    remotePatterns.push({
      protocol: protocol.replace(":", "") as "http" | "https",
      hostname,
      ...(port ? { port } : {}),
    });
  } catch {
    // Unparseable storage URL — placeholder + localhost fallback still apply.
    remotePatterns.push({ protocol: "http", hostname: "localhost" });
  }
} else {
  remotePatterns.push({ protocol: "http", hostname: "localhost" });
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: { remotePatterns },
};

export default nextConfig;
