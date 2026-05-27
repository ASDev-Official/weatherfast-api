module.exports = function handler(req, res) {
  // Allow cross-origin requests for the frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Set standard API headers
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store"); // Don't cache test notifications

  // Return test data in typical Firestore document format (with id merged into data)
  const testNotifications = [
    {
      id: "upcoming",
      title: "Coming soon!",
      message: "This feature is currently in development",
      createdAt: new Date().toISOString(),
      read: false,
      type: "info",
      actionUrl: "",
    },
  ];

  return res.status(200).json({
    data: testNotifications,
    meta: {
      total: testNotifications.length,
      source: "mock",
    },
  });
};
