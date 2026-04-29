const routes = [
  "/api/sg/two-hour-forecast",
  "/api/sg/twenty-four-hr-forecast",
  "/api/sg/four-day-forecast",
  "/api/sg/air-temperature",
  "/api/sg/relative-humidity",
  "/api/sg/wind-speed",
  "/api/sg/psi",
];

module.exports = async function handler(req, res) {
  if (String(req.method || "GET").toUpperCase() !== "GET") {
    res.setHeader("allow", "GET");
    res.statusCode = 405;
    res.setHeader("content-type", "application/json; charset=utf-8");
    return res.end(
      JSON.stringify({
        error: "Method not allowed",
        allowedMethods: ["GET"],
      }),
    );
  }

  res.statusCode = 200;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");

  return res.end(
    JSON.stringify(
      {
        name: "WeatherFast Singapore API proxy",
        basePath: "/api/sg",
        routes,
        upstreamBaseUrl: "https://api-open.data.gov.sg/v2/real-time/api",
        requiredEnvironmentVariable: "DATA_GOV_SG_API_KEY",
      },
      null,
      2,
    ),
  );
};
