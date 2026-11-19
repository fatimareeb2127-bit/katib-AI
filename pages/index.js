import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import logo from '../assets/logo.png';
import { defaultCustomization, loadThemePreferences, themes } from '../lib/themes';
import { countWords, readDocuments, writeDocuments, createVersion, normalizeDocument } from '../lib/documentStorage';

const tools = [
  ['generate', 'AI Writer', 'Create original content'],
  ['grammar', 'Grammar', 'Correct and clarify'],
  ['paraphrase', 'Paraphrase', 'Rewrite in another style'],
  ['summarize', 'Summarize', 'Extract the key message'],
  ['rewriter', 'Improve writing', 'Strengthen clarity and flow'],
  ['expand', 'Expand', 'Add useful detail'],
  ['shorten', 'Shorten', 'Make writing concise'],
  ['tone', 'Change tone', 'Adjust the voice'],
  ['translate', 'Translate', 'Write in another language'],
  ['academic', 'Academic', 'Support research writing'],
  ['analyze', 'Analyze', 'Review writing quality'],
];

const templates = [
  {
    name: 'Thesis format (10 pages)',
    category: 'Academic',
    body: '<h1>Thesis Title</h1><h2>Abstract</h2><p>[Write a concise summary of the research.]</p><h2>Introduction</h2><p>[Introduce the research topic and context.]</p><h2>Literature Review</h2><p>[Organize the evidence by theme.]</p><h2>Methodology</h2><p>[Describe the research approach.]</p><h2>Results</h2><p>[Present verified findings.]</p><h2>Discussion</h2><p>[Interpret the findings.]</p><h2>Conclusion</h2><p>[Summarize contributions and limitations.]</p>',
    source: 'https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fcreatecatalog.public.onecdn.static.microsoft%2Fcatalog-assets%2Fen-us%2F1598f8d7-f58a-40b3-b8a4-c688737022d5%2FTF1598f8d7-f58a-40b3-b8a4-c688737022d59223828f_wac-2c05026180d6.docx',
  },
  {
    name: 'Student academic self-assessment',
    category: 'Learning',
    body: '<h1>Academic Self-Assessment</h1><h2>Student and course</h2><p>Student name:<br>Course:<br>Date:</p><h2>Learning goals</h2><p>[List the goals for this course.]</p><h2>Progress</h2><p>[Describe progress against each goal.]</p><h2>Challenges</h2><p>[Identify areas that need improvement.]</p><h2>Action plan</h2><p>[Define next steps.]</p>',
    source: 'https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fcreatecatalog.public.onecdn.static.microsoft%2Fcatalog-assets%2Fen-us%2F5543cb47-37ee-417d-b1c1-86f66dc49e25%2FTF5543cb47-37ee-417d-b1c1-86f66dc49e2514b4d271_wac-c9477fdac93b.docx',
  },
  {
    name: 'Course syllabus',
    category: 'Learning',
    body: '<h1>Course Syllabus</h1><h2>Course information</h2><p>Course title:<br>Instructor:<br>Term:<br>Schedule:</p><h2>Course description</h2><p>[Describe the course.]</p><h2>Learning objectives</h2><ul><li>[Objective]</li></ul><h2>Schedule</h2><p>[Add weekly topics.]</p><h2>Assessment</h2><p>[Describe graded work.]</p><h2>Policies</h2><p>[List relevant course policies.]</p>',
    source: 'https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fcreatecatalog.public.onecdn.static.microsoft%2Fcatalog-assets%2Fen-us%2Fc7ca83d5-9382-4ec1-a70b-ca7664f2e21e%2FTFc7ca83d5-9382-4ec1-a70b-ca7664f2e21e425550aa_wac-bf5730b86de6.docx',
  },
  {
    name: 'Science fair planner',
    category: 'Research',
    body: '<h1>Science Fair Project</h1><h2>Project title</h2><p>[Working title]</p><h2>Question</h2><p>[State the research question.]</p><h2>Hypothesis</h2><p>[State the testable hypothesis.]</p><h2>Materials</h2><ul><li>[Material]</li></ul><h2>Procedure</h2><ol><li>[Step]</li></ol><h2>Data and observations</h2><p>[Record results.]</p><h2>Conclusion</h2><p>[Summarize the evidence.]</p>',
    source: 'https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fcreatecatalog.public.onecdn.static.microsoft%2Fcatalog-assets%2Fen-us%2F704bc760-9337-40d0-9f52-b3b70d07b073%2FTF704bc760-9337-40d0-9f52-b3b70d07b07301597968_wac-293f021b2908.docx',
  },
  {
    name: 'Short essay outline',
    category: 'Writing',
    body: '<h1>Essay Title</h1><h2>Introduction</h2><p><strong>Hook:</strong> [Opening]</p><p><strong>Thesis:</strong> [Main argument]</p><h2>Body paragraph 1</h2><p><strong>Topic sentence:</strong><br><strong>Evidence:</strong><br><strong>Analysis:</strong></p><h2>Body paragraph 2</h2><p><strong>Topic sentence:</strong><br><strong>Evidence:</strong><br><strong>Analysis:</strong></p><h2>Conclusion</h2><p>[Restate the argument and significance.]</p>',
    source: 'https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fcreatecatalog.public.onecdn.static.microsoft%2Fcatalog-assets%2Fen-us%2Ff579fee7-81ba-4692-b8b7-760ad76f4c7b%2FTFf579fee7-81ba-4692-b8b7-760ad76f4c7bbeb2d9d7_wac-ecd84b572ca9.docx',
  },
  {
    name: 'Grading rubric',
    category: 'Assessment',
    body: '<h1>Grading Rubric</h1><h2>Assignment</h2><p>[Assignment name]</p><table><tr><th>Criterion</th><th>Exemplary</th><th>Proficient</th><th>Developing</th><th>Points</th></tr><tr><td>[Criterion]</td><td>[Description]</td><td>[Description]</td><td>[Description]</td><td>[Points]</td></tr></table><h2>Feedback</h2><p>[Provide specific feedback.]</p>',
    source: 'https://word.cloud.microsoft/search/learning/',
  },
];

