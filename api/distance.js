export default async function handler(req, res) {
  try {
    const dest = (req.query.dest || "").toString().trim();
    if (!dest) return res.status(400).json({ ok: false, error: "Missing dest" });

    const ORIGIN = process.env.ORIGIN_ADDRESS || "Warszawa, Polska";
    const key = process.env.GOOGLE_MAPS_KEY;
    if (!key) return res.status(500).json({ ok: false, error: "Missing GOOGLE_MAPS_KEY" });

    const url =
      "https://maps.googleapis.com/maps/api/distancematrix/json" +
      `?origins=${encodeURIComponent(ORIGIN)}` +
      `&destinations=${encodeURIComponent(dest)}` +
      `&units=metric` +
      `&key=${encodeURIComponent(key)}`;

    const r = await fetch(url);
    const data = await r.json();

    const el = data?.rows?.[0]?.elements?.[0];
    if (!el || el.status !== "OK") {
      return res.status(200).json({
        ok: false,
        error: "Distance Matrix failed",
        details: el?.status || data?.status || "UNKNOWN",
      });
    }

    const meters = el.distance.value;
    const km = Math.round(meters / 1000);

    return res.status(200).json({
      ok: true,
      origin: ORIGIN,
      destination: dest,
      km,
      meters,
      distance_text: el.distance.text,
      duration_text: el.duration.text
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}
