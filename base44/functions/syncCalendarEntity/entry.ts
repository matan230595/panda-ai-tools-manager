import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

  return null;
}

async function getRecord(base44, entityName, entityId) {
  const records = await base44.asServiceRole.entities[entityName].filter({ id: entityId });
  return records[0] || null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const event = payload.event || {};
    const entityName = event.entity_name || payload.entity_name;

    if (!['Reminder', 'ToolTask'].includes(entityName)) {
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
    const existingGoogleEventId = currentData?.googleCalendarEventId || oldData?.googleCalendarEventId;

    if (eventType === 'delete' || currentData?.isCompleted || currentData?.isActive === false) {
      if (existingGoogleEventId) {
        await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingGoogleEventId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      if (currentData?.id && eventType !== 'delete') {
        await base44.asServiceRole.entities[entityName].update(currentData.id, { googleCalendarEventId: null });
      }

      return Response.json({ success: true, action: 'deleted' });
    }

    const mappedEvent = mapEntityToGoogleEvent(entityName, currentData);
    if (!mappedEvent) {
      return Response.json({ success: true, skipped: true, reason: 'Missing date information' });
    }

    const googlePayload = {
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

    let response;
    if (existingGoogleEventId) {
      response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingGoogleEventId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googlePayload),
      });
    } else {
      response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googlePayload),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: errorText || 'Failed to sync Google Calendar event' }, { status: 500 });
    }

    const responseData = await response.json();

    if (currentData?.id) {
      await base44.asServiceRole.entities[entityName].update(currentData.id, {
        googleCalendarEventId: responseData.id,
      });
    }

    return Response.json({
      success: true,
      action: existingGoogleEventId ? 'updated' : 'created',
      googleCalendarEventId: responseData.id,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});