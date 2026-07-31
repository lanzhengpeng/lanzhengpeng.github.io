import Layout from '../components/Layout.jsx';
import BackLink from '../components/BackLink.jsx';

export default function WebRTCLive() {
    return (
        <Layout route="/works/webrtc-live/">
            <div className="webrtc-page">
                <header className="top-bar">
                    <BackLink href="/works/">返回作品页</BackLink>
                </header>

                <main className="container">
                    <img src="/images/小猫灰灰.svg" alt="" className="hero-cat" />
                    <h1>小猫直播</h1>
                    <p className="subtitle">把屏幕画面轻轻分享给身边的朋友</p>

                    <div className="card landing-actions">
                        <p>无需注册，没有广告。在同一 Wi-Fi 下，即可开播、观看，像小猫一样轻快。</p>
                        <div className="btn-row btn-row-center">
                            <a href="/works/webrtc-live/broadcaster.html" className="btn">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                我要开播
                            </a>
                            <a href="/works/webrtc-live/viewer.html" className="btn">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                我要观看
                            </a>
                        </div>
                    </div>

                    <div className="card">
                        <h2>怎么用？</h2>
                        <ol className="info-list steps">
                            <li>电脑打开 <a href="/works/webrtc-live/broadcaster.html">我要开播</a></li>
                            <li>选择想分享的屏幕或窗口</li>
                            <li>用手机扫描二维码，或把链接发给身边的朋友</li>
                            <li>观众打开 <a href="/works/webrtc-live/viewer.html">我要观看</a> 即可看到画面</li>
                        </ol>
                    </div>
                </main>

                <footer>
                    <p>&copy; 2026 兰政鹏。</p>
                </footer>
            </div>
        </Layout>
    );
}
