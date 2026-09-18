import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import documentAPI from '@/services/documentAPI';
import analyticsAPI from '@/services/analyticsAPI';
import notesAPI from '@/services/notesAPI';
import { PDFViewer } from '@/components/PDFViewer';
import { FullPageLoader } from '@/components/Loader';
import { useThrottle } from '@/hooks/useThrottle';

const TABS = [
  { id: 'read', label: 'Read' },
  { id: 'chat', label: 'AI Chat' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'notes', label: 'Notes' },
];

export default function DocumentDetail() {
  const { documentId } = useParams();
  const [activeTab, setActiveTab] = useState('read');

  const { data: contentData, isLoading } = useQuery({
    queryKey: ['documents', documentId, 'content'],
    queryFn: () => documentAPI.getContent(documentId).then((r) => r.data.data),
    enabled: Boolean(documentId),
  });

  const trackReading = useMutation({
    mutationFn: (payload: any) => analyticsAPI.trackReading(payload),
  });

  const trackTime = useMutation({
    mutationFn: (payload: any) => analyticsAPI.trackTime(payload),
  });

  const generateSummary = useMutation({
    mutationFn: () => notesAPI.generateSummary({ documentId }),
  });

  const throttledTrack = useThrottle((page, totalPages) => {
    trackReading.mutate({ documentId, page, totalPages });
  }, 1500);

  const document = contentData;
  const pages = document?.pages || [];

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/documents" className="text-sm text-brand-600 hover:underline">
            ← All documents
          </Link>
          <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {document?.title || 'Document'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {document?.subject} · {pages.length} pages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => generateSummary.mutate()}
            disabled={generateSummary.isPending}
          >
            {generateSummary.isPending ? 'Generating…' : 'AI Summary'}
          </button>
          <Link to={`/chat/${documentId}`} className="btn-primary">
            Ask AI
          </Link>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-brand-700 shadow-sm dark:bg-surface-card dark:text-brand-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card flex-1 overflow-hidden">
        {isLoading ? (
          <FullPageLoader label="Loading document…" />
        ) : activeTab === 'read' ? (
          <PDFViewer
            pages={pages}
            onPageChange={(page) => throttledTrack(page, pages.length)}
            onScrollProgress={(ratio) => {
              if (ratio === 1) {
                trackReading.mutate({ documentId, page: pages.length, totalPages: pages.length });
              }
              if (Math.floor(ratio * 10) % 3 === 0) {
                trackTime.mutate({ seconds: 30 });
              }
            }}
          />
        ) : activeTab === 'chat' ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-slate-500">Ask questions about this document with source citations.</p>
            <Link to={`/chat/${documentId}`} className="btn-primary">
              Open AI Chat
            </Link>
          </div>
        ) : activeTab === 'quiz' ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-slate-500">Test your knowledge with a generated quiz.</p>
            <Link to={`/quiz/${documentId}`} className="btn-primary">
              Generate Quiz
            </Link>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-slate-500">Create notes and AI summaries for this document.</p>
            <Link to={`/notes/${documentId}`} className="btn-primary">
              Open Notes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
