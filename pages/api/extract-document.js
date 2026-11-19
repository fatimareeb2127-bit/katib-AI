import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } },
};

export default async function extractDocument(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileName = '', base64 = '' } = req.body || {};
  if (!base64) return res.status(400).json({ error: 'No file data was supplied.' });

  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length > 10 * 1024 * 1024) {
    return res.status(413).json({ error: 'File exceeds the 10 MB limit.' });
  }

  const extension = String(fileName).split('.').pop().toLowerCase();
  try {
    let text = '';
    let metadata = {};
    if (extension === 'pdf') {
      const result = await pdfParse(buffer);
      text = result.text || '';
      metadata = result.info || {};
    } else if (extension === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || '';
      metadata = result.messages || [];
    } else if (['txt', 'md', 'markdown'].includes(extension)) {
      text = buffer.toString('utf8');
    } else {
      return res.status(415).json({ error: 'Supported formats: PDF, DOCX, TXT, and Markdown.' });
    }

    if (!text.trim()) {
      return res.status(422).json({ error: 'No extractable text was found. A scanned PDF may require OCR.' });
    }
    return res.status(200).json({ text: text.trim(), metadata, fileName });
  } catch (error) {
    return res.status(422).json({ error: 'The file could not be processed.', detail: error.message });
  }
}
