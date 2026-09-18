import { useEffect, useRef, useState } from 'react';
import { createChatSchema } from '@/types/schemas';
import { timeAgo } from '@/utils/format';

export function ChatWindow({ messages = [], onSend, isStreaming = false, documentTitle, quickActions = [], onQuickAction = () => {} }: any) {
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const toggleVoice = () => {
    const w = window as any;
    const SR: any = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      onQuickAction?.('__NO_SPEECH__');
      return;
    }
    if (listening) return;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    setListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = createChatSchema.safeParse({ content: input });
    if (!parsed.success || isStreaming) return;

    onSend(parsed.data.content);
    setInput('');
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-surface-card">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
          {documentTitle ? `Chat — ${documentTitle}` : 'AI Tutor Chat'}
        </h3>
        {isStreaming && (
          <span className="flex items-center gap-2 text-xs text-brand-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
            Thinking…
          </span>
        )}
      </div>

      {quickActions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto border-b border-slate-200 px-3 py-2 dark:border-slate-700">
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onQuickAction(action)}
              className="whitespace-nowrap rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300 dark:hover:bg-brand-900"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Ask a question about your material — e.g. &ldquo;What is cardiac output?&rdquo;
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={message._id || index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                message.role === 'user'
                  ? 'bg-brand-600 text-white'
                  : 'border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.sources?.length > 0 && (
                <div className="mt-2 border-t border-slate-300/50 pt-2 dark:border-slate-600/50">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wide opacity-70">
                    Sources
                  </p>
                  {message.sources.map((source, i) => (
                    <p key={i} className="text-[11px] opacity-80">
                      Page {source.page} · {source.excerpt?.slice(0, 60)}…
                    </p>
                  ))}
                </div>
              )}
              {message.createdAt && (
                <p className="mt-1 text-[10px] opacity-60">{timeAgo(message.createdAt)}</p>
              )}
            </div>
          </div>
        ))}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3 dark:border-slate-700">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleVoice}
            className={`btn-icon ${listening ? 'bg-red-100 text-red-600 dark:bg-red-900' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
            title={listening ? 'Listening…' : 'Speak your question'}
          >
            {listening ? '🔴' : '🎤'}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? 'Listening…' : 'Ask anything about your documents…'}
            className="input flex-1"
            disabled={isStreaming}
          />
          <button type="submit" className="btn-primary" disabled={isStreaming || !input.trim()}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatWindow;
