import Layout from '../components/Layout.jsx';
import BackLink from '../components/BackLink.jsx';

export default function Works() {
    return (
        <Layout route="/works/">
            <div className="works-page">
                <header className="top-bar">
                    <BackLink href="/">返回</BackLink>
                </header>

                <main className="container">
                    <h1>个人作品</h1>
                    <p className="subtitle">精选项目与实验作品。</p>

                    <div className="project-grid">
                        <article className="project-card cat-bg">
                            <div className="project-title">
                                <img src="/images/小猫灰灰.svg" alt="小猫灰灰" className="cat-logo" width="32" height="32" />
                                <h2>小猫直播</h2>
                            </div>
                            <p className="project-desc">在同一 Wi-Fi 下，轻轻一点，把电脑屏幕分享给身边的朋友。没有广告，也不用注册，像小猫一样轻快。</p>
                            <div className="project-tags">
                                <span>屏幕分享</span>
                                <span>轻量无广告</span>
                                <span>可爱</span>
                            </div>
                            <a href="/works/webrtc-live/">查看详情</a>
                        </article>

                        <article className="project-card placeholder">
                            <h2>更多作品</h2>
                            <p className="project-desc">新项目将陆续添加到这里。</p>
                            <div className="project-tags">
                                <span>待更新</span>
                            </div>
                        </article>
                    </div>
                </main>

                <footer>
                    <p>&copy; 2026 兰政鹏。</p>
                </footer>
            </div>
        </Layout>
    );
}
