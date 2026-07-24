/**
 * Client-side logic for the like and visitor counters.
 *
 * - Fetches the current like count from /like on page load and marks the
 *   button as liked if the same IP already liked today.
 * - Registers the visitor once per browser session via /visitors and caches the count.
 * - Enforces one like per IP per day on the backend; the button is disabled
 *   when the backend reports alreadyLikedToday.
 */

const likeBtn = document.getElementById('like-btn');
const likeCountEl = document.getElementById('like-count');
const visitorCountEl = document.getElementById('visitor-count');

function setText(el, value) {
  if (el) el.textContent = value;
}

async function fetchCount(url) {
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function markLiked(message) {
  if (!likeBtn) return;
  likeBtn.classList.add('liked');
  likeBtn.title = message || 'You can only like once per day';
}

async function initLikeCount() {
  try {
    const data = await fetchCount('/like');
    setText(likeCountEl, data.count);
    if (data.alreadyLikedToday) {
      markLiked(data.message);
    }
  } catch (err) {
    console.error('Failed to load like count:', err);
  }
}

async function initVisitorCount() {
  try {
    const cached = sessionStorage.getItem('visitor_count');
    if (cached !== null) {
      setText(visitorCountEl, cached);
      return;
    }

    const data = await fetchCount('/visitors');
    setText(visitorCountEl, data.count);
    sessionStorage.setItem('visitor_count', String(data.count));
    sessionStorage.setItem('visitor_counted', 'true');
  } catch (err) {
    console.error('Failed to load visitor count:', err);
  }
}

function initLikeButton() {
  if (!likeBtn) return;

  if (localStorage.getItem('liked')) {
    likeBtn.classList.add('liked');
  }

  likeBtn.addEventListener('click', async () => {
    if (likeBtn.classList.contains('liked')) return;

    try {
      const res = await fetch('/like', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setText(likeCountEl, data.count);

      if (data.alreadyLikedToday) {
        markLiked(data.message);
      } else {
        localStorage.setItem('liked', 'true');
        markLiked();
      }
    } catch (err) {
      console.error('Failed to like:', err);
    }
  });
}

initLikeCount();
initVisitorCount();
initLikeButton();
