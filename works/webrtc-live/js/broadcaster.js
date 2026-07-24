const SIGNAL_URL = '/webrtc-signal';
let roomId = '';
let viewerHost = '';
let pc = null;
let localStream = null;

const videoEl = document.getElementById('local-video');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const statusEl = document.getElementById('status');
const qrcodeEl = document.getElementById('qrcode');
const urlTextEl = document.getElementById('url-text');
const manualIpWrap = document.getElementById('manual-ip-wrap');
const manualIpInput = document.getElementById('manual-ip');
const applyIpBtn = document.getElementById('apply-ip-btn');

function setStatus(text, type = '') {
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
    setStatus('正在获取屏幕共享...');
    try {
        localStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
        });
        videoEl.srcObject = localStream;
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
    startBtn.disabled = true;
    stopBtn.disabled = false;

    const pollInterval = setInterval(() => {
        if (!pc) {
            clearInterval(pollInterval);
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
    if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        localStream = null;
    }
    if (pc) {
        pc.close();
        pc = null;
    }
    videoEl.srcObject = null;
    qrcodeEl.innerHTML = '';
    urlTextEl.textContent = '';
    hideManualIp();
    setStatus('直播已停止');
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

startBtn.addEventListener('click', startBroadcast);
stopBtn.addEventListener('click', stopBroadcast);
if (applyIpBtn) applyIpBtn.addEventListener('click', applyManualIp);
