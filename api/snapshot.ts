export const config = { runtime: 'edge' };

interface SnapshotBody {
  email?: unknown;
  dob?: unknown;
  tob?: unknown;
  pob?: unknown;
}

interface MailchimpMember {
  id: string;
}

interface MailchimpSearchResult {
  exact_matches?: { members?: MailchimpMember[] };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let body: SnapshotBody;
  try {
    body = await req.json() as SnapshotBody;
  } catch {
    return json({ error: 'Bad request' }, 400);
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const dob   = typeof body.dob   === 'string' ? body.dob.trim()   : '';
  const tob   = typeof body.tob   === 'string' ? body.tob.trim()   : '';
  const pob   = typeof body.pob   === 'string' ? body.pob.trim()   : '';

  if (!email || !dob || !tob || !pob) return json({ error: 'All fields required' }, 400);

  const apiKey = process.env.MAILCHIMP_API_KEY ?? '';
  const listId = process.env.MAILCHIMP_LIST_ID ?? '';
  const dc     = apiKey.split('-')[1] ?? '';
  const base   = `https://${dc}.api.mailchimp.com/3.0`;
  const auth   = { Authorization: `Bearer ${apiKey}` };

  // Subscribe (pending = double opt-in confirmation email)
  const subRes = await fetch(`${base}/lists/${listId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({
      email_address: email,
      status: 'pending',
      tags: ['snapshot-request'],
    }),
  });

  let memberId: string | null = null;

  if (subRes.ok) {
    const data = await subRes.json() as MailchimpMember;
    memberId = data.id;
  } else {
    const err = await subRes.json() as { title?: string };
    if (err.title !== 'Member Exists') {
      console.error('Mailchimp snapshot subscribe error', err);
      return json({ error: 'Could not process request. Try again.' }, 500);
    }
    // Member already exists — look up their ID via search
    const searchRes = await fetch(
      `${base}/search-members?query=${encodeURIComponent(email)}&list_id=${listId}&count=1`,
      { headers: auth }
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json() as MailchimpSearchResult;
      memberId = searchData.exact_matches?.members?.[0]?.id ?? null;
    }
  }

  // Append bazi data as a member note
  if (memberId) {
    await fetch(`${base}/lists/${listId}/members/${memberId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify({
        note: `Bazi snapshot request\nDOB: ${dob}\nTOB: ${tob}\nPOB: ${pob}`,
      }),
    });
  }

  return json({ ok: true });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
