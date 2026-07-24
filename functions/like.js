/**
 * Like counter.
 *
 * GET  /like  -> returns the current like count and whether this IP already
 *                liked today.
 * POST /like  -> increments the like count once per IP per day.
 *
 * Requires a KV namespace bound as PORTFOLIO_KV in the Cloudflare Pages
 * dashboard (Settings > Functions > KV namespace bindings).
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const IP_KEY_PREFIX = 'liked_ip:';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getCount(kv) {
  const raw = await kv.get('like_count');
  const count = parseInt(raw, 10);
  return Number.isNaN(count) ? 0 : count;
}

function getClientIP(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
    request.headers.get('X-Real-IP') ||
    'unknown'
  );
}

async function canLikeToday(kv, ip) {
  const raw = await kv.get(IP_KEY_PREFIX + ip);
  if (!raw) return true;
  const lastLike = parseInt(raw, 10);
  if (Number.isNaN(lastLike)) return true;
  return Date.now() - lastLike >= DAY_MS;
}

async function recordLike(kv, ip) {
  await kv.put(IP_KEY_PREFIX + ip, String(Date.now()));
}

export async function onRequestGet(context) {
  try {
    const kv = context.env.PORTFOLIO_KV;
    const ip = getClientIP(context.request);
    const count = await getCount(kv);
    const alreadyLikedToday = !(await canLikeToday(kv, ip));
    return jsonResponse({ count, alreadyLikedToday });
  } catch (err) {
    return jsonResponse({ error: 'Failed to read like count' }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const kv = context.env.PORTFOLIO_KV;
    const ip = getClientIP(context.request);

    if (!(await canLikeToday(kv, ip))) {
      const count = await getCount(kv);
      return jsonResponse({
        count,
        alreadyLikedToday: true,
        message: 'You can only like once per day from this IP.',
      });
    }

    const count = (await getCount(kv)) + 1;
    await kv.put('like_count', String(count));
    await recordLike(kv, ip);
    return jsonResponse({ count, alreadyLikedToday: false });
  } catch (err) {
    return jsonResponse({ error: 'Failed to increment like count' }, 500);
  }
}
