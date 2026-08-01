import { useCallback, useEffect, useRef, useState } from 'react';
import { getRoomId, getSignal, postSignal } from '../lib/signalApi.js';

export function useViewer() {
    const [roomId] = useState(getRoomId);
    const [status, setStatus] = useState({ text: '点击连接观看直播', type: '' });
    const [isConnected, setIsConnected] = useState(false);
    const pcRef = useRef(null);
    const pollIntervalRef = useRef(null);
    const activeWaitRef = useRef(false);
    const videoRef = useRef(null);

    const cleanup = useCallback(() => {
        activeWaitRef.current = false;
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsConnected(false);
    }, []);

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    const pollBroadcasterIce = useCallback(async () => {
        const pc = pcRef.current;
        if (!pc) return;
        try {
            const candidates = await getSignal(roomId, 'broadcaster-ice');
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
    }, [roomId]);

    const waitForOffer = useCallback(async () => {
        setStatus({ text: '等待主播开始直播...', type: '' });
        activeWaitRef.current = true;
        while (activeWaitRef.current) {
            const offer = await getSignal(roomId, 'offer');
            if (offer && offer.sdp) return offer;
            await new Promise((r) => setTimeout(r, 1000));
        }
        throw new Error('取消等待');
    }, [roomId]);

    const connect = useCallback(async () => {
        setStatus({ text: '正在获取主播画面...', type: '' });

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        pcRef.current = pc;

        pc.ontrack = (event) => {
            const stream = event.streams && event.streams[0]
                ? event.streams[0]
                : new MediaStream([event.track]);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(() => {});
                setStatus({ text: '已连接，正在播放', type: 'connected' });
                setIsConnected(true);
            }
        };

        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            if (state === 'failed' || state === 'disconnected' || state === 'closed') {
                setStatus({ text: '连接已断开，请刷新重试', type: 'error' });
                setIsConnected(false);
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                postSignal(roomId, 'viewer-ice', event.candidate);
            }
        };

        try {
            const offer = await waitForOffer();
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await postSignal(roomId, 'answer', answer);

            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = setInterval(() => {
                if (pcRef.current) pollBroadcasterIce();
            }, 1000);
        } catch (e) {
            if (activeWaitRef.current) {
                setStatus({ text: '连接失败：' + e.message, type: 'error' });
            }
        }
    }, [roomId, waitForOffer, pollBroadcasterIce]);

    return { roomId, status, isConnected, videoRef, connect };
}
