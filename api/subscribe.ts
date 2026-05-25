export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let email: string;
  try {
    const body = await req.json() as { email?: unknown };
    email = typeof body.email === 'string' ? body.email.trim() : '';
  } catch {
    return json({ error: 'Bad request' }, 400);
  }

  if (!email) return json({ error: 'Email required' }, 400);

  const apiKey = process.env.MAILCHIMP_API_KEY ?? '';
  const listId = process.env.MAILCHIMP_LIST_ID ?? '';
  const dc = apiKey.split('-')[1] ?? '';

  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      email_address: email,
      status: 'pending',
      tags: ['subscriber'],
    }),
  });

  if (!res.ok) {
    const body = await res.json() as { title?: string };
    if (body.title === 'Member Exists') return json({ ok: true });
    console.error('Mailchimp subscribe error', body);
    return json({ error: 'Could not subscribe. Try again.' }, 500);
  }

  return json({ ok: true });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
