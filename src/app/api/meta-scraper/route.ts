import { NextRequest, NextResponse } from "next/server";
import dns from "node:dns";
import net from "node:net";

export const dynamic = "force-dynamic";

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isPrivateIp(ip: string): boolean {
  if (net.isIP(ip) === 6) {
    // IPv6 private ranges: fc00::/7 (Unique local), fe80::/10 (link-local), ::1 (loopback)
    const lowered = ip.toLowerCase();
    return (
      lowered === "::1" ||
      lowered.startsWith("fc") ||
      lowered.startsWith("fd") ||
      lowered.startsWith("fe80:")
    );
  }
  // IPv4 checks
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;
  const [a, b] = parts;
  return (
    a === 10 || // 10.0.0.0/8
    (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
    (a === 192 && b === 168) || // 192.168.0.0/16
    a === 127 || // 127.0.0.0/8 loopback
    a === 169 && b === 254 // 169.254.0.0/16 link-local
  );
}

async function assertPublicHostname(target: URL) {
  // Disallow obvious local hostnames
  const hn = target.hostname.toLowerCase();
  if (
    hn === "localhost" ||
    hn.endsWith(".localhost") ||
    hn.endsWith(".local") ||
    hn.endsWith(".internal")
  ) {
    throw new Error("Blocked host");
  }

  // If hostname is a literal IP, check it directly
  if (net.isIP(hn)) {
    if (isPrivateIp(hn)) throw new Error("Blocked private IP");
    return; // public IP
  }

  // Resolve DNS and block private IPs
  const results = await dns.promises.lookup(hn, { all: true });
  if (!results.length) throw new Error("DNS resolution failed");
  for (const r of results) {
    if (isPrivateIp(r.address)) {
      throw new Error("Blocked private IP");
    }
  }
}

async function safeFetchHtml(initialUrl: string, signal: AbortSignal, maxRedirects = 3): Promise<{ url: string; html: string; contentType: string | null; }> {
  let current = new URL(initialUrl);
  for (let i = 0; i <= maxRedirects; i++) {
    await assertPublicHostname(current);
    const res = await fetch(current.toString(), {
      signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "manual",
    });

    // Handle manual redirects with re-validation
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new Error("Redirect without location");
      const nextUrl = new URL(loc, current);
      if (!isValidHttpUrl(nextUrl.toString())) throw new Error("Invalid redirect scheme");
      current = nextUrl;
      continue; // follow redirect
    }

    const ct = res.headers.get("content-type");
    if (!ct || !ct.includes("text/html")) {
      throw new Error("URL did not return HTML content");
    }
    const raw = await res.text();
    // Soft-cap the amount of HTML we parse to reduce risk
    const html = raw.length > 1_500_000 ? raw.slice(0, 1_500_000) : raw;
    return { url: current.toString(), html, contentType: ct };
  }
  throw new Error("Too many redirects");
}

function extractFirst(regex: RegExp, html: string): string | undefined {
  const m = html.match(regex);
  return m && m[1] ? m[1].trim() : undefined;
}

function getMetaContent(html: string, key: string): string | undefined {
  // Match both name and property attributes in any order
  const patterns = [
    new RegExp(
      `<meta[^>]*(?:name|property)=["']${key}["'][^>]*content=["']([^"']+)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["']${key}["'][^>]*>`,
      "i"
    ),
  ];
  for (const re of patterns) {
    const val = extractFirst(re, html);
    if (val) return val;
  }
  return undefined;
}

function absolutizeUrl(resourceUrl: string | undefined, pageUrl: string): string | undefined {
  if (!resourceUrl) return undefined;
  try {
    return new URL(resourceUrl, pageUrl).toString();
  } catch {
    return undefined;
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url") || "";
  if (!url || !isValidHttpUrl(url)) {
    return NextResponse.json({ error: "Invalid or missing url parameter" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const fetched = await safeFetchHtml(url, controller.signal, 3);
    const ct = fetched.contentType || "";
    const html = fetched.html;

    // Extract fields with sensible precedence
    const ogTitle = getMetaContent(html, "og:title");
    const twTitle = getMetaContent(html, "twitter:title");
    const titleTag = extractFirst(/<title[^>]*>([^<]*)<\/title>/i, html);
    const title = ogTitle || twTitle || titleTag || "";

    const ogDesc = getMetaContent(html, "og:description");
    const twDesc = getMetaContent(html, "twitter:description");
    const metaDesc = getMetaContent(html, "description");
    const description = ogDesc || twDesc || metaDesc || "";

    const ogImage = absolutizeUrl(getMetaContent(html, "og:image"), url);
    const twImage = absolutizeUrl(getMetaContent(html, "twitter:image"), url);
    const linkImage = absolutizeUrl(
      extractFirst(/<link[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["'][^>]*>/i, html),
      url
    );
    const image = ogImage || twImage || linkImage || undefined;

    const canonical = absolutizeUrl(
      extractFirst(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i, html),
      fetched.url
    );
    return NextResponse.json({ title, description, image, url: canonical || fetched.url });
  } catch (err: any) {
    const status = err?.name === "AbortError" ? 504 : 500;
    const message = err?.message || "Failed to fetch metadata";
    return NextResponse.json({ error: message }, { status });
  } finally {
    clearTimeout(timeout);
  }
}


