import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const events = Array.isArray(body.events) ? body.events : [];

    if (events.length === 0) {
      return Response.json({ error: 'Invalid events' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    let synced = 0;

    for (const event of events) {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.startTime,
            timeZone: 'Asia/Jerusalem',
          },
          end: {
            dateTime: event.endTime,
            timeZone: 'Asia/Jerusalem',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return Response.json({ error: errorText || 'Failed to create calendar event' }, { status: 500 });
      }

      synced++;
    }

    return Response.json({
      success: true,
      synced,
      message: `סונכרנו ${synced} אירועים בהצלחה`,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});