export default function Home() {
  const router = useRouter();
  const editorRef = useRef(null);
  const [activeView, setActiveView] = useState('workspace');
  const [activeTool, setActiveTool] = useState('generate');
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState(null);
  const [title, setTitle] = useState('Untitled document');
  const [content, setContent] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [option, setOption] = useState('');
  const [language, setLanguage] = useState('Spanish');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('light');
  const [toast, setToast] = useState('');
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('modern-saas');
  const [customization, setCustomization] = useState(defaultCustomization);
  const [saveState, setSaveState] = useState('Saved');
  const [showVersions, setShowVersions] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionMenu, setSelectionMenu] = useState(null);

  useEffect(() => {
    setDocuments(readDocuments());
    const preferences = loadThemePreferences();
    setActiveTemplate(preferences.template);
    setCustomization(preferences.customization);
    setTheme(preferences.customization.mode === 'dark' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (!documentId) return;
    setSaveState('Saving');
    const timer = setTimeout(() => {
      setDocuments((current) => {
        const next = current.map((doc) => doc.id === documentId ? createVersion(normalizeDocument({ ...doc, title, content, updatedAt: Date.now() })) : doc);
        if (!next.some((doc) => doc.id === documentId)) {
          next.unshift(normalizeDocument({ id: documentId, title, content, createdAt: Date.now(), updatedAt: Date.now() }));
        }
        writeDocuments(next);
        return next;
      });
      setSaveState('Saved');
    }, 700);
    return () => clearTimeout(timer);
  }, [title, content, documentId]);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2400);
  };

  const updateCustomization = (key, value) => {
    const next = { ...customization, [key]: value };
    setCustomization(next);
    localStorage.setItem('deepwrite-customization', JSON.stringify(next));
    window.dispatchEvent(new Event('deepwrite-theme-change'));
  };

  const resetCustomization = () => {
    setCustomization(defaultCustomization);
    localStorage.setItem('deepwrite-customization', JSON.stringify(defaultCustomization));
    window.dispatchEvent(new Event('deepwrite-theme-change'));
    notify('Customization reset');
  };

  const createDocument = (templateTitle = 'Untitled document', templateContent = '') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setDocumentId(id);
    setTitle(templateTitle);
    setContent(templateContent);
    setOutput('');
    setError('');
    setActiveView('editor');
  };

  const openDocument = (doc) => {
    setDocumentId(doc.id);
    setTitle(doc.title);
    setContent(doc.content || '');
    setOutput('');
    setActiveView('editor');
  };

  const runTool = async () => {
    const source = input || content;
    if (!source.trim()) {
      setError('Enter text or open a document before running this tool.');
      return;
    }
    setLoading(true);
    setError('');
    setOutput('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: activeTool,
          text: source,
          style: option || 'Standard',
          tone: option || 'Professional',
          format: option || 'Key points',
          task: option || 'Improve this academic text',
          language,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI request failed.');
      setOutput(data.output);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    notify('Copied to clipboard');
  };

  const insertOutput = () => {
    if (!output) return;
    setContent((current) => `${current}${current ? '\n\n' : ''}${output}`);
    notify('Output inserted into document');
  };

  const replaceOutput = () => {
    if (!output) return;
    setContent(output);
    notify('Document replaced with output');
  };

  const updateDocument = (id, changes) => {
    const next = documents.map((doc) => doc.id === id ? normalizeDocument({ ...doc, ...changes, updatedAt: Date.now() }) : doc);
    setDocuments(next);
    writeDocuments(next);
  };

  const duplicateDocument = (doc) => {
    const copy = normalizeDocument({
      ...doc,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: `${doc.title} (copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      versions: [],
    });
    const next = [copy, ...documents];
    setDocuments(next);
    writeDocuments(next);
    notify('Document duplicated');
  };

  const deleteDocument = (doc) => {
    const next = documents.map((item) => item.id === doc.id ? normalizeDocument({ ...item, deleted: true, updatedAt: Date.now() }) : item);
    setDocuments(next);
    writeDocuments(next);
    if (documentId === doc.id) setActiveView('documents');
    notify('Document moved to deleted');
  };

  const restoreDocument = (doc) => {
    updateDocument(doc.id, { deleted: false });
    notify('Document restored');
  };

  const saveNow = () => {
    if (!documentId) return;
    const next = documents.map((doc) => doc.id === documentId
      ? createVersion(normalizeDocument({ ...doc, title, content, updatedAt: Date.now() }))
      : doc);
    if (!next.some((doc) => doc.id === documentId)) {
      next.unshift(normalizeDocument({ id: documentId, title, content, createdAt: Date.now(), updatedAt: Date.now() }));
    }
    setDocuments(next);
    writeDocuments(next);
    setSaveState('Saved');
    notify('Document saved');
  };

  const importFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        notify(`${file.name} exceeds the 10 MB limit`);
        continue;
      }
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
        reader.readAsDataURL(file);
      });
      try {
        const response = await fetch('/api/extract-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, base64 }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Could not process ${file.name}`);
        const doc = normalizeDocument({
          title: file.name.replace(/\.[^.]+$/, ''),
          content: `<p>${data.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>')}</p>`,
          documentType: 'Imported',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        const next = [doc, ...documents];
        setDocuments(next);
        writeDocuments(next);
        notify(`${file.name} imported`);
      } catch (err) {
        notify(err.message);
      }
    }
    event.target.value = '';
  };

  const restoreVersion = (version) => {
    setTitle(version.title);
    setContent(version.content);
    setShowVersions(false);
    notify('Previous version restored');
  };

  const exportDocument = async (type) => {
    const filename = title.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'document';
    if (type === 'docx') {
      try {
        const response = await fetch('/api/export-docx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        });
        if (!response.ok) throw new Error('DOCX export failed.');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.docx`;
        link.click();
        URL.revokeObjectURL(url);
        notify('DOCX exported');
      } catch (err) {
        notify(err.message);
      }
      return;
    }
    let blob;
    let extension;
    if (type === 'pdf') {
      const win = window.open('', '_blank');
      win.document.write(`<html><head><title>${title}</title></head><body><h1>${title}</h1><pre style="white-space:pre-wrap;font-family:Arial">${content.replace(/[<>&]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</pre></body></html>`);
      win.document.close();
      win.print();
      return;
    }
    if (type === 'html') {
      blob = new Blob([`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${title}</h1>${content}</body></html>`], { type: 'text/html;charset=utf-8' });
      extension = 'html';
    } else if (type === 'markdown') {
      const plain = content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
      blob = new Blob([`# ${title}\n\n${plain}`], { type: 'text/markdown;charset=utf-8' });
      extension = 'md';
    } else {
      blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      extension = 'txt';
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const format = (command, value = null) => {
    document.execCommand(command, false, value);
    setContent(editorRef.current?.innerHTML || '');
  };

  const filteredDocuments = documents.filter((doc) =>
    !doc.deleted && `${doc.title} ${doc.content}`.toLowerCase().includes(search.toLowerCase())
  );
  const deletedDocuments = documents.filter((doc) => doc.deleted);

  const words = countWords(content);
  const activeToolName = tools.find(([id]) => id === activeTool)?.[1] || 'AI Writer';

  return (
    <>
      <Head><title>Katib AI</title><meta name="description" content="Katib AI writing workspace" /></Head>
      <div className="app-shell">
        <aside className="sidebar">
          <button className="brand" onClick={() => setActiveView('workspace')} aria-label="Katib AI workspace"><span className="brand-mark"><Image src={logo} alt="Katib AI logo" width={42} height={42} /></span><span>Katib AI</span></button>
          <button className="new-document" onClick={() => createDocument()}><span>＋</span> New document</button>
          <nav>
            {[
              ['workspace', '⌂', 'Workspace'],
              ['editor', '◫', 'Editor'],
              ['tools', '✦', 'Writing tools'],
              ['research', '⌕', 'Research'],
              ['citations', '⌇', 'References'],
              ['templates', '▣', 'Templates'],
              ['documents', '▤', 'Documents'],
              ['gallery', '◇', 'UI Templates'],
              ['customize', '⚙', 'Customize'],
            ].map(([view, icon, label]) => (
              <button key={view} className={activeView === view ? 'nav-item active' : 'nav-item'} onClick={() => {
                if (view === 'gallery') router.push('/settings/templates');
                else if (view === 'research') router.push('/research');
                else if (view === 'citations') router.push('/citations');
                else if (view === 'customize') setCustomizerOpen(true);
                else setActiveView(view);
              }}>
                <span>{icon}</span>{label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button onClick={() => {
              const nextMode = theme === 'light' ? 'dark' : 'light';
              setTheme(nextMode);
              updateCustomization('mode', nextMode);
            }}>{theme === 'light' ? '☾' : '☀'} {theme === 'light' ? 'Dark mode' : 'Light mode'}</button>
            <button className="active-template" onClick={() => router.push('/settings/templates')}><span>◇</span><div><strong>{themes.find((item) => item.id === activeTemplate)?.name}</strong><small>Active template</small></div></button>
            <div className="profile"><span>U</span><div><strong>Local workspace</strong><small>Private on this device</small></div></div>
          </div>
        </aside>

        <main className="main">
          {activeView === 'workspace' && (
            <div className="view">
              <header className="topbar"><div><p className="eyebrow">YOUR WORKSPACE</p><h1>Good to see you.</h1></div><button className="primary" onClick={() => createDocument()}>Create document</button></header>
              <section className="stats">
                <div><span>Documents</span><strong>{documents.length}</strong></div>
                <div><span>Words written</span><strong>{documents.reduce((sum, doc) => sum + countWords(doc.content || ''), 0)}</strong></div>
                <div><span>Writing time</span><strong>{Math.max(1, Math.ceil(words / 200))} min</strong></div>
              </section>
              <section>
                <div className="section-heading"><h2>Recent documents</h2><button onClick={() => setActiveView('documents')}>View all</button></div>
                {documents.length ? <div className="document-grid">{[...documents].sort((a,b) => b.updatedAt-a.updatedAt).slice(0,6).map((doc) => (
                  <button className="document-card" key={doc.id} onClick={() => openDocument(doc)}><span className="document-icon">▤</span><strong>{doc.title}</strong><p>{countWords(doc.content || '')} words</p></button>
                ))}</div> : <div className="empty-state"><span>✎</span><h3>Create your first document</h3><p>Your writing workspace is ready.</p><button className="primary" onClick={() => createDocument()}>Start writing</button></div>}
              </section>
              <section>
                <div className="section-heading"><h2>Writing tools</h2><button onClick={() => setActiveView('tools')}>Explore tools</button></div>
                <div className="tool-grid">{tools.slice(0,6).map(([id,name,description]) => (
                  <button key={id} className="tool-card" onClick={() => { setActiveTool(id); setActiveView('tools'); }}><span>✦</span><strong>{name}</strong><p>{description}</p></button>
                ))}</div>
              </section>
            </div>
          )}

          {activeView === 'editor' && (
            <div className="editor-layout">
              <header className="editor-header">
                <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Document title" />
                <div className="editor-actions"><span>{saveState} · {words} words · {Math.max(1, Math.ceil(words / 200))} min read</span><button onClick={() => setShowVersions(true)}>Versions</button><button onClick={() => exportDocument('txt')}>TXT</button><button onClick={() => exportDocument('markdown')}>MD</button><button onClick={() => exportDocument('html')}>HTML</button><button onClick={() => exportDocument('docx')}>DOCX</button><button onClick={() => exportDocument('pdf')}>PDF</button><button className="primary" onClick={saveNow}>Save</button></div>
              </header>
              <div className="format-bar">
                <button onClick={() => format('bold')}><b>B</b></button><button onClick={() => format('italic')}><i>I</i></button><button onClick={() => format('underline')}><u>U</u></button>
                <span /><button onClick={() => format('formatBlock', 'h2')}>H2</button><button onClick={() => format('insertUnorderedList')}>• List</button><button onClick={() => format('insertOrderedList')}>1. List</button>
                <span /><button onClick={() => { setActiveView('tools'); setInput(selectedText || content); }}>✦ {selectedText ? 'Improve selection' : 'AI tools'}</button>
              </div>
              <div className="editor-canvas">
                <div
                  ref={editorRef}
                  className="editor"
                  contentEditable
                  suppressContentEditableWarning
                  data-placeholder="Start writing..."
                  onInput={(e) => setContent(e.currentTarget.innerHTML)}
                  onMouseUp={() => setSelectedText(window.getSelection()?.toString().trim() || '')}
                  onKeyUp={() => setSelectedText(window.getSelection()?.toString().trim() || '')}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>
          )}

          {activeView === 'tools' && (
            <div className="view tools-view">
              <header className="topbar"><div><p className="eyebrow">AI WRITING SUITE</p><h1>{activeToolName}</h1></div></header>
              <div className="tool-tabs">{tools.map(([id,name]) => <button key={id} className={activeTool === id ? 'active' : ''} onClick={() => { setActiveTool(id); setOutput(''); setError(''); }}>{name}</button>)}</div>
              <div className="ai-workbench">
                <section className="workbench-panel"><label>{activeTool === 'generate' ? 'Write your instruction' : 'Text to process'}</label><textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={activeTool === 'generate' ? 'Explain what you want to write...' : 'Paste or type your text here...'} />
                  {['paraphrase','tone','summarize','academic'].includes(activeTool) && <label>{activeTool === 'tone' ? 'Tone' : activeTool === 'summarize' ? 'Summary format' : activeTool === 'academic' ? 'Task' : 'Style'}<input value={option} onChange={(e) => setOption(e.target.value)} placeholder={activeTool === 'tone' ? 'Professional' : activeTool === 'summarize' ? 'Key points' : 'Standard'} /></label>}
                  {activeTool === 'translate' && <label>Target language<input value={language} onChange={(e) => setLanguage(e.target.value)} /></label>}
                  <button className="primary run" onClick={runTool} disabled={loading}>{loading ? 'Working…' : `Run ${activeToolName}`}</button>
                  {error && <div className="error">{error}</div>}
                </section>
                <section className="workbench-panel result"><div className="result-heading"><label>Result</label>{output && <div><button onClick={copyOutput}>Copy</button><button onClick={insertOutput}>Insert</button><button onClick={replaceOutput}>Replace</button></div>}</div><div className={output ? 'result-content' : 'result-empty'}>{output || 'Your result will appear here.'}</div></section>
              </div>
            </div>
          )}

          {activeView === 'templates' && (
            <div className="view"><header className="topbar"><div><p className="eyebrow">TEMPLATES</p><h1>Start with structure.</h1></div><a className="catalog-link" href="https://word.cloud.microsoft/create/en/learning-templates/" target="_blank" rel="noreferrer">Browse Microsoft Word templates</a></header><div className="template-grid">{templates.map((template) => <article key={template.name} className="template-card document-template-card"><button onClick={() => createDocument(template.name, template.body)}><span>▤</span><small>{template.category}</small><strong>{template.name}</strong><p>Open an editable document structure</p></button><a href={template.source} target="_blank" rel="noreferrer">View in Microsoft Word</a></article>)}</div></div>
          )}

          {activeView === 'documents' && (
            <div className="view"><header className="topbar"><div><p className="eyebrow">LIBRARY</p><h1>Saved documents</h1></div><div className="library-actions"><label className="import-button">Import files<input type="file" accept=".pdf,.docx,.txt,.md,.markdown" multiple onChange={importFiles} /></label><input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents" /></div></header>
              {filteredDocuments.length ? <div className="document-table">{filteredDocuments.map((doc) => <div className="document-row" key={doc.id}>
                <button className="document-open" onClick={() => openDocument(doc)}><span>▤</span><strong>{doc.title}</strong><small>{countWords(doc.content || '')} words</small><small>{new Date(doc.updatedAt).toLocaleDateString()}</small></button>
                <div className="document-row-actions">
                  <button title="Favorite" onClick={() => updateDocument(doc.id, { favorite: !doc.favorite })}>{doc.favorite ? '★' : '☆'}</button>
                  <button title="Duplicate" onClick={() => duplicateDocument(doc)}>⧉</button>
                  <button title="Archive" onClick={() => updateDocument(doc.id, { archived: !doc.archived })}>{doc.archived ? 'Restore' : 'Archive'}</button>
                  <button title="Delete" onClick={() => deleteDocument(doc)}>Delete</button>
                </div>
              </div>)}</div> : <div className="empty-state"><h3>No documents found</h3><button className="primary" onClick={() => createDocument()}>Create document</button></div>}
              {deletedDocuments.length > 0 && <section className="deleted-section"><h2>Deleted documents</h2>{deletedDocuments.map((doc) => <div className="deleted-row" key={doc.id}><span>{doc.title}</span><button onClick={() => restoreDocument(doc)}>Restore</button></div>)}</section>}
            </div>
          )}
        </main>
        {showVersions && (
          <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowVersions(false)}>
            <aside className="version-panel" role="dialog" aria-modal="true" aria-label="Document version history">
              <header><div><small>VERSION HISTORY</small><h2>{title}</h2></div><button aria-label="Close" onClick={() => setShowVersions(false)}>×</button></header>
              <div className="version-list">
                {(documents.find((doc) => doc.id === documentId)?.versions || []).length ? (documents.find((doc) => doc.id === documentId)?.versions || []).map((version) => (
                  <article key={version.id}><div><strong>{new Date(version.savedAt).toLocaleString()}</strong><p>{countWords(version.content)} words</p></div><button onClick={() => restoreVersion(version)}>Restore</button></article>
                )) : <div className="empty-state"><h3>No previous versions</h3><p>Versions are created as you save and autosave.</p></div>}
              </div>
            </aside>
          </div>
        )}
        {customizerOpen && (
          <div className="customizer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setCustomizerOpen(false)}>
            <aside className="theme-customizer" role="dialog" aria-modal="true" aria-label="Theme customization">
              <header><div><small>CUSTOMIZATION</small><h2>Design controls</h2></div><button aria-label="Close" onClick={() => setCustomizerOpen(false)}>×</button></header>
              <div className="customizer-section">
                <h3>Appearance</h3>
                <div className="segmented">
                  {['light','dark','system'].map((mode) => <button key={mode} className={customization.mode === mode ? 'active' : ''} onClick={() => updateCustomization('mode', mode)}>{mode}</button>)}
                </div>
              </div>
              <div className="customizer-section">
                <h3>Colors</h3>
                {[
                  ['primary','Primary'],['secondary','Secondary'],['accent','Accent'],['background','Background'],['surface','Surface'],['text','Text'],['border','Border']
                ].map(([key,label]) => <label className="color-control" key={key}><span>{label}</span><input type="color" value={customization[key] || '#6258d6'} onChange={(event) => updateCustomization(key, event.target.value)} /><button onClick={() => updateCustomization(key, '')}>Reset</button></label>)}
              </div>
              <div className="customizer-section">
                <h3>Layout & typography</h3>
                <label>Sidebar<select value={customization.sidebar} onChange={(event) => updateCustomization('sidebar', event.target.value)}><option value="expanded">Expanded</option><option value="compact">Compact</option><option value="collapsed">Collapsed</option></select></label>
                <label>Spacing<select value={customization.spacing} onChange={(event) => updateCustomization('spacing', event.target.value)}><option value="compact">Compact</option><option value="comfortable">Comfortable</option></select></label>
                <label>Font<select value={customization.font} onChange={(event) => updateCustomization('font', event.target.value)}><option>DM Sans</option><option>Manrope</option><option>Georgia</option><option>Inter</option></select></label>
                <label>Heading size<input type="range" min="26" max="48" value={customization.headingSize} onChange={(event) => updateCustomization('headingSize', Number(event.target.value))} /></label>
                <label>Body size<input type="range" min="13" max="18" value={customization.bodySize} onChange={(event) => updateCustomization('bodySize', Number(event.target.value))} /></label>
              </div>
              <div className="customizer-section">
                <h3>Visual effects</h3>
                <label>Corner radius<input type="range" min="4" max="24" value={customization.radius} onChange={(event) => updateCustomization('radius', Number(event.target.value))} /></label>
                <label>Border intensity<input type="range" min="0" max="2" value={customization.borderIntensity} onChange={(event) => updateCustomization('borderIntensity', Number(event.target.value))} /></label>
                <label className="check-control"><input type="checkbox" checked={customization.shadows} onChange={(event) => updateCustomization('shadows', event.target.checked)} /> Card shadows</label>
                <label>Animation<select value={customization.animation} onChange={(event) => updateCustomization('animation', event.target.value)}><option value="subtle">Subtle</option><option value="normal">Normal</option><option value="expressive">Expressive</option></select></label>
              </div>
              <footer><button onClick={resetCustomization}>Reset to default</button><button className="primary" onClick={() => setCustomizerOpen(false)}>Done</button></footer>
            </aside>
          </div>
        )}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
