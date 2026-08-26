import { createClientFromRequest } from 'npm:@base44/sdk';

function toEventId(prefix, rawId) {
  const cleaned = String(rawId || '').toLowerCase().split('').map((char) => /[a-v0-9]/.test(char) ? char : '0').join('');
  const id = `${prefix}${cleaned}`;
  return id.length < 5 ? `${id}00000` : id.slice(0, 1024);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    if (body.action === 'status') {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=1', { headers });
      if (!response.ok) return Response.json({ error: 'Calendar connection unavailable' }, { status: 502 });
      return Response.json({ connected: true });
    }

    const events = Array.isArray(body.events) ? body.events : [];
    if (!events.length) return Response.json({ error: 'Invalid events' }, { status: 400 });

    let created = 0;
    let updated = 0;
    for (const event of events) {
      const eventId = toEventId(event.idPrefix || 'evt', event.sourceId);
      const payload = {
        id: eventId,
        summary: event.title,
        description: event.description,
        start: { dateTime: event.startTime, timeZone: 'Asia/Jerusalem' },
        end: { dateTime: event.endTime, timeZone: 'Asia/Jerusalem' },
        ...(event.recurrence ? { recurrence: event.recurrence } : {}),
        ...(event.reminders ? { reminders: event.reminders } : {}),
      };
      const putResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'PUT', headers, body: JSON.stringify(payload),
      });
      if (putResponse.ok) {
        updated++;
        continue;
      }
      if (putResponse.status !== 404 && putResponse.status !== 410) {
        return Response.json({ error: await putResponse.text() || 'Failed to sync calendar event' }, { status: 502 });
      }
      const postResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST', headers, body: JSON.stringify(payload),
      });
      if (!postResponse.ok) return Response.json({ error: await postResponse.text() || 'Failed to create calendar event' }, { status: 502 });
      created++;
    }

    return Response.json({ success: true, synced: created + updated, created, updated });
  } catch (error) {
    return Response.json({ error: 'Failed to sync Google Calendar' }, { status: 500 });
  }
});