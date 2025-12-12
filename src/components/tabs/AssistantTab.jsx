import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Trash2, Plus, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ChatMessage from '@/components/assistant/ChatMessage';
import SuggestedQuestions from '@/components/assistant/SuggestedQuestions';
import EmptyState from '@/components/EmptyState';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AssistantTab() {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // טעינת שיחות
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list('-updated_date'),
  });

  // טעינת כלים (לקונטקסט)
  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: () => base44.entities.AiTool.list(),
  });

  // שיחה נוכחית
  const currentConversation = conversations.find(c => c.id === currentConversationId);

  // גלילה אוטומטית
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  // יצירת שיחה חדשה
  const createConversation = useMutation({
    mutationFn: (title) => base44.entities.Conversation.create({
      title,
      messages: [],
      isActive: true,
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['conversations']);
      setCurrentConversationId(data.id);
    },
  });

  // עדכון שיחה
  const updateConversation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Conversation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
    },
  });

  // מחיקת שיחה
  const deleteConversation = useMutation({
    mutationFn: (id) => base44.entities.Conversation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
      setCurrentConversationId(null);
      toast.success('השיחה נמחקה');
    },
  });

  // שליחת הודעה
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // יצירת שיחה חדשה אם צריך
    let conversationId = currentConversationId;
    if (!conversationId) {
      const newConv = await createConversation.mutateAsync(
        input.trim().substring(0, 50) + '...'
      );
      conversationId = newConv.id;
    }

    const conv = conversations.find(c => c.id === conversationId);
    const updatedMessages = [...(conv?.messages || []), userMessage];

    // עדכון עם הודעת המשתמש
    await updateConversation.mutateAsync({
      id: conversationId,
      data: { messages: updatedMessages }
    });

    setInput('');
    setIsSending(true);

    try {
      // בניית קונטקסט
      const context = `
רשימת כלי AI זמינים במערכת (${tools.length} כלים):
${tools.map(t => `- ${t.name} (${t.category}): ${t.description || 'ללא תיאור'}`).join('\n')}

היסטוריית שיחה:
${updatedMessages.slice(-5).map(m => `${m.role === 'user' ? 'משתמש' : 'עוזר'}: ${m.content}`).join('\n')}
      `;

      const prompt = `
אתה עוזר AI מומחה שעוזר למשתמשים לנהל ולגלות כלי AI.
יש לך גישה לרשימת הכלים שהמשתמש שמר במערכת.

${context}

שאלת המשתמש: ${input}

ענה בעברית, בצורה ידידותית ומועילה. אם השאלה קשורה לכלים ספציפיים, התייחס לכלים שבמערכת.
אם המשתמש שואל המלצה על כלי שלא נמצא ברשימה, תן המלצות כלליות.
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
      });

      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      // עדכון עם תשובת העוזר
      await updateConversation.mutateAsync({
        id: conversationId,
        data: { messages: [...updatedMessages, assistantMessage] }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('שגיאה בשליחת ההודעה. ודא שמפתח ה-API מוגדר בהגדרות.');
    } finally {
      setIsSending(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setInput('');
  };

  const handleClearHistory = () => {
    if (currentConversationId) {
      deleteConversation.mutate(currentConversationId);
      setShowClearDialog(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
      {/* Sidebar - היסטוריה */}
      <div className="hidden lg:block glass-effect rounded-2xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">שיחות קודמות</h3>
          <Button size="sm" variant="ghost" onClick={handleNewChat}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setCurrentConversationId(conv.id)}
              className={`
                w-full text-right p-3 rounded-lg transition-all
                ${currentConversationId === conv.id 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{conv.title}</span>
              </div>
              <span className="text-xs opacity-70 mt-1 block">
                {new Date(conv.updated_date).toLocaleDateString('he-IL')}
              </span>
            </button>
          ))}
          
          {conversations.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              אין שיחות קודמות
            </p>
          )}
        </div>
      </div>

      {/* צ'אט ראשי */}
      <div className="lg:col-span-3 glass-effect rounded-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold gradient-text">עוזר AI</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              שאל אותי כל שאלה על כלי AI
            </p>
          </div>
          {currentConversationId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearDialog(true)}
            >
              <Trash2 className="w-4 h-4 ml-2" />
              נקה שיחה
            </Button>
          )}
        </div>

        {/* הודעות */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!currentConversation || currentConversation.messages?.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <EmptyState
                title="התחל שיחה חדשה"
                description="שאל אותי כל שאלה על כלי AI והמלצות"
                onAction={undefined}
              />
              <div className="mt-8 w-full max-w-2xl">
                <SuggestedQuestions onSelectQuestion={setInput} />
              </div>
            </div>
          ) : (
            <>
              {currentConversation.messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              {isSending && (
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                  <div className="glass-effect rounded-2xl p-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
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
              placeholder="הקלד את שאלתך כאן... (Enter לשליחה, Shift+Enter לשורה חדשה)"
              className="flex-1 resize-none min-h-[60px] max-h-[200px]"
              disabled={isSending}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              className="h-[60px] px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            💡 העוזר יכול לעזור לך למצוא כלים, להשוות ביניהם ולתת המלצות מבוססות על הכלים שלך
          </p>
        </div>
      </div>

      {/* דיאלוג מחיקה */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>נקה שיחה?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את כל השיחה הנוכחית. לא ניתן לבטל פעולה זו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory} className="bg-red-600 hover:bg-red-700">
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}