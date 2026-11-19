import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } },
};

function htmlToParagraphs(html = '', title = 'Untitled') {
  const plain = String(html).replace(/<br\s*\/?>/gi, '\n').replace(/<\/(?:p|h[1-6]|li|div)>/gi, '\n').replace(/<[^>]*>/g, '');
  const lines = plain.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').split(/\n+/);
  return [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
    ...lines.filter((line) => line.trim()).map((line) => new Paragraph({ children: [new TextRun({ text: line.trim() })] })),
  ];
}

export default async function exportDocx(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { title = 'Untitled document', content = '' } = req.body || {};
  if (String(content).length > 100000) return res.status(413).json({ error: 'Document exceeds 100,000 characters.' });

  try {
    const document = new Document({ sections: [{ properties: {}, children: htmlToParagraphs(content, title) }] });
    const buffer = await Packer.toBuffer(document);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${String(title).replace(/[^a-z0-9-_ ]/gi, '').trim() || 'document'}.docx"`);
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(500).json({ error: 'DOCX export failed.', detail: error.message });
  }
}
