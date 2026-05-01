const crypto = require("crypto");

const PIXEL_ID = process.env.META_PIXEL_ID || "796614969974062";
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v20.0";

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  return req.socket?.remoteAddress;
}

function sha256(value) {
  if (!value) return undefined;
  return crypto.createHash("sha256").update(String(value).trim().toLowerCase()).digest("hex");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false });
    return;
  }

  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!accessToken) {
    res.status(200).json({ ok: false, configured: false });
    return;
  }

  let payload;
  try {
    payload = await readJson(req);
  } catch (error) {
    res.status(400).json({ ok: false, error: "invalid_json" });
    return;
  }

  const eventName = payload.eventName || "PageView";
  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: payload.eventId,
    action_source: "website",
    event_source_url: payload.eventSourceUrl,
    user_data: {
      client_ip_address: getClientIp(req),
      client_user_agent: req.headers["user-agent"],
      fbp: payload.fbp,
      fbc: payload.fbc,
      external_id: sha256(payload.externalId)
    },
    custom_data: {
      page_title: payload.pageTitle
    }
  };

  Object.keys(event.user_data).forEach((key) => {
    if (!event.user_data[key]) {
      delete event.user_data[key];
    }
  });

  Object.keys(event.custom_data).forEach((key) => {
    if (!event.custom_data[key]) {
      delete event.custom_data[key];
    }
  });

  const metaResponse = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] })
    }
  );

  const result = await metaResponse.json().catch(() => ({}));

  if (!metaResponse.ok) {
    res.status(502).json({ ok: false, error: result });
    return;
  }

  res.status(200).json({ ok: true, result });
};
