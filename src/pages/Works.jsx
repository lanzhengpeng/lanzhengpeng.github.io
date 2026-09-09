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
  const { t, language } = useLanguage();
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

  function handleExportPdf() {
    const previousTitle = document.title;
    document.title = `${t('name')} - ${t('navWorks')}`;
    document.body.classList.add('works-printing');

    const restorePage = () => {
      document.body.classList.remove('works-printing');
      document.title = previousTitle;
      window.removeEventListener('afterprint', restorePage);
    };

    window.addEventListener('afterprint', restorePage);
    window.print();
    restorePage();
  }

  const exportDate = new Date().toLocaleDateString(
    language === 'zh' ? 'zh-CN' : 'en-US',
    { year: 'numeric', month: '2-digit', day: '2-digit' },
  );

  return (
    <>
      <BackToHome label={t('worksBackHome')} />
      <button className="works-export-btn" type="button" onClick={handleExportPdf}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
        </svg>
        {t('worksExportPdf')}
      </button>
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
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="github">
                      源码
                    </a>
                  )}
                  {project.documentUrl && (
                    <a href={encodeURI(project.documentUrl)} download className="document">
                      说明书
                    </a>
                 )}
                  {project.designDocumentUrl && (
                    <a href={encodeURI(project.designDocumentUrl)} download className="design-document">
                      系统设计书
                    </a>
                  )}
                </div>
              </div>
              <div className="works-mockup">
                {project.previewUrl ? (
                  <>
                    {isMobile ? (
                      <div className="phone-frame">
                        <div className="phone-screen">
                          <div className="phone-punch"></div>
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
      <div className="works-print-root">
        <header className="works-print-header">
          <div>
            <h1>{t('name')} {t('navWorks')}</h1>
            <p>{t('heroIntro')}</p>
          </div>
          <div className="works-print-header-links">
            <a href="https://lanzhengpeng.pages.dev/" target="_blank" rel="noopener noreferrer">
              {t('worksExportHome')}
            </a>
            <a href="https://lanzhengpeng.pages.dev/works" target="_blank" rel="noopener noreferrer">
              {t('worksExportPortfolio')}
            </a>
            <span>{t('worksExportGenerated')} · {exportDate}</span>
          </div>
        </header>

        <div className="works-print-grid">
          {projects.map((project, index) => (
            <article key={project.id} className="works-print-card">
              <div className="works-print-card-head">
                <h2>{index + 1}. {project.title}</h2>
                {project.subtitle && <span>{project.subtitle}</span>}
              </div>
              {project.coverImage && (
                <img
                  className={`works-print-cover ${project.displayType === 'mobile' ? 'mobile' : ''}`}
                  src={project.coverImage}
                  alt={`${project.title} 界面截图`}
                />
              )}
              <p>{project.description}</p>
              <p className="works-print-tech">
                {t('worksExportTechStack')}：{(project.techStack || []).join(' · ')}
              </p>
              {(project.githubUrl || project.documentUrl || project.designDocumentUrl) && (
                <div className="works-print-links">
                  {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">{t('worksExportSource')}</a>}
                  {project.documentUrl && <a href={encodeURI(project.documentUrl)} target="_blank" rel="noopener noreferrer">{t('worksExportDocument')}</a>}
                  {project.designDocumentUrl && <a href={encodeURI(project.designDocumentUrl)} target="_blank" rel="noopener noreferrer">{t('worksExportDesignDoc')}</a>}
                </div>
              )}
            </article>
          ))}
        </div>

        <footer className="works-print-footer">
          <span>{t('worksExportNote')}</span>
          <span>lanzhengpeng.pages.dev</span>
        </footer>
      </div>
    </>
  );
}
