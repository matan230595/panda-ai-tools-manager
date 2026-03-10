import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bot, Loader2, MessageSquarePlus, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ChatMessage from '@/components/assistant/ChatMessage';
import SuggestedQuestions from '@/components/assistant/SuggestedQuestions';
import EmptyState from '@/components/EmptyState';

const AGENT_NAME = 'tool_advisor';

export default function AssistantTab() {
  const [input, setInput] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['agentConversations', AGENT_NAME],
    queryFn: () => base44.agents.listConversations({ agent_name: AGENT_NAME }),
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

  const orderedConversations = useMemo(
    () => [...conversations].sort((a, b) => new Date(b.updated_date || b.created_date || 0) - new Date(a.updated_date || a.created_date || 0)),
    [conversations]
  );

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

    const conversation = currentConversationId
      ? await base44.agents.getConversation(currentConversationId)
      : await createConversation(content);

    await base44.agents.addMessage(conversation, {
      role: 'user',
      content,
    });

    setInput('');
    setIsSending(false);
    refetchConversations();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
      <div className="hidden lg:block glass-effect rounded-2xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">שיחות עם הסוכן</h3>
          <Button size="sm" variant="ghost" onClick={handleNewChat}>
            <MessageSquarePlus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {orderedConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setCurrentConversationId(conversation.id)}
              className={`w-full text-right p-3 rounded-lg transition-all ${currentConversationId === conversation.id ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
            >
              <div className="font-medium text-sm truncate">{conversation.metadata?.name || 'שיחה'}</div>
              <div className="text-xs opacity-70 mt-1">
                {new Date(conversation.updated_date || conversation.created_date || Date.now()).toLocaleDateString('he-IL')}
              </div>
            </button>
          ))}

          {orderedConversations.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">עדיין אין שיחות קודמות</div>
          )}
        </div>
      </div>

      <div className="lg:col-span-3 glass-effect rounded-xl md:rounded-2xl flex flex-col overflow-hidden h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold gradient-text flex items-center gap-2">
              <Bot className="w-5 h-5" />
              סוכן AI חכם למערכת
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              מחפש, משווה, מסכם ומארגן עבורך את מאגר הכלים שלך
            </p>
          </div>
          <Button variant="outline" onClick={handleNewChat}>
            <MessageSquarePlus className="w-4 h-4 ml-2" />
            שיחה חדשה
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <EmptyState
                title="התחל שיחה עם הסוכן"
                description="בקש ממנו למצוא כלים דומים, להשוות ביניהם, ליצור משימות ותזכורות, או לארגן את המאגר שלך"
              />
              <div className="mt-8 w-full max-w-2xl">
                <SuggestedQuestions onSelectQuestion={(question) => handleSend(question)} />
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <ChatMessage key={`${message.timestamp || index}-${index}`} message={message} />
              ))}
              {isSending && (
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                  <div className="glass-effect rounded-2xl p-4">
                    <div className="text-sm text-gray-500">הסוכן חושב...</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="שאל את הסוכן למשל: איזה כלים אצלי הכי מתאימים לכתיבה? / צור לי משימה שבועית לכלי מסוים / השווה בין 2 כלים..."
              className="flex-1 resize-none min-h-[60px] max-h-[200px]"
              disabled={isSending}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isSending}
              className="h-[60px] px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>הסוכן יודע לעבוד עם הכלים, המשימות, התזכורות והמרחבים שלך</span>
            <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><Sparkles className="w-3 h-3" />Agent</span>
          </div>
        </div>
      </div>
    </div>
  );
}