const UPSTREAM_BASE_URL = "https://api-open.data.gov.sg/v2/real-time/api";
const API_KEY_HEADER = "api-key";
const DEFAULT_TIMEOUT_MS = 8000;

// ---------------------------------------------------------------------------
// In-process memory cache
// Keyed by full upstream URL string. Each entry:
//   { body: Buffer, status: number, headers: Object, fetchedAt: number }
// This deduplicates upstream calls within a warm container instance and acts
// as a second-level cache when the Vercel CDN edge cache is bypassed.
// ---------------------------------------------------------------------------
const memCache = new Map();

function memCacheGet(key, sMaxAge) {
  const entry = memCache.get(key);
  if (!entry) return null;
  const ageMs = Date.now() - entry.fetchedAt;
  if (ageMs > sMaxAge * 1000) {
    memCache.delete(key);
    return null;
  }
  return entry;
}

function memCacheSet(key, entry) {
  // Evict oldest entry when cache grows too large (safety valve)
  if (memCache.size >= 256) {
    const firstKey = memCache.keys().next().value;
    memCache.delete(firstKey);
  }
  memCache.set(key, entry);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getApiKey() {
  return process.env.DATA_GOV_SG_API_KEY || "";
}

function getRequestMethod(req) {
  return String(req.method || "GET").toUpperCase();
}

function copyUpstreamHeaders(upstreamHeaders, res) {
  for (const [headerName, headerValue] of Object.entries(upstreamHeaders)) {
    const normalized = headerName.toLowerCase();

    if (
      normalized === "set-cookie" ||
      normalized === "connection" ||
      normalized === "keep-alive" ||
      normalized === "proxy-authenticate" ||
      normalized === "proxy-authorization" ||
      normalized === "te" ||
      normalized === "trailers" ||
      normalized === "transfer-encoding" ||
      normalized === "upgrade" ||
      normalized === "content-encoding" ||
      normalized === "content-length"
    ) {
      continue;
    }

    res.setHeader(headerName, headerValue);
  }
}

function sendJson(res, statusCode, payload) {
  if (!res.headersSent) {
    res.statusCode = statusCode;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("cache-control", "no-store");
    res.setHeader("x-content-type-options", "nosniff");
  }

  res.end(JSON.stringify(payload));
}

// ---------------------------------------------------------------------------
// Main proxy handler
//
// cacheTtl: { sMaxAge: number, staleWhileRevalidate: number }
//   sMaxAge              — Vercel CDN serves cached response for this many seconds
//   staleWhileRevalidate — After sMaxAge, CDN serves stale while re-fetching in bg
//
// Both values are also used for the in-process memory cache (sMaxAge only).
// ---------------------------------------------------------------------------
async function proxyRealTimeApi(req, res, upstreamPath, cacheTtl) {
  const method = getRequestMethod(req);

  if (method !== "GET" && method !== "HEAD") {
    res.setHeader("allow", "GET, HEAD");
    return sendJson(res, 405, {
      error: "Method not allowed",
      allowedMethods: ["GET", "HEAD"],
    });
  }

  const apiKey = getApiKey();

  if (!apiKey) {
    return sendJson(res, 500, {
      error: "Server is missing DATA_GOV_SG_API_KEY",
    });
  }

  const upstreamUrl = new URL(`${UPSTREAM_BASE_URL}/${upstreamPath}`);
  const incomingUrl = new URL(req.url, "http://localhost");

  // Support debug logging when caller appends ?debug=true
  const debug = incomingUrl.searchParams.get("debug") === "true";

  // Copy query params to upstream but exclude the debug param
  incomingUrl.searchParams.delete("debug");
  upstreamUrl.search = incomingUrl.search;

  const cacheKey = upstreamUrl.href;
  const { sMaxAge = 60, staleWhileRevalidate = 60 } = cacheTtl || {};

  if (debug) {
    const maskedKey = apiKey
      ? apiKey.length > 4
        ? `${apiKey.slice(0, 4)}...(${apiKey.length} chars)`
        : apiKey
      : "none";

    console.log(
      `[weatherfast proxy] debug=true method=${method} incoming=${req.url} upstream=${upstreamUrl.href} apiKey=${maskedKey}`,
    );
  }

  // ------------------------------------------------------------------
  // Check in-process memory cache (MISS path hits the upstream)
  // ------------------------------------------------------------------
  const cached = memCacheGet(cacheKey, sMaxAge);

  if (cached) {
    const ageSeconds = Math.floor((Date.now() - cached.fetchedAt) / 1000);

    if (debug) {
      console.log(
        `[weatherfast proxy] memory cache HIT age=${ageSeconds}s key=${cacheKey}`,
      );
    }

    res.statusCode = cached.status;
    copyUpstreamHeaders(cached.headers, res);

    // Override cache-control with our desired policy
    res.setHeader(
      "cache-control",
      `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    );
    res.setHeader("x-cache", "HIT");
    res.setHeader("x-cache-age", String(ageSeconds));
    res.setHeader("x-content-type-options", "nosniff");

    if (method === "HEAD") return res.end();
    return res.end(cached.body);
  }

  // ------------------------------------------------------------------
  // Cache MISS — fetch from upstream
  // ------------------------------------------------------------------
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const upstreamRequestHeaders = {
      accept: req.headers.accept || "application/json",
      [API_KEY_HEADER]: apiKey,
      "x-api-key": apiKey,
      "api-key": apiKey,
    };

    if (debug) {
      console.log(
        `[weatherfast proxy] cache MISS — fetching upstream key=${cacheKey}`,
      );
    }

    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers: upstreamRequestHeaders,
      signal: controller.signal,
    });

    if (debug) {
      try {
        const upstreamResponseHeaders = Object.fromEntries(
          upstreamResponse.headers.entries(),
        );
        console.log(
          `[weatherfast proxy] upstream status=${upstreamResponse.status} headers=${JSON.stringify(upstreamResponseHeaders)}`,
        );
      } catch (e) {
        console.log(
          `[weatherfast proxy] upstream status=${upstreamResponse.status}`,
        );
      }
    }

    // Collect safe upstream headers to store in cache
    const safeHeaders = {};
    for (const [k, v] of upstreamResponse.headers.entries()) {
      const normalized = k.toLowerCase();
      if (
        normalized === "set-cookie" ||
        normalized === "connection" ||
        normalized === "keep-alive" ||
        normalized === "proxy-authenticate" ||
        normalized === "proxy-authorization" ||
        normalized === "te" ||
        normalized === "trailers" ||
        normalized === "transfer-encoding" ||
        normalized === "upgrade" ||
        normalized === "content-encoding" ||
        normalized === "content-length" ||
        normalized === "cache-control"   // we override this ourselves
      ) {
        continue;
      }
      safeHeaders[k] = v;
    }

    const bodyBuffer =
      method === "HEAD"
        ? Buffer.alloc(0)
        : Buffer.from(await upstreamResponse.arrayBuffer());

    // Only cache successful responses
    if (upstreamResponse.ok) {
      memCacheSet(cacheKey, {
        body: bodyBuffer,
        status: upstreamResponse.status,
        headers: safeHeaders,
        fetchedAt: Date.now(),
      });
    }

    // Write response
    res.statusCode = upstreamResponse.status;
    copyUpstreamHeaders(safeHeaders, res);

    // Set caching headers — Vercel CDN will cache this response at the edge
    // for successful responses; errors are never cached.
    if (upstreamResponse.ok) {
      res.setHeader(
        "cache-control",
        `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
      );
    } else {
      res.setHeader("cache-control", "no-store");
    }

    res.setHeader("x-cache", "MISS");
    res.setHeader("x-cache-age", "0");
    res.setHeader("x-content-type-options", "nosniff");

    if (method === "HEAD") return res.end();
    return res.end(bodyBuffer);
  } catch (error) {
    const isAbortError = error && error.name === "AbortError";

    return sendJson(res, isAbortError ? 504 : 502, {
      error: isAbortError
        ? "Upstream request timed out"
        : "Upstream request failed",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  proxyRealTimeApi,
};
