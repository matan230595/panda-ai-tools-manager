import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Key, Calendar, CreditCard, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function SubscriptionDialog({ tool, onClose }) {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', tool?.id],
    queryFn: () => base44.entities.Subscription.filter({ toolId: tool?.id }),
    enabled: !!tool,
  });

  const existingSub = subscriptions[0];
  
  const [formData, setFormData] = useState({
    email: existingSub?.email || '',
    username: existingSub?.username || '',
    password: existingSub?.password || '',
    subscriptionType: existingSub?.subscriptionType || 'חינמי',
    priceMonthly: existingSub?.priceMonthly || tool?.priceILS || 0,
    startDate: existingSub?.startDate || new Date().toISOString().split('T')[0],
    renewalDate: existingSub?.renewalDate || '',
    isActive: existingSub?.isActive ?? true,
    autoRenewal: existingSub?.autoRenewal ?? true,
    paymentMethod: existingSub?.paymentMethod || '',
    notes: existingSub?.notes || '',
    apiKey: existingSub?.apiKey || '',
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (existingSub) {
        return base44.entities.Subscription.update(existingSub.id, data);
      }
      return base44.entities.Subscription.create({
        ...data,
        toolName: tool.name,
        toolId: tool.id,
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries(['subscriptions']);
      await base44.entities.AiTool.update(tool.id, { hasSubscription: true });
      queryClient.invalidateQueries(['tools']);
      toast.success('המנוי נשמר בהצלחה! 🎉');
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Subscription.delete(existingSub.id),
    onSuccess: async () => {
      queryClient.invalidateQueries(['subscriptions']);
      await base44.entities.AiTool.update(tool.id, { hasSubscription: false });
      queryClient.invalidateQueries(['tools']);
      toast.success('המנוי נמחק');
      onClose();
    },
  });

  const handleSave = () => saveMutation.mutate(formData);
  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  if (!tool) return null;

  return (
    <Dialog open={!!tool} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Key className="w-6 h-6 text-indigo-500" />
            ניהול מנוי - {tool.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* פרטי התחברות */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              🔐 פרטי התחברות
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>אימייל</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label>שם משתמש</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="username"
                />
              </div>

              <div className="space-y-2">
                <Label>סיסמה</Label>
                <div className="flex gap-2">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>מפתח API (אם רלוונטי)</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.apiKey}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
                  placeholder="API Key"
                />
              </div>
            </div>
          </div>

          {/* פרטי מנוי */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              💳 פרטי מנוי
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>סוג מנוי</Label>
                <Select value={formData.subscriptionType} onValueChange={(val) => handleChange('subscriptionType', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="חינמי">חינמי</SelectItem>
                    <SelectItem value="פרימיום">פרימיום</SelectItem>
                    <SelectItem value="גולד">גולד</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>מחיר חודשי (₪)</Label>
                <Input
                  type="number"
                  value={formData.priceMonthly}
                  onChange={(e) => handleChange('priceMonthly', parseFloat(e.target.value))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>תאריך התחלה</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>תאריך חידוש</Label>
                <Input
                  type="date"
                  value={formData.renewalDate}
                  onChange={(e) => handleChange('renewalDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>אמצעי תשלום</Label>
                <Input
                  value={formData.paymentMethod}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  placeholder="כרטיס אשראי, PayPal, וכו'"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Label>מנוי פעיל</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(val) => handleChange('isActive', val)}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Label>חידוש אוטומטי</Label>
                <Switch
                  checked={formData.autoRenewal}
                  onCheckedChange={(val) => handleChange('autoRenewal', val)}
                />
              </div>
            </div>
          </div>

          {/* הערות */}
          <div className="space-y-2">
            <Label>הערות נוספות</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="הוסף הערות או מידע נוסף..."
              rows={3}
            />
          </div>
        </div>

        {/* כפתורים */}
        <div className="flex justify-between pt-4 border-t">
          {existingSub && (
            <Button
              variant="outline"
              onClick={() => deleteMutation.mutate()}
              className="text-red-600 border-red-300"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              מחק מנוי
            </Button>
          )}
          <div className="flex gap-2 mr-auto">
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-indigo-500 to-purple-600">
              <Save className="w-4 h-4 ml-2" />
              שמור
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}