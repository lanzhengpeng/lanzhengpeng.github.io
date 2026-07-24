/**
 * Simple +1 test counter.
 *
 * GET  /plus-one -> returns the current count.
 * POST /plus-one -> increments the count and returns the new count.
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
  const raw = await kv.get('plus_one_count');
  const count = parseInt(raw, 10);
  return Number.isNaN(count) ? 0 : count;
}

export async function onRequestGet(context) {
  try {
    const kv = context.env.PORTFOLIO_KV;
    const count = await getCount(kv);
    return jsonResponse({ count });
  } catch (err) {
    return jsonResponse({ error: 'Failed to read +1 count' }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const kv = context.env.PORTFOLIO_KV;
    const count = (await getCount(kv)) + 1;
    await kv.put('plus_one_count', String(count));
    return jsonResponse({ count });
  } catch (err) {
    return jsonResponse({ error: 'Failed to increment +1 count' }, 500);
  }
}
