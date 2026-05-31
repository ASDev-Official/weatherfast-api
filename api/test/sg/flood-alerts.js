module.exports = function handler(req, res) {
  const method = String(req.method || "GET").toUpperCase();

  if (method !== "GET" && method !== "HEAD") {
    res.setHeader("allow", "GET, HEAD");
    res.statusCode = 405;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        error: "Method not allowed",
        allowedMethods: ["GET", "HEAD"],
      }),
    );
    return;
  }

  const data = {
    code: 0,
    data: {
      records: [
        {
          datetime: "2025-05-22T09:55:00+08:00",
          item: {
            type: "observation",
            identifier: "2.49.0.0.702.2-BCM-17586121561884-DYOONG-1",
            isStationData: false,
            msgType: "Alert",
            references:
              "pub_joint_ops_ctr@pub.gov.sg, 2.49.0.0.702.2-BCM-17586117885024-DYOONG, 2025-09-23T15:16:28+08:00",
            sender: "pub_joint_ops_ctr@pub.gov.sg",
            scope: "Public",
            status: "Actual",
            readings: [
              {
                area: {
                  areaDesc:
                    "at Bt Timah Rd from Wilby Rd to Blackmore Dr",
                  circle: [1.33201, 103.87015, 1],
                },
                category: "Met",
                certainty: "Observed",
                description:
                  "Flash flood at Bt Timah Rd from Wilby Rd to Blackmore Dr. Please avoid the area. Issued 1705 hrs.",
                event: "Flood",
                eventCode: {
                  value: "OET-081",
                  valueName: "OET:v1.2",
                },
                headline: "Flash Flood Alert [TEST]",
                instruction:
                  "Please avoid this area for the next one (1) hour.",
                responseType: "Avoid",
                senderName: "PUB",
                severity: "Minor",
                urgency: "Immediate",
              },
            ],
          },
          updatedTimestamp: "2025-05-22T10:03:18+08:00",
        },
        {
          datetime: "2025-05-22T09:55:00+08:00",
          item: {
            type: "observation",
            identifier: "2.49.0.0.702.2-BCM-17586121561884-DYOONG-2",
            isStationData: false,
            msgType: "Alert",
            references:
              "pub_joint_ops_ctr@pub.gov.sg, 2.49.0.0.702.2-BCM-17586117885024-DYOONG, 2025-09-23T15:16:28+08:00",
            sender: "pub_joint_ops_ctr@pub.gov.sg",
            scope: "Public",
            status: "Actual",
            readings: [
              {
                area: {
                  areaDesc:
                    "at Orchard Rd from Scotts Rd to Bideford Rd",
                  circle: [1.3039, 103.8320, 1],
                },
                category: "Met",
                certainty: "Observed",
                description:
                  "Flash flood at Orchard Rd from Scotts Rd to Bideford Rd. Please avoid the area. Issued 1710 hrs.",
                event: "Flood",
                eventCode: {
                  value: "OET-081",
                  valueName: "OET:v1.2",
                },
                headline: "Flash Flood Alert [TEST]",
                instruction:
                  "Please avoid this area for the next one (1) hour.",
                responseType: "Avoid",
                senderName: "PUB",
                severity: "Minor",
                urgency: "Immediate",
              },
            ],
          },
          updatedTimestamp: "2025-05-22T10:03:18+08:00",
        },
        {
          datetime: "2025-05-22T09:55:00+08:00",
          item: {
            type: "observation",
            identifier: "2.49.0.0.702.2-BCM-17586121561884-DYOONG-3",
            isStationData: false,
            msgType: "Alert",
            references:
              "pub_joint_ops_ctr@pub.gov.sg, 2.49.0.0.702.2-BCM-17586117885024-DYOONG, 2025-09-23T15:16:28+08:00",
            sender: "pub_joint_ops_ctr@pub.gov.sg",
            scope: "Public",
            status: "Actual",
            readings: [
              {
                area: {
                  areaDesc:
                    "at Dunearn Rd from Yarwood Ave to Binjai Park",
                  circle: [1.3364, 103.7915, 1],
                },
                category: "Met",
                certainty: "Observed",
                description:
                  "Flash flood at Dunearn Rd from Yarwood Ave to Binjai Park. Please avoid the area. Issued 1715 hrs.",
                event: "Flood",
                eventCode: {
                  value: "OET-081",
                  valueName: "OET:v1.2",
                },
                headline: "Flash Flood Alert [TEST]",
                instruction:
                  "Please avoid this area for the next one (1) hour.",
                responseType: "Avoid",
                senderName: "PUB",
                severity: "Minor",
                urgency: "Immediate",
              },
            ],
          },
          updatedTimestamp: "2025-05-22T10:03:18+08:00",
        },
        {
          datetime: "2025-05-22T09:55:00+08:00",
          item: {
            type: "observation",
            identifier: "2.49.0.0.702.2-BCM-17586121561884-DYOONG-4",
            isStationData: false,
            msgType: "Alert",
            references:
              "pub_joint_ops_ctr@pub.gov.sg, 2.49.0.0.702.2-BCM-17586117885024-DYOONG, 2025-09-23T15:16:28+08:00",
            sender: "pub_joint_ops_ctr@pub.gov.sg",
            scope: "Public",
            status: "Actual",
            readings: [
              {
                area: {
                  areaDesc:
                    "at Upper Thomson Rd from Jalan Todak to Sin Ming Ave",
                  circle: [1.3541, 103.8340, 1],
                },
                category: "Met",
                certainty: "Observed",
                description:
                  "Flash flood at Upper Thomson Rd from Jalan Todak to Sin Ming Ave. Please avoid the area. Issued 1720 hrs.",
                event: "Flood",
                eventCode: {
                  value: "OET-081",
                  valueName: "OET:v1.2",
                },
                headline: "Flash Flood Alert [TEST]",
                instruction:
                  "Please avoid this area for the next one (1) hour.",
                responseType: "Avoid",
                senderName: "PUB",
                severity: "Minor",
                urgency: "Immediate",
              },
            ],
          },
          updatedTimestamp: "2025-05-22T10:03:18+08:00",
        },
        {
          datetime: "2025-05-22T09:55:00+08:00",
          item: {
            type: "observation",
            identifier: "2.49.0.0.702.2-BCM-17586121561884-DYOONG-5",
            isStationData: false,
            msgType: "Alert",
            references:
              "pub_joint_ops_ctr@pub.gov.sg, 2.49.0.0.702.2-BCM-17586117885024-DYOONG, 2025-09-23T15:16:28+08:00",
            sender: "pub_joint_ops_ctr@pub.gov.sg",
            scope: "Public",
            status: "Actual",
            readings: [
              {
                area: {
                  areaDesc:
                    "at Commonwealth Ave from Queensway to Margaret Dr",
                  circle: [1.3005, 103.7997, 1],
                },
                category: "Met",
                certainty: "Observed",
                description:
                  "Flash flood at Commonwealth Ave from Queensway to Margaret Dr. Please avoid the area. Issued 1725 hrs.",
                event: "Flood",
                eventCode: {
                  value: "OET-081",
                  valueName: "OET:v1.2",
                },
                headline: "Flash Flood Alert [TEST]",
                instruction:
                  "Please avoid this area for the next one (1) hour.",
                responseType: "Avoid",
                senderName: "PUB",
                severity: "Minor",
                urgency: "Immediate",
              },
            ],
          },
          updatedTimestamp: "2025-05-22T10:03:18+08:00",
        }
      ],
    },
    errorMsg: "",
  };

  res.statusCode = 200;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.setHeader("x-content-type-options", "nosniff");

  if (method === "HEAD") {
    return res.end();
  }

  return res.end(JSON.stringify(data));
};
