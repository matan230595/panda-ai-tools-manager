import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { toolId, actionType } = await req.json();

    if (!toolId || !actionType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // קבל את הכלי הנוכחי
    const tool = await base44.entities.AiTool.filter({ id: toolId });

    if (tool.length === 0) {
      return Response.json({ error: 'Tool not found' }, { status: 404 });
    }

    const currentTool = tool[0];
    const now = new Date();

    // עדכן usage stats
    const updatedStats = {
      ...currentTool.usageStats,
      timesUsed: (currentTool.usageStats?.timesUsed || 0) + 1,
      lastUsedDate: now.toISOString(),
      usageFrequency: 'יומי' // simplified
    };

    await base44.entities.AiTool.update(toolId, {
      usageStats: updatedStats,
      lastUsed: now.toISOString()
    });

    // שמור גם בـ UserToolRating אם זה click
    if (actionType === 'click') {
      try {
        await base44.entities.UserToolRating.create({
          toolId,
          toolName: currentTool.name,
          rating: 1,
          interactionType: 'click',
          userEmail: user.email
        });
      } catch (err) {
        // ignore if rating creation fails
      }
    }

    return Response.json({
      success: true,
      toolId,
      usageCount: updatedStats.timesUsed,
      lastUsed: now.toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});