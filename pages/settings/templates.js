import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import logo from '../../assets/logo.png';
import { loadThemePreferences, themes } from '../../lib/themes';

export default function TemplateGallery() {
  const router = useRouter();
  const [active, setActive] = useState('modern-saas');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    setActive(loadThemePreferences().template);
  }, []);

  const applyTemplate = (id) => {
    localStorage.setItem('deepwrite-template', id);
    setActive(id);
    window.dispatchEvent(new Event('deepwrite-theme-change'));
  };

  return (
    <>
      <Head><title>UI Templates - Katib AI</title></Head>
      <main className="template-gallery">
        <header className="gallery-header">
          <button className="gallery-back" onClick={() => router.push('/')}>← Back to workspace</button>
          <div><p>DESIGN MARKETPLACE</p><h1>Choose your workspace.</h1></div>
          <span>{themes.length} templates</span>
        </header>
        <section className="gallery-grid" aria-label="Available UI templates">
          {themes.map((theme) => (
            <article className={`gallery-card theme-${theme.id}`} key={theme.id}>
              <div className="gallery-preview" aria-label={`${theme.name} preview`}>
                <aside><span className="preview-brand" /><i /><i /><i /><i /></aside>
                <div className="preview-main">
                  <header><b /><span /></header>
                  <h3>Good morning.</h3>
                  <div className="preview-stats"><b /><b /><b /></div>
                  <div className="preview-content"><b /><b /><b /></div>
                </div>
              </div>
              <div className="gallery-card-content">
                <div className="gallery-card-title"><div><span>{theme.category}</span><h2>{theme.name}</h2></div>{active === theme.id && <strong className="active-badge">Active</strong>}</div>
                <p>{theme.description}</p>
                <div className="palette">{theme.colors.map((color) => <span key={color} style={{ background: color }} title={color} />)}</div>
                <div className="gallery-actions"><button onClick={() => setPreview(theme)}>Preview</button><button className="primary" onClick={() => applyTemplate(theme.id)}>{active === theme.id ? 'Applied' : 'Apply template'}</button></div>
              </div>
            </article>
          ))}
        </section>

        {preview && (
          <div className="preview-modal" role="dialog" aria-modal="true" aria-label={`${preview.name} preview`}>
            <div className={`preview-window theme-${preview.id}`}>
              <header><div><span className="preview-logo"><Image src={logo} alt="Katib AI logo" width={34} height={34} /></span><strong>{preview.name}</strong></div><button onClick={() => setPreview(null)}>Exit preview ×</button></header>
              <div className="preview-body">
                <aside><button className="active">⌂ Overview</button><button>▤ Documents</button><button>✦ AI Tools</button><button>▣ Templates</button></aside>
                <main><p>YOUR WORKSPACE</p><h2>Good to see you.</h2><div className="preview-dashboard"><section><span>Documents</span><strong>24</strong></section><section><span>Words written</span><strong>18.4k</strong></section><section><span>Writing goal</span><strong>82%</strong></section></div><div className="preview-panels"><section><h3>Recent documents</h3><div><b /><b /><b /></div></section><section><h3>Writing tools</h3><div><b /><b /></div></section></div></main>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
