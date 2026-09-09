import { useLanguage } from '../contexts/LanguageContext.jsx';
import Layout from '../components/Layout.jsx';
import LanguageSwitch from '../components/LanguageSwitch.jsx';
import AvatarPlayer from '../components/AvatarPlayer.jsx';
import Typewriter from '../components/Typewriter.jsx';
import StatsBar from '../components/StatsBar.jsx';
import { useStats } from '../hooks/useStats.js';

export default function Home() {
    const { t, language } = useLanguage();
    const {
        likeCount,
        visitorCount,
        plusOneCount,
        liked,
        like,
        plusOne,
    } = useStats();

    const scrollToPublication = (e) => {
        e.preventDefault();
        const el = document.getElementById('publication');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <Layout route="/" showMusicControl={false}>
            <LanguageSwitch />
            <StatsBar
                visitorCount={visitorCount}
                plusOneCount={plusOneCount}
                onPlusOne={plusOne}
                language={language}
                lastUpdatedText={t('lastUpdated')}
            />

            <div className="container">
                <section className="hero visible">
                    <AvatarPlayer />
                    <button
                        id="like-btn"
                        className={`stat-btn like-under-avatar ${liked ? 'liked' : ''}`}
                        aria-label="Like"
                        onClick={like}
                        title={liked ? 'You can only like once per day' : ''}
                    >
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span>{t('likeBtn')}</span>
                        <span id="like-count" className="stat-count">{likeCount}</span>
                    </button>
                    <h1>{t('name')}</h1>
                    <div className="intro-line">{t('heroIntro')}</div>
                    <div className="tagline">
                        <Typewriter phrases={t('phrases') || []} />
                        <span className="cursor"></span>
                    </div>
                    <div className="links">
                        <a href="https://github.com/lanzhengpeng" target="_blank" rel="noopener">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            GitHub
                        </a>
                        <a href="mailto:lanzhengpeng@qq.com">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            Email
                        </a>
                        <a href="/works/">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                            <span>Works</span>
                        </a>
                        <a href="#publication" onClick={scrollToPublication}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                            <span>{t('navPub')}</span>
                        </a>
                    </div>
                </section>

                <section id="about">
                    <h2><span>{t('aboutTitle')}</span></h2>
                    <div className="card">
                        <p>{t('aboutText')}</p>
                    </div>
                </section>

                <section id="skills">
                    <h2><span>{t('skillsTitle')}</span></h2>
                    <div className="card">
                        <div className="skills-grid">
                            {t('skills').map((skill) => (
                                <span key={skill} className="skill-tag">{skill}</span>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="publication">
                    <h2><span>{t('pubTitle')}</span></h2>
                    <div className="card">
                        <div className="thesis-title">LatentReAct: Decomposed Latent Verification for Robust Tool-Using Agents</div>
                        <div className="thesis-meta">Zhengpeng Lan, Ronghua Han, Jianmin Han · School of Computer Science and Technology, Zhejiang Normal University</div>
                        <p className="abstract">{t('abstractText')}</p>
                        <div className="btn-group">
                            <a href="/files/LatentReAct_Decomposed_Latent_Verification_for_Robust_Tool-Using_Agents.pdf" className="btn" download>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                <span>{t('downloadBtn')}</span>
                            </a>
                            <a href="https://link.springer.com/chapter/10.1007/978-981-92-3557-5_1" className="btn btn-secondary" target="_blank" rel="noopener">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                                <span>{t('viewSpringer')}</span>
                            </a>
                        </div>
                    </div>
                </section>

                <footer>
                    <div>&copy; 2026 Zhengpeng Lan.</div>
                </footer>
            </div>
        </Layout>
    );
}
