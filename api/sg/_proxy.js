const UPSTREAM_BASE_URL = "https://api-open.data.gov.sg/v2/real-time/api";
const API_KEY_HEADER = "x-api-key";
const DEFAULT_TIMEOUT_MS = 8000;
    if (
      normalized === 'set-cookie' ||
      normalized === 'connection' ||
      normalized === 'keep-alive' ||
      normalized === 'proxy-authenticate' ||
      normalized === 'proxy-authorization' ||
      normalized === 'te' ||
      normalized === 'trailers' ||
      normalized === 'transfer-encoding' ||
      normalized === 'upgrade' ||
      normalized === 'content-encoding' ||
      normalized === 'content-length'
    ) {
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
      normalized === "upgrade"
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
  upstreamUrl.search = incomingUrl.search;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers: {
        [API_KEY_HEADER]: apiKey,
        accept: req.headers.accept || "application/json",
      },
      signal: controller.signal,
    });

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
