'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]);
  const [mode, setMode] = useState<'simple' | 'enhanced'>('simple');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    
    setLoading(true);
    setAnswer('');
    setSources([]);
    
    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, mode }),
      });
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'content') {
              setAnswer(prev => prev + data.text);
              scrollToBottom();
            } else if (data.type === 'sources') {
              setSources(data.sources || []);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          电池适航标准智能搜索引擎
        </h1>
        
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={() => setMode('simple')}
            className={`px-4 py-2 rounded-lg ${mode === 'simple' ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            快速搜索
          </button>
          <button
            onClick={() => setMode('enhanced')}
            className={`px-4 py-2 rounded-lg ${mode === 'enhanced' ? 'bg-purple-600' : 'bg-slate-700'}`}
          >
            增强搜索
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入你的问题，如：动力电池的热失控测试标准是什么？"
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {loading ? '搜索中...' : '搜索'}
            </button>
          </div>
        </form>
        
        {answer && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">回答</h2>
            <div className="whitespace-pre-wrap">{answer}</div>
          </div>
        )}
        
        {sources.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">参考来源</h2>
            <div className="space-y-2">
              {sources.map((source, i) => (
                <div key={i} className="text-sm text-slate-300 border-l-2 border-purple-500 pl-3">
                  <span className="font-medium">{source.file}</span>
                  {source.chapter && <span className="text-slate-500"> - {source.chapter}</span>}
                  <p className="mt-1 text-slate-400">{source.preview}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
