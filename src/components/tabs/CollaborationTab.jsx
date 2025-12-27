import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Eye, 
  Edit, 
  Trash2,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function CollaborationTab() {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviteMessage, setInviteMessage] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    }
  });

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: () => base44.entities.AiTool.list(),
  });

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error('הזן כתובת אימייל');
      return;
    }

    try {
      // שליחת הזמנה דרך מייל
      await base44.integrations.Core.SendEmail({
        to: inviteEmail,
        subject: 'הוזמנת לשתף פעולה ב-AI Tools Manager',
        body: `
שלום,

${currentUser?.full_name || 'משתמש'} הזמין אותך לשתף פעולה במערכת ניהול כלי ה-AI שלו.

תפקיד: ${inviteRole === 'editor' ? 'עורך' : 'צופה'}

${inviteMessage ? `הודעה: ${inviteMessage}` : ''}

להצטרפות, פנה אל ${currentUser?.email}

בברכה,
צוות AI Tools Manager
        `
      });

      toast.success(`הזמנה נשלחה ל-${inviteEmail}! 📧`);
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteMessage('');
    } catch (error) {
      toast.error('שגיאה בשליחת הזמנה');
    }
  };

  const handleGenerateShareLink = () => {
    const link = `${window.location.origin}?invite=${currentUser?.id || 'user'}&role=viewer`;
    setShareLink(link);
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('הקישור הועתק ללוח');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const roles = [
    {
      id: 'viewer',
      name: 'צופה',
      description: 'צפייה בלבד בכלים ובמידע',
      icon: Eye,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'editor',
      name: 'עורך',
      description: 'הוספה, עריכה ומחיקה של כלים',
      icon: Edit,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'admin',
      name: 'מנהל',
      description: 'גישה מלאה כולל הגדרות',
      icon: Shield,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const collaborationFeatures = [
    {
      icon: Share2,
      title: 'שיתוף כלים',
      description: 'שתף כלים ספציפיים עם חברי צוות',
      action: 'הגדר שיתוף'
    },
    {
      icon: MessageCircle,
      title: 'הערות ודיונים',
      description: 'הוסף הערות ודון על כלים עם הצוות',
      action: 'התחל דיון'
    },
    {
      icon: Users,
      title: 'קבוצות עבודה',
      description: 'צור קבוצות לפרויקטים שונים',
      action: 'צור קבוצה'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            שיתוף פעולה
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            שתף והתנהל עם הצוות שלך
          </p>
        </div>

        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
              <UserPlus className="w-5 h-5 ml-2" />
              הזמן משתמשים
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הזמן משתמש חדש</DialogTitle>
              <DialogDescription>
                שלח הזמנה לשיתוף פעולה
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">כתובת אימייל</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-role">תפקיד</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <role.icon className="w-4 h-4" />
                          {role.name} - {role.description}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-message">הודעה אישית (אופציונלי)</Label>
                <Textarea
                  id="invite-message"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="הוסף הודעה אישית..."
                  rows={3}
                />
              </div>

              <Button onClick={handleInvite} className="w-full">
                <Mail className="w-4 h-4 ml-2" />
                שלח הזמנה
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              כלים משותפים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              {tools.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              משתמשים פעילים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">1</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              הזמנות ממתינות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">0</div>
          </CardContent>
        </Card>
      </div>

      {/* תפקידים */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">תפקידים והרשאות</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map(role => {
            const Icon = role.icon;
            return (
              <Card key={role.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${role.color}`} />
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {role.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* תכונות שיתוף */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">תכונות שיתוף פעולה</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {collaborationFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-6 h-6 text-indigo-600" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    {feature.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* קישור שיתוף */}
      <Card>
        <CardHeader>
          <CardTitle>שיתוף באמצעות קישור</CardTitle>
          <CardDescription>
            צור קישור לשיתוף מהיר עם משתמשים חדשים
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!shareLink ? (
            <Button onClick={handleGenerateShareLink}>
              <Share2 className="w-4 h-4 ml-2" />
              צור קישור שיתוף
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="flex-1" />
              <Button onClick={handleCopyLink}>
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}