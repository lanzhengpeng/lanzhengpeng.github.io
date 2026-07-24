const SIGNAL_URL = '/webrtc-signal';
const params = new URLSearchParams(location.search);
const roomId = params.get('room') || 'DEMO';

let pc = null;

const videoEl = document.getElementById('remote-video');
const connectBtn = document.getElementById('connect-btn');
const statusEl = document.getElementById('status');
const roomLabel = document.getElementById('room-label');

function setStatus(text, type = '') {
    statusEl.textContent = text;
    statusEl.className = 'status ' + type;
}

if (roomLabel) {
    roomLabel.textContent = `房间号：${roomId}`;
}

async function postSignal(type, data) {
    return fetch(`${SIGNAL_URL}/${roomId}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

async function getSignal(type) {
    const res = await fetch(`${SIGNAL_URL}/${roomId}/${type}`);
    return res.json();
}

async function waitForOffer() {
    setStatus('等待主播开始直播...');
    while (true) {
        const offer = await getSignal('offer');
        if (offer && offer.sdp) return offer;
        await new Promise((r) => setTimeout(r, 1000));
    }
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
    connectBtn.disabled = true;
    setStatus('正在获取主播画面...');

    pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
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

        setInterval(() => {
            if (pc) pollBroadcasterIce();
        }, 1000);
    } catch (e) {
        setStatus('连接失败：' + e.message, 'error');
        connectBtn.disabled = false;
    }
}

connectBtn.addEventListener('click', connect);
