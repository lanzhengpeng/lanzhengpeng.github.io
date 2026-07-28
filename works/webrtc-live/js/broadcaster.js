const SIGNAL_URL = '/webrtc-signal';

let roomId = '';
let viewerHost = '';
let pc = null;
let localStream = null;
let pollInterval = null;
let listeners = [];

let videoEl = null;
let startBtn = null;
let stopBtn = null;
let statusEl = null;
let qrcodeEl = null;
let urlTextEl = null;
let manualIpWrap = null;
let manualIpInput = null;
let applyIpBtn = null;

function bind(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    listeners.push({ target, event, handler, options });
}

function setStatus(text, type = '') {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = 'status ' + type;
}

function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function isLocalhost(host) {
    return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

function isPrivateIP(ip) {
    return /^10\./.test(ip) || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip) || /^192\.168\./.test(ip);
}

function discoverLocalIP() {
    return new Promise((resolve) => {
        let resolved = false;
        const pc = new RTCPeerConnection({ iceServers: [] });

        pc.createDataChannel('');
        pc.createOffer().then((offer) => pc.setLocalDescription(offer));

        pc.onicecandidate = (ice) => {
            if (resolved || !ice || !ice.candidate || !ice.candidate.candidate) {
                if (!resolved) {
                    resolved = true;
                    pc.close();
                    resolve(null);
                }
                return;
            }
            const match = /([0-9]{1,3}\.){3}[0-9]{1,3}/.exec(ice.candidate.candidate);
            if (match && isPrivateIP(match[0])) {
                resolved = true;
                pc.onicecandidate = null;
                pc.close();
                resolve(match[0]);
            }
        };

        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                pc.close();
                resolve(null);
            }
        }, 3000);
    });
}

async function resolveViewerHost() {
    if (!isLocalhost(location.hostname)) {
        return location.host;
    }

    const ip = await discoverLocalIP();
    if (ip) {
        return `${ip}:${location.port || 3000}`;
    }

    return null;
}

function updateQR() {
    if (!qrcodeEl || !urlTextEl || !viewerHost || !roomId) return;
    const viewerUrl = `http://${viewerHost}/works/webrtc-live/viewer.html?room=${roomId}`;
    urlTextEl.textContent = viewerUrl;
    qrcodeEl.innerHTML = '';
    new QRCode(qrcodeEl, {
        text: viewerUrl,
        width: 180,
        height: 180,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M,
    });
}

function showManualIp() {
    if (manualIpWrap) manualIpWrap.style.display = 'block';
    setStatus('无法自动获取局域网 IP，请手动输入');
}

function hideManualIp() {
    if (manualIpWrap) manualIpWrap.style.display = 'none';
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

async function pollAnswer() {
    if (!pc) return;
    try {
        const answer = await getSignal('answer');
        if (answer && answer.sdp && pc.signalingState !== 'stable') {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            setStatus('观众已连接，正在传输画面', 'connected');
        }

        const candidates = await getSignal('viewer-ice');
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

async function beginStreaming() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        setStatus(
            '当前环境不支持屏幕共享。请使用 https://、localhost 或 127.0.0.1 访问，' +
                '勿直接通过局域网 IP 打开。',
            'error'
        );
        return;
    }

    setStatus('正在获取屏幕共享...');
    try {
        localStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
        });
        if (videoEl) videoEl.srcObject = localStream;
    } catch (e) {
        setStatus('无法获取屏幕共享：' + e.message, 'error');
        return;
    }

    pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
    });

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            postSignal('broadcaster-ice', event.candidate);
        }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await postSignal('offer', offer);

    setStatus('等待观众扫码连接...');
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;

    pollInterval = setInterval(() => {
        if (!pc) {
            clearInterval(pollInterval);
            pollInterval = null;
            return;
        }
        pollAnswer();
    }, 1000);
}

async function startBroadcast() {
    roomId = generateRoomId();
    hideManualIp();

    setStatus('正在获取局域网地址...');
    viewerHost = await resolveViewerHost();

    if (!viewerHost) {
        showManualIp();
        return;
    }

    updateQR();
    await beginStreaming();
}

function applyManualIp() {
    if (!manualIpInput) return;
    const ip = manualIpInput.value.trim();
    if (!ip) {
        setStatus('请输入有效的 IP 地址', 'error');
        return;
    }
    viewerHost = `${ip}:${location.port || 3000}`;
    updateQR();
    hideManualIp();
    beginStreaming();
}

function stopBroadcast() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
    if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        localStream = null;
    }
    if (pc) {
        pc.close();
        pc = null;
    }
    if (videoEl) videoEl.srcObject = null;
    if (qrcodeEl) qrcodeEl.innerHTML = '';
    if (urlTextEl) urlTextEl.textContent = '';
    hideManualIp();
    setStatus('直播已停止');
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
}

function bindControls() {
    if (startBtn) bind(startBtn, 'click', startBroadcast);
    if (stopBtn) bind(stopBtn, 'click', stopBroadcast);
    if (applyIpBtn) bind(applyIpBtn, 'click', applyManualIp);
}

export function init() {
    destroy();

    videoEl = document.getElementById('local-video');
    startBtn = document.getElementById('start-btn');
    stopBtn = document.getElementById('stop-btn');
    statusEl = document.getElementById('status');
    qrcodeEl = document.getElementById('qrcode');
    urlTextEl = document.getElementById('url-text');
    manualIpWrap = document.getElementById('manual-ip-wrap');
    manualIpInput = document.getElementById('manual-ip');
    applyIpBtn = document.getElementById('apply-ip-btn');

    bindControls();
}

export function destroy() {
    stopBroadcast();
    listeners.forEach(({ target, event, handler, options }) => {
        target.removeEventListener(event, handler, options);
    });
    listeners = [];
    videoEl = null;
    startBtn = null;
    stopBtn = null;
    statusEl = null;
    qrcodeEl = null;
    urlTextEl = null;
    manualIpWrap = null;
    manualIpInput = null;
    applyIpBtn = null;
}
