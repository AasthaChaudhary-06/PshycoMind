import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const standardFontDataUrl = path.resolve(__dirname, '../node_modules/pdfjs-dist/standard_fonts') + '/';
const cMapsUrl = path.resolve(__dirname, '../node_modules/pdfjs-dist/cmaps') + '/';

/**
 * PDF extraction + text chunking.
 * - Extracts per-page text (pdfjs-dist)
 * - Splits into overlapping chunks sized for embedding / RAG
 */
export async function parsePdf(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error('The PDF file is empty, i.e. its size is zero bytes.');
  }

  let doc;
  try {
    doc = await getDocument({
      data: new Uint8Array(buffer),
      standardFontDataUrl,
      cMapsUrl,
      isEvalSupported: false,
    } as any).promise;
  } catch (err) {
    throw new Error(`Failed to parse PDF: ${err.message}`);
  }

  const pages = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join('')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (text) pages.push({ number: i, text });
    page.cleanup();
  }

  await doc.destroy();

  return {
    pages,
    metadata: {
      author: '',
      keywords: [],
      createdAt: null,
    },
    totalPages: pages.length,
  };
}

export function parsePlainText(text) {
  const chunks = text.split(/\n{2,}/).filter((c) => c.trim());
  const pages = chunks.map((text, index) => ({
    number: index + 1,
    text: text.trim(),
  }));

  return { pages, totalPages: pages.length };
}

export function chunkPages(pages, { chunkSize = 1000, overlap = 150 } = {}) {
  const chunks = [];

  for (const page of pages) {
    const text = page.text;
    if (text.length <= chunkSize) {
      chunks.push({ page: page.number, text });
      continue;
    }

    let start = 0;
    while (start < text.length) {
      let end = Math.min(start + chunkSize, text.length);
      if (end < text.length) {
        const boundary = findBoundary(text, end);
        if (boundary !== -1) end = boundary;
      }
      chunks.push({ page: page.number, text: text.slice(start, end).trim() });
      if (end >= text.length) break;
      start = Math.max(end - overlap, start + 1);
    }
  }

  logger.info('Chunked %d pages into %d chunks', pages.length, chunks.length);
  return chunks;
}

function findBoundary(text, from) {
  const candidates = ['. ', '.\n', '\n\n', '? ', '! '];
  for (const marker of candidates) {
    const idx = text.lastIndexOf(marker, from);
    if (idx > from - 400) return idx + marker.length;
  }
  return text.lastIndexOf(' ', from);
}

export async function parseUpload(file, fileType) {
  if (fileType === 'pdf') {
    const { pages, metadata } = await parsePdf(file.buffer);
    return { pages, metadata };
  }

  const text = file.buffer.toString('utf8');
  const { pages } = parsePlainText(text);
  return { pages, metadata: { author: '', keywords: [], createdAt: null } };
}
