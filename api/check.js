export async function POST(request) {

  let body = {};
  try {
    body = await request.json();
  } catch (e) {}

  const urls = body.urls || [];

  const results = await Promise.all(
    urls.map(url => checkUrl(url))
  );

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" }
  });
}

async function checkUrl(url) {
  if (!url) return { url, code: "Empty", status: "Warning" };

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

