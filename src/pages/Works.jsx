import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import '../styles/pages/works.css';

const BackToHome = ({ label }) => (
  <a href="/" className="works-back-btn" aria-label="Back to home">
    {label}
  </a>
);

const SkeletonCard = () => (
  <div className="skeleton-section">
    <div className="skeleton-content">
      <div className="skeleton-info">
        <div className="skeleton-title"></div>
        <div className="skeleton-subtitle"></div>
        <div className="skeleton-desc"></div>
        <div className="skeleton-tags">
          <span></span><span></span><span></span>
        </div>
        <div className="skeleton-actions">
          <span></span><span></span>
        </div>
      </div>
      <div className="skeleton-mockup">
        <div className="skeleton-browser"></div>
      </div>
    </div>
  </div>
);

export default function Works() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    fetch('/works-data/manifest.json')
      .then(res => {
        if (!res.ok) throw new Error('manifest not found');
        return res.json();
      })
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => {
        setProjects([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="works-container skeleton-container">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!projects.length) {
    return (
      <>
        <BackToHome label={t('worksBackHome')} />
      <div className="works-empty-state">
        <div className="empty-icon">📭</div>
        <h2>{t('worksEmpty')}</h2>
        <p>
          {t('worksEmptyHint')}
        </p>
        <div className="empty-example">
          <p>示例文件夹结构：</p>
          <pre>
            {`public/works-data/
  └── my-project/
      ├── meta.json
      ├── preview.html
      └── cover.png (可选)`}
          </pre>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <BackToHome label={t('worksBackHome')} />
      <div className="works-container" ref={containerRef}>
      {projects.map((project, index) => {
        const isMobile = project.displayType === 'mobile';
        const tags = (project.techStack || []).map(t => <span key={t}>{t}</span>);

        return (
          <section key={project.id} className="works-section" data-index={index}>
            <div className="works-content">
              <div className="works-info">
                <h1>{project.title}</h1>
                {project.subtitle && <div className="works-subtitle">{project.subtitle}</div>}
                <p className="works-desc">{project.description}</p>
                <div className="works-tech">{tags}</div>
                <div className="works-actions">
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      🔗 在线体验
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="github">
                      🐙 源码
                    </a>
                  )}
                </div>
              </div>
              <div className="works-mockup">
                {project.previewUrl ? (
                  <>
                    {isMobile ? (
                      <div className="phone-frame">
                        <div className="phone-notch"></div>
                        <div className="phone-screen">
                          <iframe src={project.previewUrl} loading="lazy" title={project.title}></iframe>
                        </div>
                      </div>
                    ) : (
                      <div className="browser-frame">
                        <div className="browser-bar">
                          <div className="browser-dots"><span></span><span></span><span></span></div>
                          <div className="browser-url">{project.demoUrl || 'localhost'}</div>
                        </div>
                        <div className="browser-body">
                          <iframe src={project.previewUrl} loading="lazy" title={project.title}></iframe>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mockup-placeholder">
                    <span>📄 请添加 preview.html</span>
                  </div>
                )}
              </div>
            </div>
            <div className="works-page-num">{index + 1} / {projects.length}</div>
          </section>
        );
      })}
      </div>
    </>
  );
}
