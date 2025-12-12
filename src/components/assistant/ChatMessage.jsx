import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ChatMessage({ message }) {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('הועתק ללוח');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('שגיאה בהעתקה');
    }
  };

  return (
    <div className={`flex gap-4 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
      )}
      
      <div className={`flex-1 max-w-3xl ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className={`
          relative group
          ${isUser 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl rounded-tl-sm' 
            : 'glass-effect rounded-2xl rounded-tr-sm'
          }
          p-4 shadow-md
        `}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  code: ({ inline, className, children, ...props }) => {
                    return !inline ? (
                      <div className="relative">
                        <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-lg p-4 overflow-x-auto my-2">
                          <code className={className} {...props}>{children}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(String(children));
                            toast.success('קוד הועתק');
                          }}
                          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-sm font-mono">
                        {children}
                      </code>
                    );
                  },
                  a: ({ children, href, ...props }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline" {...props}>
                      {children}
                    </a>
                  ),
                  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mr-6 mb-3 list-disc">{children}</ul>,
                  ol: ({ children }) => <ol className="mr-6 mb-3 list-decimal">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  h1: ({ children }) => <h1 className="text-xl font-bold mb-3">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-semibold mb-2">{children}</h3>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-r-4 border-indigo-500 pr-4 my-3 text-gray-700 dark:text-gray-300">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          
          {!isUser && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="העתק הודעה"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          )}
        </div>
        
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
          {new Date(message.timestamp).toLocaleTimeString('he-IL', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
          <User className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  );
}