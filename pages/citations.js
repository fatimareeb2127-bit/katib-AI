import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const EMPTY = { authors: '', year: '', title: '', publication: '', doi: '', url: '' };

export default function CitationManager() {
  const router = useRouter();
  const [references, setReferences] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [style, setStyle] = useState('apa');

  useEffect(() => {
    try { setReferences(JSON.parse(localStorage.getItem('deepwrite-references') || '[]')); } catch { setReferences([]); }
  }, []);

  const save = (next) => {
    setReferences(next);
    localStorage.setItem('deepwrite-references', JSON.stringify(next));
  };

  const addReference = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    save([...references, { ...form, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` }]);
    setForm(EMPTY);
  };

  const formatReference = (item) => {
    if (style === 'ieee') return `[${references.indexOf(item) + 1}] ${item.authors}, "${item.title}," ${item.publication || 'Publication'}, ${item.year || 'n.d.'}.${item.doi ? ` doi:${item.doi}` : ''}`;
    if (style === 'mla') return `${item.authors}. "${item.title}." ${item.publication || 'Publication'}, ${item.year || 'n.d.'}.${item.doi ? ` https://doi.org/${item.doi}` : ''}`;
    return `${item.authors ? `${item.authors}.` : 'Author unavailable.'} (${item.year || 'n.d.'}). ${item.title}.${item.publication ? ` ${item.publication}.` : ''}${item.doi ? ` https://doi.org/${item.doi}` : ''}`;
  };

  return (
    <>
      <Head><title>References - Katib AI</title></Head>
      <main className="citation-page">
        <header className="citation-header"><button onClick={() => router.push('/')}>← Back</button><div><p>REFERENCE MANAGER</p><h1>Bibliography</h1></div><select value={style} onChange={(event) => setStyle(event.target.value)}><option value="apa">APA 7</option><option value="ieee">IEEE</option><option value="mla">MLA</option></select></header>
        <div className="citation-layout">
          <form onSubmit={addReference}>
            <h2>Add reference</h2>
            {[
              ['authors','Authors'], ['year','Year'], ['title','Title'], ['publication','Publication / journal'], ['doi','DOI'], ['url','URL']
            ].map(([key,label]) => <label key={key}>{label}<input value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={key === 'title' ? 'Required' : ''} /></label>)}
            <button className="primary" type="submit">Add reference</button>
          </form>
          <section>
            <h2>References <span>{references.length}</span></h2>
            {references.length ? references.map((item) => <article className="reference-card" key={item.id}><div><strong>{item.title}</strong><p>{formatReference(item)}</p>{item.doi && <small>DOI value: verify metadata before citing</small>}</div><button onClick={() => navigator.clipboard.writeText(formatReference(item))}>Copy</button><button onClick={() => save(references.filter((ref) => ref.id !== item.id))}>Delete</button></article>) : <div className="empty-state"><h3>No references yet</h3><p>Add source details manually. Metadata must be verified before citation.</p></div>}
          </section>
        </div>
      </main>
    </>
  );
}
