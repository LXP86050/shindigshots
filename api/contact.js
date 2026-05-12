/**
 * shindigshots contact endpoint (Vercel Edge)
 *
 * Receives JSON: { name?, email?, phone?, when?, message, _hp? }
 *
 * - Rejects empty/oversized messages
 * - Requires at least one valid contact (email OR phone)
 * - Honeypot ("_hp") submissions return 200 silently so bots don't
 *   learn the trap exists
 * - Sends the inquiry to shindigshotcaptures@gmail.com via Resend,
 *   setting reply_to so hitting reply in Gmail lands in the visitor's
 *   inbox.
 * - If RESEND_API_KEY isn't configured, returns a clear error pointing
 *   the visitor to email directly.
 */

export const config = { runtime: 'edge' };

const TO_EMAIL = 'shindigshotcaptures@gmail.com';
const FROM_EMAIL = 'shindigshots <onboarding@resend.dev>';

/* =========================================================
   VALIDATION (mirrored on the client for instant feedback)
   ========================================================= */

function isValidEmail(s) {
  if (typeof s !== 'string') return false;
  const v = s.trim();
  if (v.length < 6 || v.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

function isValidPhone(s) {
  if (typeof s !== 'string') return false;
  const digits = s.replace(/[^\d]/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

/* =========================================================
   HANDLER
   ========================================================= */

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  if (req.method !== 'POST') {
    return json({ error: 'POST only' }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const name = (body?.name || '').toString().trim().slice(0, 100);
  const email = (body?.email || '').toString().trim().slice(0, 254);
  const phone = (body?.phone || '').toString().trim().slice(0, 30);
  const when = (body?.when || '').toString().trim().slice(0, 100);
  const message = (body?.message || '').toString().trim();
  const honeypot = (body?._hp || '').toString();

  if (honeypot) {
    return json({ ok: true });
  }

  if (message.length < 5) {
    return json({ error: 'Please write a few more words about the shoot.' }, 400);
  }
  if (message.length > 2000) {
    return json({ error: 'Please keep the message under 2,000 characters.' }, 400);
  }

  const hasEmail = email.length > 0;
  const hasPhone = phone.length > 0;
  if (!hasEmail && !hasPhone) {
    return json({ error: "Please add an email or phone so I can get back to you." }, 400);
  }
  if (hasEmail && !isValidEmail(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }
  if (hasPhone && !isValidPhone(phone)) {
    return json({ error: 'Please enter a valid phone number.' }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return json(
      {
        error:
          "The form backend isn't fully configured yet. Email shindigshotcaptures@gmail.com directly.",
      },
      503
    );
  }

  const subject = `Shindig inquiry${name ? ` from ${name}` : ''}`;
  const text = [
    name ? `Name:     ${name}` : null,
    email ? `Email:    ${email}` : null,
    phone ? `Phone:    ${phone}` : null,
    when ? `When:     ${when}` : null,
    '',
    'Message:',
    message,
    '',
    '— Sent from shindigshots.vercel.app',
  ]
    .filter((line) => line !== null)
    .join('\n');

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        ...(hasEmail ? { reply_to: email } : {}),
        subject,
        text,
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      console.error('Resend error', resp.status, errText.slice(0, 200));
      return json(
        {
          error:
            "I couldn't send your note. Please email shindigshotcaptures@gmail.com directly.",
        },
        502
      );
    }
    return json({ ok: true });
  } catch (err) {
    console.error('contact handler error', err);
    return json(
      {
        error:
          'Something went wrong on my end. Please email shindigshotcaptures@gmail.com directly.',
      },
      500
    );
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
