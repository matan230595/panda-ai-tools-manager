import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Google Calendar event IDs must use base32hex chars (a-v, 0-9), length 5-1024.
// We build a deterministic ID per source record so re-syncing UPDATES the same
// event instead of creating a duplicate.
function toEventId(prefix, rawId) {
  const cleaned = String(rawId || '')
    .toLowerCase()
    .split('')
    .map((ch) => (/[a-v0-9]/.test(ch) ? ch : '0'))
    .join('');
  const id = `${prefix}${cleaned}`;
  return id.length < 5 ? `${id}00000` : id.slice(0, 1024);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const events = Array.isArray(body.events) ? body.events : [];

    if (events.length === 0) {
      return Response.json({ error: 'Invalid events' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    let synced = 0;
    let updated = 0;
    let created = 0;

    for (const event of events) {
      const eventId = toEventId(event.idPrefix || 'evt', event.sourceId);

      const payload = {
        id: eventId,
        summary: event.title,
        description: event.description,
        start: { dateTime: event.startTime, timeZone: 'Asia/Jerusalem' },
        end: { dateTime: event.endTime, timeZone: 'Asia/Jerusalem' },
      };

      // Upsert: PUT to a fixed event id. If it exists -> update; if not -> create.
      const putRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (putRes.ok) {
        updated++;
        synced++;
        continue;
      }

      // 404/410 -> event id not present yet, create it via POST (keeps the same id).
      if (putRes.status === 404 || putRes.status === 410) {
        const postRes = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        if (postRes.ok) {
          created++;
          synced++;
          continue;
        }

        const postErr = await postRes.text();
        return Response.json({ error: postErr || 'Failed to create calendar event' }, { status: 500 });
      }

      const putErr = await putRes.text();
      return Response.json({ error: putErr || 'Failed to sync calendar event' }, { status: 500 });
    }

    return Response.json({
      success: true,
      synced,
      created,
      updated,
      message: `סונכרנו ${synced} אירועים (${created} חדשים, ${updated} עודכנו) בלוח שנה אחד ללא כפילויות`,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});