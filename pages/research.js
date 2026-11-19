import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

const researchTools = [
  ['academic', 'Research paper assistant', 'Develop a section of a paper without inventing findings'],
  ['literature', 'Literature review', 'Draft thematic synthesis only from supplied paper information'],
  ['thesis', 'Thesis planner', 'Create chapter and research objectives'],
  ['proposal', 'Research proposal', 'Structure a proposal from the information you provide'],
  ['abstract', 'Abstract generator', 'Create a structured abstract from supplied methods and results'],
  ['gap', 'Research gap analyzer', 'Identify gaps tied to evidence you provide'],
];

export default function ResearchWorkspace() {
  const router = useRouter();
  const [tool, setTool] = useState('academic');
  const [input, setInput] = useState('');
  const [paperContext, setPaperContext] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const runResearchTool = async () => {
    if (!input.trim()) {
      setError('Supply the research information or draft section you want to work from.');
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
          action: 'academic',
          text: `${researchTools.find(([id]) => id === tool)?.[1]}\n\nUser-provided research context:\n${paperContext}\n\nTask/request:\n${input}`,
          task: `Use only the supplied context. Never invent references, DOI values, quotations, datasets, results, limitations or citations. Clearly mark any interpretation or gap that needs checking.`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Research request failed.');
      setOutput(data.output);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Research Workspace - Katib AI</title></Head>
      <main className="research-page">
        <header className="research-header">
          <button onClick={() => router.push('/')}>← Back to workspace</button>
          <div><p>ACADEMIC WORKSPACE</p><h1>Research Workspace</h1></div>
          <button onClick={() => router.push('/')}>Document library</button>
        </header>
        <div className="research-layout">
          <aside className="research-tools">
            {researchTools.map(([id, name, description]) => (
              <button className={tool === id ? 'active' : ''} key={id} onClick={() => { setTool(id); setOutput(''); setError(''); }}>
                <strong>{name}</strong><span>{description}</span>
              </button>
            ))}
          </aside>
          <section className="research-input">
            <label>Source and paper context<textarea value={paperContext} onChange={(event) => setPaperContext(event.target.value)} placeholder="Paste extracted paper information, authors, methods, findings, or limitations. Do not include claims you cannot verify." /></label>
            <label>Your request<textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Example: Organize this information into a research gap section." /></label>
            {error && <div className="error">{error}</div>}
            <button className="primary" onClick={runResearchTool} disabled={loading}>{loading ? 'Working…' : 'Run research assistant'}</button>
          </section>
          <section className="research-output">
            <header><strong>Result</strong>{output && <button onClick={() => navigator.clipboard.writeText(output)}>Copy</button>}</header>
            <div>{output || 'Provide evidence and a clear request. The assistant will preserve accuracy and flag unsupported claims.'}</div>
          </section>
        </div>
      </main>
    </>
  );
}
