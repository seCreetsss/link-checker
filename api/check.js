// trigger deploy
``
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const urls = req.body.urls || [];

  const results = await Promise.all(
    urls.map(url => checkUrl(url))
  );

  return res.status(200).json(results);
}

async function checkUrl(url) {
  try {
    const controller = new AbortController();

    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    clearTimeout(timeout);

    return {
      url,
      code: response.status,
      status: classify(response.status)
    };

  } catch (e) {
    return {
      url,
      code: "Error",
      status: "Warning"
    };
  }
}

function classify(code) {
  if (code >= 200 && code < 400) return "Active";
  if ([401, 403, 405, 429].includes(code)) return "Warning";
  if (code === 404 || code === 410) return "Broken";
  return "Warning";
}
