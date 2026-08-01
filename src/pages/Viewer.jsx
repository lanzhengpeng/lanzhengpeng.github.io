import Layout from '../components/Layout.jsx';
import BackLink from '../components/BackLink.jsx';
import { useViewer } from '../hooks/useViewer.js';

export default function Viewer() {
    const { roomId, status, isConnected, videoRef, connect } = useViewer();

    return (
        <Layout route="/works/webrtc-live/viewer.html">
            <div className="webrtc-page">
                <header className="top-bar">
                    <BackLink href="/works/webrtc-live/">返回小猫直播</BackLink>
                </header>

                <main className="container">
                    <h1>我要观看</h1>
                    <p className="subtitle">输入房间号，连接主播的画面</p>

                    <div className="card">
                        <div id="room-label" className="url-text">房间号：{roomId}</div>
                        <video id="remote-video" ref={videoRef} autoPlay playsInline muted />
                        <div className="btn-row btn-row-center">
                            <button id="connect-btn" className="btn" onClick={connect} disabled={isConnected}>
                                连接直播
                            </button>
                        </div>
                        <div id="status" className={`status ${status.type}`}>{status.text}</div>
                    </div>
                </main>

                <footer>
                    <p>&copy; 2026 兰政鹏。</p>
                </footer>
            </div>
        </Layout>
    );
}
