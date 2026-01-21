import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Plus, Settings, Trash2, UserPlus, Share2, Bell, MessageSquare, Eye, Edit3, Shield, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function CollaborationTab() {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('default');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  // Entity לניהול workspaces
  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      // בפועל יהיה entity Workspace
      return [
        {
          id: 'default',
          name: 'Workspace ראשי',
          members: [
            { id: '1', name: 'אתה', email: 'you@example.com', role: 'admin', avatar: '👤' },
          ],
          tools: [],
          activity: []
        }
      ];
    }
  });

  const currentWorkspace = workspaces.find(w => w.id === selectedWorkspace) || workspaces[0];

  const createWorkspace = useMutation({
    mutationFn: async (name) => {
      // בפועל:
      // return await base44.entities.Workspace.create({ name, members: [], tools: [] });
      return { id: Date.now().toString(), name, members: [], tools: [], activity: [] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workspaces']);
      toast.success('Workspace נוצר בהצלחה! 🎉');
      setNewWorkspaceName('');
    }
  });

  const inviteMember = async () => {
    if (!inviteEmail) {
      toast.error('נא להזין כתובת אימייל');
      return;
    }

    try {
      await base44.users.inviteUser(inviteEmail, inviteRole === 'admin' ? 'admin' : 'user');
      
      toast.success(`הזמנה נשלחה ל-${inviteEmail} 📧`);
      setInviteEmail('');
      setInviteMessage('');
    } catch (error) {
      toast.error('שגיאה בשליחת ההזמנה');
    }
  };

  const generateShareLink = () => {
    const link = `${window.location.origin}?workspace=${selectedWorkspace}`;
    navigator.clipboard.writeText(link);
    toast.success('קישור הועתק! 🔗');
  };

  const roleIcons = {
    admin: <Crown className="w-4 h-4 text-yellow-500" />,
    editor: <Edit3 className="w-4 h-4 text-blue-500" />,
    viewer: <Eye className="w-4 h-4 text-gray-500" />
  };

  const roleLabels = {
    admin: 'מנהל',
    editor: 'עורך',
    viewer: 'צופה'
  };

  // סטטיסטיקות
  const stats = {
    sharedTools: currentWorkspace?.tools?.length || 0,
    activeUsers: currentWorkspace?.members?.filter(m => m.lastActive > Date.now() - 24 * 60 * 60 * 1000)?.length || 0,
    pendingInvites: 2,
    totalActivity: currentWorkspace?.activity?.length || 0
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            שיתוף פעולה וצוותים
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            עבוד יחד עם הצוות על כלי AI
          </p>
        </div>
        <Button
          onClick={() => {
            const name = prompt('שם ל-Workspace החדש:');
            if (name) createWorkspace.mutate(name);
          }}
          className="bg-gradient-to-r from-teal-500 to-green-600"
        >
          <Plus className="w-4 h-4 ml-2" />
          Workspace חדש
        </Button>
      </div>

      {/* בחירת Workspace */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace פעיל</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workspaces.map(ws => (
                <SelectItem key={ws.id} value={ws.id}>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {ws.name} ({ws.members?.length || 0} חברים)
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              כלים משותפים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">
              {stats.sharedTools}
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
            <div className="text-3xl font-bold text-green-600">
              {stats.activeUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              הזמנות ממתינות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {stats.pendingInvites}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              פעילות השבוע
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {stats.totalActivity}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">👥 חברי צוות</TabsTrigger>
          <TabsTrigger value="tools">🔧 כלים משותפים</TabsTrigger>
          <TabsTrigger value="activity">📊 פעילות</TabsTrigger>
          <TabsTrigger value="settings">⚙️ הגדרות</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4 mt-6">
          {/* הזמנת חבר צוות */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                הזמן חבר צוות
              </CardTitle>
              <CardDescription>שלח הזמנה לעבוד יחד ב-workspace זה</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>אימייל</Label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>תפקיד</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          {roleIcons.viewer}
                          צופה
                        </div>
                      </SelectItem>
                      <SelectItem value="editor">
                        <div className="flex items-center gap-2">
                          {roleIcons.editor}
                          עורך
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          {roleIcons.admin}
                          מנהל
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>הודעה אישית (אופציונלי)</Label>
                <Textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="היי! רוצה לעבוד יחד על ניהול כלי AI..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={inviteMember} className="flex-1">
                  <UserPlus className="w-4 h-4 ml-2" />
                  שלח הזמנה
                </Button>
                <Button variant="outline" onClick={generateShareLink}>
                  <Share2 className="w-4 h-4 ml-2" />
                  העתק קישור
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* רשימת חברים */}
          <Card>
            <CardHeader>
              <CardTitle>חברי {currentWorkspace?.name}</CardTitle>
              <CardDescription>{currentWorkspace?.members?.length || 0} חברי צוות</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentWorkspace?.members?.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-teal-500 to-green-600 text-white">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {roleIcons[member.role]}
                        {roleLabels[member.role]}
                      </Badge>
                      {member.role !== 'admin' && (
                        <Button size="sm" variant="ghost">
                          <Settings className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>כלים משותפים ב-Workspace</CardTitle>
              <CardDescription>
                כלים שהצוות יכול לגשת אליהם ולנהל יחד
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>טרם שותפו כלים ב-workspace זה</p>
                <Button className="mt-4" variant="outline">
                  <Plus className="w-4 h-4 ml-2" />
                  שתף כלי ראשון
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>פעילות אחרונה</CardTitle>
              <CardDescription>עדכונים ופעולות של חברי הצוות</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { user: 'יוסי כהן', action: 'הוסיף כלי חדש', tool: 'ChatGPT Pro', time: 'לפני 5 דקות' },
                  { user: 'רחל לוי', action: 'עדכנה הערה על', tool: 'Midjourney', time: 'לפני שעה' },
                  { user: 'דוד אברהם', action: 'הצטרף ל-workspace', time: 'אתמול' }
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs">
                        {activity.user.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.user}</span> {activity.action}
                        {activity.tool && <span className="text-purple-600"> {activity.tool}</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>הגדרות Workspace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>שם Workspace</Label>
                <Input value={currentWorkspace?.name} disabled />
              </div>
              <div className="space-y-2">
                <Label>הרשאות ברירת מחדל לחברים חדשים</Label>
                <Select defaultValue="viewer">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">צופה</SelectItem>
                    <SelectItem value="editor">עורך</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-4 border-t">
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 ml-2" />
                  מחק Workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* תכונות פרימיום */}
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            תכונות צוות מתקדמות
          </CardTitle>
          <CardDescription>שדרג לתוכנית Pro לפתיחת יכולות נוספות</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: '💬', title: 'מערכת הערות משותפת', desc: 'הוסיפו הערות וציונים על כלים' },
              { icon: '📊', title: 'אנליטיקס צוותי', desc: 'עקבו אחר שימוש הצוות בכלים' },
              { icon: '🔔', title: 'התראות מתקדמות', desc: 'קבלו עדכונים על פעילות הצוות' },
              { icon: '📁', title: 'ספריות משותפות', desc: 'ארגנו כלים בתיקיות משותפות' }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <div className="font-semibold text-sm">{feature.title}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}