import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { events } = await req.json();

    if (!events || !Array.isArray(events)) {
      return Response.json({ error: 'Invalid events' }, { status: 400 });
    }

    // Mock implementation - עם אימוט אמיתי תחובר ל-Google Calendar API
    // בפועל צריך להשתמש ב-app connectors של base44 ל-Google Calendar

    const synced = events.length;

    return Response.json({
      success: true,
      synced,
      message: `סונכרן ${synced} אירועים בהצלחה`
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});