const UPSTREAM_BASE_URL = "https://api-open.data.gov.sg/v2/real-time/api";
const API_KEY_HEADER = "api-key";
const DEFAULT_TIMEOUT_MS = 8000;

function getApiKey() {
  return process.env.DATA_GOV_SG_API_KEY || "";
}

function getRequestMethod(req) {
  return String(req.method || "GET").toUpperCase();
}

function copyUpstreamHeaders(upstreamResponse, res) {
  for (const [headerName, headerValue] of upstreamResponse.headers.entries()) {
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

async function proxyRealTimeApi(req, res, upstreamPath) {
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

  // Copy query params to upstream but exclude debug param
  incomingUrl.searchParams.delete("debug");
  upstreamUrl.search = incomingUrl.search;
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const upstreamHeaders = {
      accept: req.headers.accept || "application/json",
      // include both header variants for compatibility with upstream
      [API_KEY_HEADER]: apiKey,
      "x-api-key": apiKey,
      "api-key": apiKey,
    };

    if (debug) {
      console.log(
        `[weatherfast proxy] sending upstream headers: ${Object.keys(
          upstreamHeaders,
        ).join(",")}`,
      );
    }

    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers: upstreamHeaders,
      signal: controller.signal,
    });

    if (debug) {
      try {
        const upstreamHeaders = Object.fromEntries(
          upstreamResponse.headers.entries(),
        );
        console.log(
          `[weatherfast proxy] upstream status=${upstreamResponse.status} headers=${JSON.stringify(
            upstreamHeaders,
          )}`,
        );
      } catch (e) {
        console.log(
          `[weatherfast proxy] upstream status=${upstreamResponse.status}`,
        );
      }
    }

    res.statusCode = upstreamResponse.status;
    copyUpstreamHeaders(upstreamResponse, res);

    if (!res.getHeader("cache-control")) {
      res.setHeader("cache-control", "no-store");
    }

    if (method === "HEAD") {
      return res.end();
    }

    const bodyBuffer = Buffer.from(await upstreamResponse.arrayBuffer());
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
