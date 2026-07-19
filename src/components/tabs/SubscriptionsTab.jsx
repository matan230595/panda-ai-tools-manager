import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Key, Calendar, DollarSign, CreditCard, Plus, Edit, Trash2, Search, AlertCircle, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SubscriptionDialog from '@/components/subscription/SubscriptionDialog';
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

const TYPE_COLORS = {
  'חינמי': 'bg-green-100 text-green-800',
  'פרימיום': 'bg-blue-100 text-blue-800',
  'גולד': 'bg-yellow-100 text-yellow-800',
};

export default function SubscriptionsTab() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  const [deletingSubscription, setDeletingSubscription] = useState(null);
  const [creatingReminderFor, setCreatingReminderFor] = useState(null);

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Subscription.filter({ created_by_id: user.id }, '-updated_date');
    },
  });

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Reminder.filter({ created_by_id: user.id }, '-updated_date');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Subscription.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('המנוי נמחק');
      setDeletingSubscription(null);
    },
  });

  const createReminderMutation = useMutation({
    mutationFn: (data) => base44.entities.Reminder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('נוספה תזכורת למנוי');
      setCreatingReminderFor(null);
    },
  });

  const activeSubscriptions = subscriptions.filter(s => s.isActive);
  const totalMonthly = activeSubscriptions.reduce((sum, s) => sum + (s.priceMonthly || 0), 0);
  const totalYearly = totalMonthly * 12;

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.toolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.subscriptionType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateReminder = (subscription) => {
    const reminderDate = subscription.renewalDate || new Date().toISOString().split('T')[0];
    createReminderMutation.mutate({
      toolId: subscription.toolId,
      toolName: subscription.toolName,
      reminderType: 'subscription_expiry',
      reminderDate,
      reminderTime: '09:00',
      message: `בדיקה לפני חידוש או ביטול של ${subscription.toolName}`,
      priority: 'high',
      daysBeforeAlert: 7,
      subscriptionRenewalDate: reminderDate,
      isActive: true,
      isCompleted: false,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-4 sm:p-6 shadow-xl shadow-indigo-500/20">
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative text-right">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-0.5">ניהול מנויים</h1>
          <p className="text-xs sm:text-sm text-indigo-100/90">נהל את כל המנויים והפרטים שלך במקום אחד</p>
        </div>
      </div>

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400">סה"כ מנויים</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{subscriptions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400">מנויים פעילים</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{activeSubscriptions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400">עלות חודשית</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₪{totalMonthly.toFixed(0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400">עלות שנתית</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">₪{totalYearly.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* חיפוש */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="חפש מנוי..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button
          onClick={() => {
            const toolsWithSub = tools.filter(t => t.hasSubscription);
            if (toolsWithSub.length > 0) {
              setSelectedTool(toolsWithSub[0]);
            } else if (tools.length > 0) {
              setSelectedTool(tools[0]);
            }
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 min-h-[44px] w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 ml-2" />
          הוסף מנוי
        </Button>
      </div>

      {/* רשימת מנויים */}
      {filteredSubscriptions.length === 0 ? (
        <div className="text-center py-12">
          <Key className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            אין מנויים עדיין
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            התחל לנהל את המנויים שלך לכלי AI
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscriptions.map((subscription) => {
            const tool = tools.find(t => t.id === subscription.toolId);
            const daysUntilRenewal = subscription.renewalDate
              ? Math.ceil((new Date(subscription.renewalDate) - new Date()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <Card key={subscription.id} className={!subscription.isActive ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {tool?.logo ? (
                        <img src={tool.logo} alt={subscription.toolName} className="w-12 h-12 rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {subscription.toolName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{subscription.toolName}</CardTitle>
                        <Badge className={TYPE_COLORS[subscription.subscriptionType]}>
                          {subscription.subscriptionType?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">מחיר חודשי:</span>
                    <span className="font-bold">₪{subscription.priceMonthly?.toFixed(0) || 0}</span>
                  </div>

                  {subscription.email && (
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">אימייל: </span>
                      <span className="font-mono text-xs">{subscription.email}</span>
                    </div>
                  )}

                  {daysUntilRenewal !== null && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      {daysUntilRenewal > 0 ? (
                        <span>מתחדש בעוד {daysUntilRenewal} ימים</span>
                      ) : (
                        <span className="text-red-600">פג תוקף!</span>
                      )}
                    </div>
                  )}

                  {subscription.autoRenewal && (
                    <Badge variant="outline" className="text-xs">
                      🔄 חידוש אוטומטי
                    </Badge>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTool(tool)}
                      className="flex-1 min-h-[42px]"
                    >
                      <Edit className="w-3 h-3 ml-1" />
                      ערוך
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCreateReminder(subscription)}
                      className="flex-1 min-h-[42px]"
                    >
                      <BellRing className="w-3 h-3 ml-1" />
                      תזכורת
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletingSubscription(subscription)}
                      className="text-red-600 min-h-[42px]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* דיאלוג עריכה */}
      {selectedTool && (
        <SubscriptionDialog
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
        />
      )}

      {/* דיאלוג מחיקה */}
      <AlertDialog open={!!deletingSubscription} onOpenChange={() => setDeletingSubscription(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת מנוי</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את המנוי ל-{deletingSubscription?.toolName}?
              פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deletingSubscription.id)}
              className="bg-red-600"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}