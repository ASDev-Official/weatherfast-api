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
      id: "brokenfeature-01",
      title: "🚨✅ IMPORTANT: WeatherFast New Feature Issue Fixed",
      message:
        "We have fixed multiple issues related to the calendar feature. Please update your app to v3.9.2 through the Play Store. If you are on web, refresh the page.",
      createdAt: "20260708T154500+0800",
      read: false,
      type: "error",
      actionUrl: "",
    },
    {
      id: "weblate-01",
      title: "🌐 Contribute to our Weblate!",
      message:
        "We've launched Weblate-based community translations for WeatherFast. If you'd like to see WeatherFast in your language or contribute to improving translations, please visit our Weblate project and join the effort!",
      createdAt: "",
      read: false,
      type: "info",
      actionUrl: "https://hosted.weblate.org/engage/asdev-weatherfast/",
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
