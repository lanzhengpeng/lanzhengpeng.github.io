/**
 * Visitor counter.
 *
 * GET /visitors -> increments the visitor count and returns the new count.
 *
 * Requires a KV namespace bound as PORTFOLIO_KV in the Cloudflare Pages
 * dashboard (Settings > Functions > KV namespace bindings).
 */

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getCount(kv) {
  const raw = await kv.get('visitor_count');
  const count = parseInt(raw, 10);
  return Number.isNaN(count) ? 0 : count;
}

export async function onRequestGet(context) {
  try {
    const kv = context.env.PORTFOLIO_KV;
    const count = (await getCount(kv)) + 1;
    await kv.put('visitor_count', String(count));
    return jsonResponse({ count });
  } catch (err) {
    return jsonResponse({ error: 'Failed to count visitor' }, 500);
  }
}
