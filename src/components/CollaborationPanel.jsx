import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Share2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function CollaborationPanel() {
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState('user');
  const queryClient = useQueryClient();

  const { data: sharedTools = [] } = useQuery({
    queryKey: ['shared-tools'],
    queryFn: async () => {
      // Get current user's shared tools (metadata)
      const settings = await base44.entities.Settings.list();
      return settings[0]?.sharedWith || [];
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: async (email) => {
      return base44.users.inviteUser(email, shareRole);
    },
    onSuccess: () => {
      toast.success(`הזמנה נשלחה ל-${shareEmail}! ✉️`);
      setShareEmail('');
      queryClient.invalidateQueries(['shared-tools']);
    },
    onError: (error) => {
      toast.error(error.message || 'שגיאה בשליחת הזמנה');
    }
  });

  const handleShareAccess = async () => {
    if (!shareEmail) {
      toast.error('הכנס כתובת דוא״ל');
      return;
    }
    inviteUserMutation.mutate(shareEmail);
  };

  return (
    <Card className="border border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          שיתוף וקולaborציה
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Share Form */}
        <div className="space-y-3 bg-white dark:bg-gray-900 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            הזמן משתמשים כדי לשתף את הכלים שלך
          </p>
          <div className="flex gap-2 flex-col sm:flex-row">
            <Input
              type="email"
              placeholder="הכנס כתובת דוא״ל"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="text-xs sm:text-sm"
            />
            <select
              value={shareRole}
              onChange={(e) => setShareRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm"
            >
              <option value="user">משתמש</option>
              <option value="admin">מנהל</option>
            </select>
          </div>
          <Button
            onClick={handleShareAccess}
            disabled={inviteUserMutation.isPending || !shareEmail}
            className="w-full text-xs sm:text-sm"
          >
            <UserPlus className="w-4 h-4 ml-2" />
            שלח הזמנה
          </Button>
        </div>

        {/* Shared Users List */}
        {sharedTools.length > 0 && (
          <div className="space-y-2 bg-white dark:bg-gray-900 p-4 rounded-lg">
            <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
              משתמשים עם גישה:
            </p>
            <div className="space-y-1">
              {sharedTools.map((user, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs sm:text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span>{user.email}</span>
                  <span className="text-gray-500">{user.role === 'admin' ? 'מנהל' : 'משתמש'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}