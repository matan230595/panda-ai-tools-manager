import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Users, Plus, Settings, Trash2, UserPlus, Share2, Eye, Edit3, Crown, Check, Link2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function CollaborationTab() {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: workspaces = [], isLoading: isLoadingWorkspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Workspace.filter({ created_by: user.email }, '-updated_date');
    },
  });

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by: user.email });
    },
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: (data) => base44.entities.Workspace.create(data),
    onSuccess: (workspace) => {
      queryClient.invalidateQueries(['workspaces']);
      setSelectedWorkspace(workspace.id);
      setNewWorkspaceName('');
      toast.success('המרחב נוצר בהצלחה');
    },
  });

  const updateWorkspaceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Workspace.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspaces']);
    },
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: (id) => base44.entities.Workspace.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspaces']);
      setSelectedWorkspace('');
      toast.success('המרחב נמחק');
    },
  });

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspace]);

  useEffect(() => {
    if (isBootstrapped || isLoadingWorkspaces || !currentUser || workspaces.length > 0) return;

    setIsBootstrapped(true);
    createWorkspaceMutation.mutate({
      name: 'המרחב שלי',
      description: 'סביבת העבודה הראשית שלך',
      ownerEmail: currentUser.email,
      members: [{
        email: currentUser.email,
        name: currentUser.full_name || currentUser.email,
        role: 'admin',
        status: 'active',
        joinedAt: new Date().toISOString(),
      }],
      sharedToolIds: [],
      activity: [{
        type: 'workspace_created',
        text: 'המרחב הראשי נוצר',
        timestamp: new Date().toISOString(),
      }],
    });
  }, [isBootstrapped, isLoadingWorkspaces, currentUser, workspaces.length]);

  const currentWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspace) || workspaces[0];
  const sharedToolIds = currentWorkspace?.sharedToolIds || [];
  const sharedTools = tools.filter((tool) => sharedToolIds.includes(tool.id));
  const availableTools = tools.filter((tool) => !sharedToolIds.includes(tool.id));

  const roleIcons = {
    admin: <Crown className="w-4 h-4 text-yellow-500" />,
    editor: <Edit3 className="w-4 h-4 text-blue-500" />,
    viewer: <Eye className="w-4 h-4 text-gray-500" />,
  };

  const roleLabels = {
    admin: 'מנהל',
    editor: 'עורך',
    viewer: 'צופה',
  };

  const stats = useMemo(() => ({
    sharedTools: sharedTools.length,
    activeUsers: (currentWorkspace?.members || []).filter((member) => member.status === 'active').length,
    pendingInvites: (currentWorkspace?.members || []).filter((member) => member.status === 'invited').length,
    totalActivity: currentWorkspace?.activity?.length || 0,
  }), [currentWorkspace, sharedTools.length]);

  const appendActivity = (workspace, text, type) => ([
    {
      type,
      text,
      timestamp: new Date().toISOString(),
    },
    ...(workspace.activity || []),
  ].slice(0, 20));

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim() || !currentUser) return;

    createWorkspaceMutation.mutate({
      name: newWorkspaceName.trim(),
      description: '',
      ownerEmail: currentUser.email,
      members: [{
        email: currentUser.email,
        name: currentUser.full_name || currentUser.email,
        role: 'admin',
        status: 'active',
        joinedAt: new Date().toISOString(),
      }],
      sharedToolIds: [],
      activity: [{
        type: 'workspace_created',
        text: `נוצר מרחב חדש: ${newWorkspaceName.trim()}`,
        timestamp: new Date().toISOString(),
      }],
    });
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !currentWorkspace) {
      toast.error('נא להזין כתובת אימייל');
      return;
    }

    const alreadyExists = (currentWorkspace.members || []).some((member) => member.email === inviteEmail);
    if (alreadyExists) {
      toast.error('המשתמש כבר נמצא במרחב');
      return;
    }

    await base44.users.inviteUser(inviteEmail, inviteRole === 'admin' ? 'admin' : 'user');

    const updatedMembers = [
      ...(currentWorkspace.members || []),
      {
        email: inviteEmail,
        name: inviteEmail,
        role: inviteRole,
        status: 'invited',
        invitedAt: new Date().toISOString(),
      },
    ];

    updateWorkspaceMutation.mutate({
      id: currentWorkspace.id,
      data: {
        ...currentWorkspace,
        members: updatedMembers,
        activity: appendActivity(currentWorkspace, `נשלחה הזמנה אל ${inviteEmail}`, 'member_invited'),
      },
    });

    setInviteEmail('');
    toast.success(`הזמנה נשלחה ל-${inviteEmail}`);
  };

  const handleToggleToolShare = (tool) => {
    if (!currentWorkspace) return;

    const nextSharedToolIds = sharedToolIds.includes(tool.id)
      ? sharedToolIds.filter((id) => id !== tool.id)
      : [...sharedToolIds, tool.id];

    updateWorkspaceMutation.mutate({
      id: currentWorkspace.id,
      data: {
        ...currentWorkspace,
        sharedToolIds: nextSharedToolIds,
        activity: appendActivity(
          currentWorkspace,
          sharedToolIds.includes(tool.id) ? `הוסר שיתוף עבור ${tool.name}` : `הופעל שיתוף עבור ${tool.name}`,
          'tool_shared'
        ),
      },
    });
  };

  const handleDeleteWorkspace = () => {
    if (!currentWorkspace) return;
    deleteWorkspaceMutation.mutate(currentWorkspace.id);
  };

  const generateShareLink = async () => {
    if (!currentWorkspace) return;
    await navigator.clipboard.writeText(`${window.location.origin}?workspace=${currentWorkspace.id}`);
    toast.success('קישור המרחב הועתק');
  };

  if (isLoadingWorkspaces && workspaces.length === 0) {
    return <div className="py-12 text-center text-gray-500">טוען מרחבי עבודה...</div>;
  }

  if (!currentWorkspace) {
    return <div className="py-12 text-center text-gray-500">יוצר את מרחב העבודה הראשון...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">שיתוף פעולה וצוותים</h1>
          <p className="text-gray-600 dark:text-gray-400">נהל מרחבי עבודה, שתף כלים ושלח הזמנות לצוות.</p>
        </div>
        <div className="flex w-full lg:w-auto gap-2">
          <Input
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="שם מרחב חדש"
            className="lg:w-56"
          />
          <Button onClick={handleCreateWorkspace} disabled={!newWorkspaceName.trim() || createWorkspaceMutation.isPending} className="bg-gradient-to-r from-teal-500 to-green-600">
            <Plus className="w-4 h-4 ml-2" />
            צור
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>מרחב פעיל</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workspaces.map((workspace) => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  {workspace.name} ({workspace.members?.length || 0} חברים)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={generateShareLink}>
            <Link2 className="w-4 h-4 ml-2" />
            העתק קישור
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="כלים משותפים" value={stats.sharedTools} color="text-teal-600" />
        <StatCard title="חברים פעילים" value={stats.activeUsers} color="text-green-600" />
        <StatCard title="הזמנות פתוחות" value={stats.pendingInvites} color="text-orange-600" />
        <StatCard title="פעולות אחרונות" value={stats.totalActivity} color="text-purple-600" />
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">חברי צוות</TabsTrigger>
          <TabsTrigger value="tools">כלים משותפים</TabsTrigger>
          <TabsTrigger value="activity">פעילות</TabsTrigger>
          <TabsTrigger value="settings">הגדרות</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5" />הזמן חבר צוות</CardTitle>
              <CardDescription>שלח הזמנה ישירות למרחב העבודה הפעיל.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>אימייל</Label>
                  <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>תפקיד</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">צופה</SelectItem>
                      <SelectItem value="editor">עורך</SelectItem>
                      <SelectItem value="admin">מנהל</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleInviteMember} disabled={!inviteEmail || updateWorkspaceMutation.isPending} className="w-full md:w-auto">
                <UserPlus className="w-4 h-4 ml-2" />
                שלח הזמנה
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>חברי {currentWorkspace.name}</CardTitle>
              <CardDescription>{currentWorkspace.members?.length || 0} חברים במרחב</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(currentWorkspace.members || []).map((member) => (
                  <div key={member.email} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-teal-500 to-green-600 text-white">
                          {(member.name || member.email).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{member.name || member.email}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {roleIcons[member.role]}
                        {roleLabels[member.role]}
                      </Badge>
                      {member.status === 'invited' && <Badge className="bg-orange-100 text-orange-800">הוזמן</Badge>}
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
              <CardTitle>ניהול שיתוף כלים</CardTitle>
              <CardDescription>סמן אילו כלים יהיו זמינים לכל חברי המרחב.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tools.length === 0 ? (
                <div className="text-sm text-gray-500">עדיין אין כלים במערכת לשיתוף.</div>
              ) : (
                tools.map((tool) => {
                  const isShared = sharedToolIds.includes(tool.id);
                  return (
                    <div key={tool.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="font-semibold">{tool.name}</div>
                        <div className="text-xs text-gray-500">{tool.category}</div>
                      </div>
                      <Button variant={isShared ? 'secondary' : 'outline'} onClick={() => handleToggleToolShare(tool)}>
                        {isShared ? <Check className="w-4 h-4 ml-2" /> : <Share2 className="w-4 h-4 ml-2" />}
                        {isShared ? 'משותף' : 'שתף'}
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>כלים שכבר משותפים</CardTitle>
              <CardDescription>{sharedTools.length} כלים משותפים במרחב זה</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sharedTools.length === 0 ? (
                <div className="text-sm text-gray-500">עדיין לא שותפו כלים במרחב.</div>
              ) : (
                sharedTools.map((tool) => (
                  <div key={tool.id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                    <div>
                      <div className="font-semibold">{tool.name}</div>
                      <div className="text-xs text-gray-500">{tool.category}</div>
                    </div>
                    <Button variant="ghost" onClick={() => handleToggleToolShare(tool)}>
                      <Trash2 className="w-4 h-4 ml-2" />
                      הסר שיתוף
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>פעילות אחרונה</CardTitle>
              <CardDescription>יומן הפעולות של המרחב הפעיל</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(currentWorkspace.activity || []).length === 0 ? (
                  <div className="text-sm text-gray-500">עדיין אין פעילות מתועדת.</div>
                ) : (
                  currentWorkspace.activity.map((item, index) => (
                    <div key={`${item.timestamp}-${index}`} className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                      <div className="text-sm font-medium">{item.text}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(item.timestamp).toLocaleString('he-IL')}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>הגדרות מרחב</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>שם המרחב</Label>
                <Input value={currentWorkspace.name} disabled />
              </div>
              <div className="space-y-2">
                <Label>בעלים</Label>
                <Input value={currentWorkspace.ownerEmail} disabled />
              </div>
              <Button variant="destructive" className="w-full md:w-auto" onClick={handleDeleteWorkspace} disabled={deleteWorkspaceMutation.isPending || workspaces.length <= 1}>
                <Trash2 className="w-4 h-4 ml-2" />
                מחק מרחב
              </Button>
              {workspaces.length <= 1 && <div className="text-xs text-gray-500">לא ניתן למחוק את המרחב האחרון.</div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Crown className="w-5 h-5 text-yellow-500" />יכולות צוות</CardTitle>
          <CardDescription>החלק הזה כבר מחובר למרחבים, הזמנות ושיתוף כלים אמיתי.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FeatureCard icon={<Users className="w-5 h-5" />} title="מרחבי עבודה" description={`${workspaces.length} מרחבים פעילים`} />
          <FeatureCard icon={<Share2 className="w-5 h-5" />} title="שיתוף כלים" description={`${sharedTools.length} כלים משותפים כעת`} />
          <FeatureCard icon={<UserPlus className="w-5 h-5" />} title="הזמנות" description={`${stats.pendingInvites} הזמנות פתוחות`} />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="rounded-lg bg-white/60 dark:bg-gray-800/60 p-4 flex items-start gap-3">
      <div className="text-indigo-600 dark:text-indigo-400">{icon}</div>
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">{description}</div>
      </div>
    </div>
  );
}