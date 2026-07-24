/**
 * WebRTC signaling endpoint backed by Cloudflare KV.
 *
 * Routes:
 *   POST /webrtc-signal/:room/:type   -> store signal data
 *   GET  /webrtc-signal/:room/:type   -> read signal data
 *
 * Supported types: offer, answer, broadcaster-ice, viewer-ice
 * Data expires after 5 minutes to avoid KV garbage accumulation.
 *
 * Requires KV namespace bound as PORTFOLIO_KV.
 */

const TTL_SECONDS = 300;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getKey(roomId, type) {
  return `webrtc:${type}:${roomId}`;
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const pathParts = params.path || [];

  if (pathParts.length < 2) {
    return jsonResponse(
      { error: 'Invalid path. Use /webrtc-signal/:room/:type' },
      400,
    );
  }

  const roomId = pathParts[0];
  const type = pathParts[1];
  const validTypes = ['offer', 'answer', 'broadcaster-ice', 'viewer-ice'];

  if (!validTypes.includes(type)) {
    return jsonResponse({ error: 'Invalid signal type' }, 400);
  }

  const kv = env.PORTFOLIO_KV;
  const key = getKey(roomId, type);

  if (request.method === 'POST') {
    try {
      const data = await request.json();

      if (type.endsWith('-ice')) {
        const raw = await kv.get(key);
        const list = raw ? JSON.parse(raw) : [];
        list.push(data);
        await kv.put(key, JSON.stringify(list), { expirationTtl: TTL_SECONDS });
      } else {
        await kv.put(key, JSON.stringify(data), { expirationTtl: TTL_SECONDS });
      }

      return jsonResponse({ ok: true });
    } catch (err) {
      return jsonResponse({ error: 'Failed to store signal' }, 500);
    }
  }

  if (request.method === 'GET') {
    try {
      const raw = await kv.get(key);
      if (!raw) {
        return jsonResponse(type.endsWith('-ice') ? [] : null);
      }
      return jsonResponse(JSON.parse(raw));
    } catch (err) {
      return jsonResponse({ error: 'Failed to read signal' }, 500);
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}
