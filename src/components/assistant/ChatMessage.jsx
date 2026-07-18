import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content || '');
    setCopied(true);
    toast.success('הועתק ללוח');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-end gap-2 md:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`} dir="rtl">
      {!isUser && <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm"><Bot className="w-5 h-5" /></div>}
      <div className={`max-w-[94%] md:max-w-[85%] xl:max-w-[48rem] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`relative group rounded-[1.75rem] px-4 md:px-5 py-3 md:py-4 shadow-sm border ${isUser ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent rounded-bl-md' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 rounded-br-md'}`}>
          {isUser ? (
            <p className="text-sm md:text-base leading-7 whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert break-words prose-p:leading-7 prose-pre:rounded-2xl prose-pre:bg-slate-950">
              <ReactMarkdown
                components={{
                  a: ({ children, href, ...props }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline" {...props}>{children}</a>,
                  code: ({ inline, className, children, ...props }) => !inline ? <pre><code className={className} {...props}>{children}</code></pre> : <code className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800">{children}</code>,
                  blockquote: ({ children }) => <blockquote className="border-r-4 border-indigo-500 pr-4 my-3 text-gray-700 dark:text-gray-300">{children}</blockquote>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          {!isUser && (
            <Button size="icon" variant="ghost" onClick={handleCopy} className="absolute top-2 left-2 h-8 w-8 rounded-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          )}
        </div>
        <span className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 mt-1.5 px-2">
          {new Date(message.timestamp || Date.now()).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-sm"><User className="w-5 h-5" /></div>}
    </div>
  );
}