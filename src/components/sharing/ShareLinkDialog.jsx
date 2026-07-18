import React, { useMemo, useState } from 'react';
import { Share2, Copy, Loader2, Link2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';

export default function ShareLinkDialog({ tool = null, tools = [], iconOnly = false }) {
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState('view');
  const [shareUrl, setShareUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const selectedTools = useMemo(() => (tool ? [tool] : tools).filter(Boolean), [tool, tools]);
  const targetType = tool ? 'tool' : 'list';
  const title = tool ? tool.name : `רשימת כלים (${selectedTools.length})`;

  const handleCreateLink = async () => {
    if (selectedTools.length === 0) return;

    setIsCreating(true);
    try {
      const token = crypto.randomUUID();
      await base44.entities.ShareLink.create({
        token,
        title,
        targetType,
        toolIds: selectedTools.map((item) => item.id),
        permission,
        isActive: true,
      });

      const url = `${window.location.origin}/shared/${token}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      toast.success('קישור שיתוף נוצר והועתק');
    } catch (error) {
      toast.error('לא הצלחתי ליצור קישור שיתוף');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    toast.success('הקישור הועתק שוב');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={iconOnly ? 'h-8 sm:h-9 md:h-10 w-8 sm:w-9 md:w-10 p-0 touch-target' : 'min-h-[44px]'}>
          <Share2 className="w-4 h-4 ml-0 md:ml-2" />
          {!iconOnly && 'שתף'}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>שיתוף בקישור ייחודי</DialogTitle>
          <DialogDescription>
            רק משתמשים מחוברים יוכלו לפתוח את הקישור הזה.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/30 p-3 text-sm">
            <div className="font-medium">מה ישותף</div>
            <div className="mt-1 text-muted-foreground">{title}</div>
          </div>

          <div className="space-y-2">
            <Label>הרשאה</Label>
            <Select value={permission} onValueChange={setPermission}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">צפייה בלבד</SelectItem>
                <SelectItem value="edit">צפייה ועריכה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!shareUrl ? (
            <Button onClick={handleCreateLink} disabled={isCreating || selectedTools.length === 0} className="w-full">
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  יוצר קישור...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 ml-2" />
                  צור קישור שיתוף
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <Label>הקישור שלך</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly />
                <Button type="button" variant="outline" onClick={handleCopy}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}