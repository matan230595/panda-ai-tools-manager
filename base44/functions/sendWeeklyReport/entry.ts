import { createClientFromRequest } from 'npm:@base44/sdk';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me().catch(() => null);
    if (!currentUser) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const users = [currentUser];
    let sentCount = 0;

    for (const user of users) {
      if (!user.email) continue;

      // Fetch user's data
      const tools = await base44.entities.AiTool.filter({ created_by_id: user.id });
      const learningPlans = await base44.entities.ToolLearningPlan.filter({ created_by_id: user.id });
      const subscriptions = await base44.entities.Subscription.filter({ created_by_id: user.id, isActive: true });

      // Skip users with no activity
      if (tools.length === 0 && learningPlans.length === 0) continue;

      // Calculate stats
      const activeTools = tools.filter(t => t.operationalStatus === 'בשימוש');
      const totalMonthlyCost = activeTools.reduce((sum, t) => sum + (t.priceILS || 0), 0);
      const activePlans = learningPlans.filter(p => (p.progress || 0) < 100);
      const completedPlans = learningPlans.filter(p => (p.progress || 0) >= 100);
      const avgProgress = learningPlans.length > 0
        ? Math.round(learningPlans.reduce((sum, p) => sum + (p.progress || 0), 0) / learningPlans.length)
        : 0;

      // Upcoming renewals (next 7 days)
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingRenewals = subscriptions.filter(s => {
        if (!s.renewalDate || !s.isActive) return false;
        const renewal = new Date(s.renewalDate);
        return renewal >= now && renewal <= sevenDaysLater;
      });

      // Top tools by usage
      const topTools = [...tools]
        .sort((a, b) => (b.usageStats?.timesUsed || 0) - (a.usageStats?.timesUsed || 0))
        .slice(0, 5)
        .map(t => `• ${t.name} — ${t.usageStats?.timesUsed || 0} שימושים`);

      // Learning progress details
      const learningDetails = activePlans.map(p => {
        const steps = p.steps || [];
        const completed = steps.filter(s => s.isCompleted).length;
        return `• ${p.toolName}: ${p.progress || 0}% (${completed}/${steps.length} שלבים)${p.targetDate ? ` — יעד: ${p.targetDate}` : ''}`;
      });

      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentTools = tools.filter(t => t.lastUsed && new Date(t.lastUsed) >= weekAgo);

      // Build email body
      const emailBody = `
שלום ${user.full_name || ''},

הנה סיכום השימוש השבועי שלך בכלי AI:

━━━━━━━━━━━━━━━━━━━━
📊 סקירת פעילות
━━━━━━━━━━━━━━━━━━━━
• סה"כ כלים: ${tools.length}
• כלים פעילים: ${activeTools.length}
• כלים בשימוש השבוע: ${recentTools.length}
• עלות חודשית כוללת: ₪${totalMonthlyCost.toLocaleString()}

${topTools.length > 0 ? `
━━━━━━━━━━━━━━━━━━━━
🏆 כלים פעילים ביותר
━━━━━━━━━━━━━━━━━━━━
${topTools.join('\n')}
` : ''}

${learningDetails.length > 0 ? `
━━━━━━━━━━━━━━━━━━━━
🎓 התקדמות למידה
━━━━━━━━━━━━━━━━━━━━
התקדמות ממוצעת: ${avgProgress}%
תוכניות בתהליך: ${activePlans.length}
תוכניות שהושלמו: ${completedPlans.length}

${learningDetails.join('\n')}
` : ''}

${upcomingRenewals.length > 0 ? `
━━━━━━━━━━━━━━━━━━━━
🔔 חידושי מנויים קרובים
━━━━━━━━━━━━━━━━━━━━
${upcomingRenewals.map(s => `• ${s.toolName} — חידוש ב-${s.renewalDate} (₪${s.priceMonthly || 0})`).join('\n')}
` : ''}

━━━━━━━━━━━━━━━━━━━━

דוח זה נשלח אוטומטית מדי שבוע.
היכנס למערכת לפרטים נוספים.

בברכה,
מערכת ניהול כלי AI
      `.trim();

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: `דוח שבועי — סיכום שימוש והתקדמות למידה`,
        body: emailBody,
        from_name: 'AI Tools Manager',
      });

      sentCount++;
    }

    return Response.json({ success: true, sent: sentCount, totalUsers: users.length });
  } catch (error) {
    return Response.json({ error: 'Weekly report failed' }, { status: 500 });
  }
});