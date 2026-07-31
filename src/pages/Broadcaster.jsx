import { QRCodeCanvas } from 'qrcode.react';
import Layout from '../components/Layout.jsx';
import BackLink from '../components/BackLink.jsx';
import { useBroadcaster } from '../hooks/useBroadcaster.js';

export default function Broadcaster() {
    const {
        viewerUrl,
        status,
        showManualIp,
        isStreaming,
        videoRef,
        startBroadcast,
        stopBroadcast,
        applyManualIp,
    } = useBroadcaster();

    const handleApplyIp = (e) => {
        e.preventDefault();
        const input = e.currentTarget.querySelector('#manual-ip');
        if (input) applyManualIp(input.value.trim());
    };

    return (
        <Layout route="/works/webrtc-live/broadcaster.html">
            <div className="webrtc-page">
                <header className="top-bar">
                    <BackLink href="/works/webrtc-live/">返回小猫直播</BackLink>
                </header>

                <main className="container">
                    <h1>我要开播</h1>
                    <p className="subtitle">选择屏幕或窗口，分享给身边的朋友</p>

                    <div className="card">
                        <video id="local-video" ref={videoRef} autoPlay playsInline muted />
                        <div className="btn-row btn-row-center">
                            <button id="start-btn" className="btn" onClick={startBroadcast} disabled={isStreaming}>
                                开始直播
                            </button>
                            <button id="stop-btn" className="btn btn-danger" onClick={stopBroadcast} disabled={!isStreaming}>
                                停止直播
                            </button>
                        </div>

                        {showManualIp && (
                            <form id="manual-ip-wrap" className="manual-ip-wrap" style={{ display: 'block' }} onSubmit={handleApplyIp}>
                                <p>无法自动获取局域网 IP，请手动输入：</p>
                                <input id="manual-ip" className="manual-ip-input" type="text" placeholder="例如 192.168.1.5" />
                                <button id="apply-ip-btn" type="submit" className="btn btn-sm">确定</button>
                            </form>
                        )}

                        <div id="status" className={`status ${status.type}`}>{status.text}</div>

                        {viewerUrl && (
                            <div className="qr-wrap">
                                <div id="qrcode">
                                    <QRCodeCanvas value={viewerUrl} size={180} level="M" />
                                </div>
                                <div id="url-text" className="url-text">{viewerUrl}</div>
                            </div>
                        )}
                    </div>
                </main>

                <footer>
                    <p>&copy; 2026 兰政鹏。</p>
                </footer>
            </div>
        </Layout>
    );
}
