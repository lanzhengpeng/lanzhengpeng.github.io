import { useCallback, useEffect, useRef, useState } from 'react';
import { generateRoomId, resolveViewerHost, postSignal, getSignal } from '../lib/signalApi.js';

export function useBroadcaster() {
    const [roomId, setRoomId] = useState('');
    const roomIdRef = useRef(roomId);
    const [viewerHost, setViewerHost] = useState('');
    const [viewerUrl, setViewerUrl] = useState('');
    const [status, setStatus] = useState({ text: '点击开始直播', type: '' });
    const [showManualIp, setShowManualIp] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const pollIntervalRef = useRef(null);
    const videoRef = useRef(null);

    useEffect(() => {
        roomIdRef.current = roomId;
    }, [roomId]);

    const stopBroadcast = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsStreaming(false);
    }, []);

    useEffect(() => {
        return () => stopBroadcast();
    }, [stopBroadcast]);

    const pollAnswer = useCallback(async () => {
        const pc = pcRef.current;
        const currentRoomId = roomIdRef.current;
        if (!pc || !currentRoomId) return;
        try {
            const answer = await getSignal(currentRoomId, 'answer');
            if (answer && answer.sdp && pc.signalingState !== 'stable') {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                setStatus({ text: '观众已连接，正在传输画面', type: 'connected' });
            }
            const candidates = await getSignal(currentRoomId, 'viewer-ice');
            if (Array.isArray(candidates)) {
                for (const c of candidates) {
                    if (c.candidate) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(c));
                        } catch (err) {
                            console.warn('Broadcaster: failed to add ICE candidate:', err);
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const beginStreaming = useCallback(async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            setStatus({
                text: '当前环境不支持屏幕共享。请使用 https://、localhost 或 127.0.0.1 访问，勿直接通过局域网 IP 打开。',
                type: 'error',
            });
            return;
        }

        setStatus({ text: '正在获取屏幕共享...', type: '' });
        try {
            localStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });
            if (videoRef.current) videoRef.current.srcObject = localStreamRef.current;
        } catch (e) {
            setStatus({ text: '无法获取屏幕共享：' + e.message, type: 'error' });
            return;
        }

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        pcRef.current = pc;

        const currentRoomId = roomIdRef.current;
        if (!currentRoomId) {
            setStatus({ text: '房间号未生成，请重试', type: 'error' });
            return;
        }

        console.log('Broadcaster: starting stream for room', currentRoomId);

        localStreamRef.current.getTracks().forEach((track) => {
            pc.addTrack(track, localStreamRef.current);
        });

        pc.onicecandidate = (event) => {
            if (event.candidate && currentRoomId) {
                postSignal(currentRoomId, 'broadcaster-ice', event.candidate);
            }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await postSignal(currentRoomId, 'offer', offer);
        console.log('Broadcaster: posted offer');

        setStatus({ text: '等待观众扫码连接...', type: '' });
        setIsStreaming(true);

        pollIntervalRef.current = setInterval(() => {
            if (!pcRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
                return;
            }
            pollAnswer();
        }, 1000);
    }, [pollAnswer]);

    const startBroadcast = useCallback(async () => {
        const newRoomId = generateRoomId();
        setRoomId(newRoomId);
        roomIdRef.current = newRoomId;
        setShowManualIp(false);
        setStatus({ text: '正在获取局域网地址...', type: '' });

        const host = await resolveViewerHost();
        if (!host) {
            setShowManualIp(true);
            setStatus({ text: '无法自动获取局域网 IP，请手动输入', type: '' });
            return;
        }

        setViewerHost(host);
        setViewerUrl(`http://${host}/works/webrtc-live/viewer.html?room=${newRoomId}`);
        await beginStreaming();
    }, [beginStreaming]);

    const applyManualIp = useCallback(
        async (ip) => {
            const host = `${ip}:${window.location.port || 3000}`;
            const currentRoomId = roomIdRef.current;
            setViewerHost(host);
            setViewerUrl(`http://${host}/works/webrtc-live/viewer.html?room=${currentRoomId}`);
            setShowManualIp(false);
            await beginStreaming();
        },
        [beginStreaming]
    );

    return {
        roomId,
        viewerUrl,
        status,
        showManualIp,
        isStreaming,
        videoRef,
        startBroadcast,
        stopBroadcast,
        applyManualIp,
    };
}
