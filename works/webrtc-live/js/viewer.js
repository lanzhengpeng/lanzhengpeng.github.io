const SIGNAL_URL = '/webrtc-signal';

let pc = null;
let pollInterval = null;
let listeners = [];
let activeWait = false;

let videoEl = null;
let connectBtn = null;
let statusEl = null;
let roomLabel = null;

function bind(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    listeners.push({ target, event, handler, options });
}

function setStatus(text, type = '') {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = 'status ' + type;
}

function getRoomId() {
    const params = new URLSearchParams(location.search);
    return params.get('room') || 'DEMO';
}

async function postSignal(type, data) {
    const roomId = getRoomId();
    return fetch(`${SIGNAL_URL}/${roomId}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

async function getSignal(type) {
    const roomId = getRoomId();
    const res = await fetch(`${SIGNAL_URL}/${roomId}/${type}`);
    return res.json();
}

async function waitForOffer() {
    setStatus('等待主播开始直播...');
    activeWait = true;
    while (activeWait) {
        const offer = await getSignal('offer');
        if (offer && offer.sdp) return offer;
        await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error('取消等待');
}

async function pollBroadcasterIce() {
    if (!pc) return;
    try {
        const candidates = await getSignal('broadcaster-ice');
        if (Array.isArray(candidates)) {
            for (const c of candidates) {
                if (c.candidate) {
                    await pc.addIceCandidate(new RTCIceCandidate(c));
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
}

async function connect() {
    if (connectBtn) connectBtn.disabled = true;
    setStatus('正在获取主播画面...');

    pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.ontrack = (event) => {
        if (event.streams && event.streams[0] && videoEl) {
            videoEl.srcObject = event.streams[0];
            setStatus('已连接，正在播放', 'connected');
        }
    };

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            postSignal('viewer-ice', event.candidate);
        }
    };

    try {
        const offer = await waitForOffer();
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await postSignal('answer', answer);

        if (pollInterval) clearInterval(pollInterval);
        pollInterval = setInterval(() => {
            if (pc) pollBroadcasterIce();
        }, 1000);
    } catch (e) {
        if (activeWait) {
            setStatus('连接失败：' + e.message, 'error');
            if (connectBtn) connectBtn.disabled = false;
        }
    }
}

function bindControls() {
    if (connectBtn) bind(connectBtn, 'click', connect);
}

export function init() {
    destroy();

    videoEl = document.getElementById('remote-video');
    connectBtn = document.getElementById('connect-btn');
    statusEl = document.getElementById('status');
    roomLabel = document.getElementById('room-label');

    if (roomLabel) {
        roomLabel.textContent = `房间号：${getRoomId()}`;
    }
    bindControls();
}

export function destroy() {
    activeWait = false;
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
    if (pc) {
        pc.close();
        pc = null;
    }
    if (videoEl) videoEl.srcObject = null;
    listeners.forEach(({ target, event, handler, options }) => {
        target.removeEventListener(event, handler, options);
    });
    listeners = [];
    videoEl = null;
    connectBtn = null;
    statusEl = null;
    roomLabel = null;
}
