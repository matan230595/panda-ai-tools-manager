import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bot, Loader2, Send, Clock3, Database, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ChatMessage from '@/components/assistant/ChatMessage';
import SuggestedQuestions from '@/components/assistant/SuggestedQuestions';
import ConversationList from '@/components/assistant/ConversationList';
import AgentModelSelector from '@/components/assistant/AgentModelSelector';
import EmptyState from '@/components/EmptyState';

const AGENT_NAME = 'tool_advisor';

export default function AssistantTab() {
  const [input, setInput] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['agentConversations', AGENT_NAME],
    queryFn: async () => {
      const result = await base44.agents.listConversations({ agent_name: AGENT_NAME });
      return Array.isArray(result) ? result : [];
    },
    initialData: [],
  });

  const { data: currentConversation } = useQuery({
    queryKey: ['agentConversation', currentConversationId],
    enabled: !!currentConversationId,
    queryFn: () => base44.agents.getConversation(currentConversationId),
  });

  useEffect(() => {
    if (!currentConversationId && conversations.length > 0) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  useEffect(() => {
    if (currentConversation?.messages) {
      setMessages(currentConversation.messages);
    }
  }, [currentConversation?.messages]);

  useEffect(() => {
    if (!currentConversationId) return;
    const unsubscribe = base44.agents.subscribeToConversation(currentConversationId, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsubscribe();
  }, [currentConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  const orderedConversations = useMemo(
    () => [...conversations].sort((a, b) => new Date(b.updated_date || b.created_date || 0) - new Date(a.updated_date || a.created_date || 0)),
    [conversations]
  );

  const currentConversationName = currentConversation?.metadata?.name || orderedConversations.find((item) => item.id === currentConversationId)?.metadata?.name || 'שיחה חדשה';

  const createConversation = async (seedText = 'שיחה חדשה') => {
    const conversation = await base44.agents.createConversation({
      agent_name: AGENT_NAME,
      metadata: {
        name: seedText.slice(0, 40),
        description: 'שיחה עם סוכן ניהול כלי AI',
      },
    });
    setCurrentConversationId(conversation.id);
    setMessages(conversation.messages || []);
    refetchConversations();
    return conversation;
  };

  const handleNewChat = async () => {
    await createConversation('שיחה חדשה');
    setInput('');
  };

  const handleSend = async (presetText) => {
    const content = (presetText || input).trim();
    if (!content) return;
    setIsSending(true);
    try {
      const conversation = currentConversationId ? await base44.agents.getConversation(currentConversationId) : await createConversation(content);
      await base44.agents.addMessage(conversation, { role: 'user', content });
      setInput('');
      refetchConversations();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[20rem_minmax(0,1fr)] gap-4 md:gap-6 min-h-[calc(100vh-11rem)]" dir="rtl">
      <div className="hidden xl:block">
        <ConversationList
          conversations={orderedConversations}
          currentConversationId={currentConversationId}
          onSelect={setCurrentConversationId}
          onNewChat={handleNewChat}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[calc(100vh-12rem)]">
        <div className="border-b border-gray-200 dark:border-slate-800 px-4 md:px-6 py-4 md:py-5 bg-gradient-to-l from-indigo-50 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm"><Bot className="w-6 h-6" /></div>
                <div className="min-w-0">
                  <h2 className="text-2xl md:text-3xl font-bold gradient-text truncate">שיחה עם הסוכן</h2>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 truncate">{currentConversationName}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 px-3 py-1.5"><Database className="w-3.5 h-3.5" />גישה לנתוני המערכת</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 px-3 py-1.5"><Wrench className="w-3.5 h-3.5" />פעולות חכמות</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 px-3 py-1.5"><Clock3 className="w-3.5 h-3.5" />היסטוריה מלאה וברורה</span>
              </div>
            </div>
            <Button variant="outline" onClick={handleNewChat} className="min-h-[50px] rounded-2xl w-full lg:w-auto">שיחה חדשה</Button>
          </div>

          <div className="xl:hidden mt-4">
            <ConversationList
              conversations={orderedConversations.slice(0, 6)}
              currentConversationId={currentConversationId}
              onSelect={setCurrentConversationId}
              onNewChat={handleNewChat}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 md:px-6 lg:px-8 py-4 md:py-6 space-y-5 bg-slate-50/60 dark:bg-slate-950/30">
          {messages.length === 0 ? (
            <div className="min-h-[28rem] flex flex-col items-center justify-center">
              <EmptyState title="התחל שיחה עם הסוכן" description="בקש ניתוח, חיפוש, סדר, השוואה, תזכורות ומשימות — הכול מתוך הנתונים שלך." />
              <div className="mt-6 w-full max-w-5xl">
                <SuggestedQuestions onSelectQuestion={(question) => handleSend(question)} />
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <ChatMessage key={`${message.timestamp || index}-${index}`} message={message} />
              ))}
              {isSending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white"><Loader2 className="w-5 h-5 animate-spin" /></div>
                  <div className="rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-4 py-3 text-sm text-gray-500">הסוכן חושב וכותב תשובה...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-3 md:px-6 py-3 md:py-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="כתוב כאן מה תרצה שהסוכן יעשה — למשל לבדוק מנויים, למצוא כפילויות, להשוות כלים או ליצור משימות..."
              className="flex-1 resize-none min-h-[108px] max-h-[220px] rounded-3xl border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-base leading-7"
              disabled={isSending}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isSending}
              className="h-[56px] md:h-auto md:min-w-[84px] rounded-3xl px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 ml-2" />שלח</>}
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-3 px-1">
            <span>ההודעה נשמרת כחלק מהיסטוריית השיחה המלאה שלך.</span>
            <AgentModelSelector />
          </div>
        </div>
      </div>
    </div>
  );
}