module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ ok: false });
    return;
  }

  const queryCountry = typeof req.query?.country === "string" ? req.query.country : "";
  const headerCountry =
    req.headers["x-vercel-ip-country"] ||
    req.headers["cf-ipcountry"] ||
    req.headers["x-country-code"] ||
    "";

  const country = String(queryCountry || headerCountry).trim().toUpperCase();

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ ok: true, country });
};
