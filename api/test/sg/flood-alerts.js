module.exports = function handler(req, res) {
  const method = String(req.method || "GET").toUpperCase();

  if (method !== "GET" && method !== "HEAD") {
    res.setHeader("allow", "GET, HEAD");
    res.statusCode = 405;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({
      error: "Method not allowed",
      allowedMethods: ["GET", "HEAD"],
    }));
    return;
  }

  const data = {
    "code": 0,
    "data": {
      "records": [
        {
          "datetime": "2025-05-22T09:55:00+08:00",
          "item": {
            "type": "observation",
            "identifier": "2.49.0.0.702.2-BCM-17586121561884-DYOONG",
            "isStationData": false,
            "msgType": "Alert",
            "references": "pub_joint_ops_ctr@pub.gov.sg, 2.49.0.0.702.2-BCM-17586117885024-DYOONG, 2025-09-23T15:16:28+08:00",
            "sender": "pub_joint_ops_ctr@pub.gov.sg",
            "scope": "Public",
            "status": "Actual",
            "readings": [
              {
                "area": {
                  "areaDesc": "at <street name1> from <street name2> to <street name3>",
                  "circle": [
                    1.33201,
                    103.87015,
                    1
                  ]
                },
                "category": "Met",
                "certainty": "Observed",
                "description": "Flash flood at Bt Timah Rd from Wilby Rd to Blackmore Dr. Please avoid the area. Issued 1705 hrs.",
                "event": "Flood",
                "eventCode": {
                  "value": "OET-081",
                  "valueName": "OET:v1.2"
                },
                "headline": "Flash Flood Alert",
                "instruction": "Please avoid this area for the next one (1) hour.",
                "responseType": "Avoid",
                "senderName": "PUB",
                "severity": "Minor",
                "urgency": "Immediate"
              }
            ]
          },
          "updatedTimestamp": "2025-05-22T10:03:18+08:00"
        }
      ]
    },
    "errorMsg": ""
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
