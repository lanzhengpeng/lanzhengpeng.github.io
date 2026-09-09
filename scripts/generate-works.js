import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../public/works-data');
const outputFile = path.join(dataDir, 'manifest.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const projects = fs.readdirSync(dataDir)
  .filter(f => {
    const fullPath = path.join(dataDir, f);
    return fs.statSync(fullPath).isDirectory() && f !== 'manifest.json';
  })
  .map(folder => {
    const folderPath = path.join(dataDir, folder);
    const metaPath = path.join(folderPath, 'meta.json');
    const previewPath = path.join(folderPath, 'preview.html');
    const coverPath = path.join(folderPath, 'cover.png');

    let meta = {};
    if (fs.existsSync(metaPath)) {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    }

    const hasPreview = fs.existsSync(previewPath);
    const previewUrl = hasPreview ? `/works-data/${folder}/preview.html` : '';

    return {
      id: folder,
      title: meta.title || folder,
      subtitle: meta.subtitle || '',
      description: meta.description || '',
      techStack: meta.techStack || [],
      displayType: meta.displayType || 'browser',
      demoUrl: meta.demoUrl || '',
      githubUrl: meta.githubUrl || '',
      previewUrl: previewUrl,
      coverImage: fs.existsSync(coverPath) ? `/works-data/${folder}/cover.png` : ''
    };
  });

fs.writeFileSync(outputFile, JSON.stringify(projects, null, 2));
console.log(`✅ 已生成 manifest.json，共 ${projects.length} 个项目。`);
