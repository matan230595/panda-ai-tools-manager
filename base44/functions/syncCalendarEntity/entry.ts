import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Deterministic Google event id per source record — MUST match syncGoogleCalendar
// so manual and automatic sync always target the SAME calendar event (no duplicates).
// Google event IDs use base32hex chars (a-v, 0-9), length 5-1024.
function toEventId(prefix, rawId) {
  const cleaned = String(rawId || '')
    .toLowerCase()
    .split('')
    .map((ch) => (/[a-v0-9]/.test(ch) ? ch : '0'))
    .join('');
  const id = `${prefix}${cleaned}`;
  return id.length < 5 ? `${id}00000` : id.slice(0, 1024);
}

const ID_PREFIX = {
  Reminder: 'rem',
  ToolTask: 'task',
  Subscription: 'sub',
};

function buildDateTime(date, time = '09:00') {
  return `${date}T${time}:00`;
}

function buildEndDateTime(date, time = '09:00') {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = (hours * 60) + minutes + 30;
  const nextHours = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0');
  const nextMinutes = String(totalMinutes % 60).padStart(2, '0');
  return `${date}T${nextHours}:${nextMinutes}:00`;
}

function mapEntityToGoogleEvent(entityName, record) {
  if (entityName === 'Reminder') {
    if (!record.reminderDate) return null;
    const time = record.reminderTime || '09:00';
    return {
      summary: `תזכורת: ${record.toolName || 'כלי AI'}`,
      description: record.message || 'תזכורת מהמערכת',
      startTime: buildDateTime(record.reminderDate, time),
      endTime: buildEndDateTime(record.reminderDate, time),
    };
  }

  if (entityName === 'ToolTask') {
    if (!record.dueDate) return null;
    const time = record.reminderTime || '09:00';
    return {
      summary: `משימה: ${record.title}`,
      description: `${record.toolName || 'כלי AI'}${record.description ? ` — ${record.description}` : ''}`,
      startTime: buildDateTime(record.dueDate, time),
      endTime: buildEndDateTime(record.dueDate, time),
    };
  }

  if (entityName === 'Subscription') {
    if (!record.renewalDate) return null;
    return {
      summary: `חידוש מנוי: ${record.toolName || 'כלי AI'}`,
      description: `חידוש מנוי ${record.subscriptionType || ''} עבור ${record.toolName || 'כלי AI'}`,
      startTime: buildDateTime(record.renewalDate, '09:00'),
      endTime: buildEndDateTime(record.renewalDate, '09:00'),
    };
  }

  return null;
}

async function getRecord(base44, entityName, entityId) {
  const records = await base44.asServiceRole.entities[entityName].filter({ id: entityId });
  return records[0] || null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await req.json().catch(() => ({}));
    const event = payload.event || {};
    const entityName = event.entity_name || payload.entity_name;

    if (!['Reminder', 'ToolTask', 'Subscription'].includes(entityName)) {
      return Response.json({ success: true, skipped: true, reason: 'Unsupported entity' });
    }

    let currentData = payload.data || null;
    let oldData = payload.old_data || null;

    if (payload.payload_too_large && event.entity_id) {
      currentData = await getRecord(base44, entityName, event.entity_id);
    }

    const ownerEmail = currentData?.created_by || oldData?.created_by;
    if (!ownerEmail) {
      return Response.json({ success: true, skipped: true, reason: 'Missing owner email' });
    }
    if (ownerEmail !== user.email) {
      return Response.json({ error: 'Forbidden: caller does not own this entity' }, { status: 403 });
    }

    const integrations = await base44.asServiceRole.entities.Integration.filter({
      name: 'Google Calendar',
      isEnabled: true,
      created_by: ownerEmail,
    });
    const activeIntegration = integrations[0];

    if (!activeIntegration) {
      return Response.json({ success: true, skipped: true, reason: 'Google Calendar sync is not enabled for this owner' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const eventType = event.type || payload.type || 'update';

    // Deterministic id — same record always maps to the same calendar event.
    const sourceId = currentData?.id || oldData?.id || event.entity_id;
    const eventId = toEventId(ID_PREFIX[entityName] || 'evt', sourceId);

    // Delete when the record is removed, completed, or deactivated.
    if (eventType === 'delete' || currentData?.isCompleted || currentData?.isActive === false) {
      await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return Response.json({ success: true, action: 'deleted' });
    }

    const mappedEvent = mapEntityToGoogleEvent(entityName, currentData);
    if (!mappedEvent) {
      return Response.json({ success: true, skipped: true, reason: 'Missing date information' });
    }

    const googlePayload = {
      id: eventId,
      summary: mappedEvent.summary,
      description: mappedEvent.description,
      start: {
        dateTime: mappedEvent.startTime,
        timeZone: 'Asia/Jerusalem',
      },
      end: {
        dateTime: mappedEvent.endTime,
        timeZone: 'Asia/Jerusalem',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'email', minutes: 120 },
        ],
      },
    };

    // Upsert: PUT to a fixed event id updates if it exists, else create via POST.
    let response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googlePayload),
    });

    let action = 'updated';
    if (response.status === 404 || response.status === 410) {
      response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googlePayload),
      });
      action = 'created';
    }

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: errorText || 'Failed to sync Google Calendar event' }, { status: 500 });
    }

    const responseData = await response.json();

    return Response.json({
      success: true,
      action,
      googleCalendarEventId: responseData.id,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});