const SIGNAL_URL = '/webrtc-signal';

export function isLocalhost(host) {
    return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

export function isPrivateIP(ip) {
    return /^10\./.test(ip) || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip) || /^192\.168\./.test(ip);
}

export function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function discoverLocalIP() {
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

export async function resolveViewerHost() {
    if (!isLocalhost(window.location.hostname)) {
        return window.location.host;
    }
    const ip = await discoverLocalIP();
    if (ip) {
        return `${ip}:${window.location.port || 3000}`;
    }
    return null;
}

export function postSignal(roomId, type, data) {
    return fetch(`${SIGNAL_URL}/${roomId}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export async function getSignal(roomId, type) {
    const res = await fetch(`${SIGNAL_URL}/${roomId}/${type}`);
    return res.json();
}

export function getRoomId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || 'DEMO';
}
