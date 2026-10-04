import { createClient } from 'npm:@supabase/supabase-js@2';

type BootstrapRequest = {
  schoolName?: unknown;
  timezone?: unknown;
  administratorEmail?: unknown;
  administratorName?: unknown;
};

const encoder = new TextEncoder();

function constantTimeEqual(left: string, right: string): boolean {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  let difference = leftBytes.length ^ rightBytes.length;
  const maxLength = Math.max(leftBytes.length, rightBytes.length);

  for (let index = 0; index < maxLength; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' });
  }

  const expectedSecret = Deno.env.get('BOOTSTRAP_SECRET') ?? '';
  const providedSecret = request.headers.get('x-bootstrap-secret') ?? '';
  if (!expectedSecret || !constantTimeEqual(expectedSecret, providedSecret)) {
    return jsonResponse(401, { error: 'Unauthorized.' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, { error: 'Bootstrap service is not configured.' });
  }

  let input: BootstrapRequest;
  try {
    input = await request.json() as BootstrapRequest;
  } catch {
    return jsonResponse(400, { error: 'Invalid request.' });
  }

  const schoolName = typeof input.schoolName === 'string' ? input.schoolName.trim() : '';
  const timezone = typeof input.timezone === 'string' ? input.timezone.trim() : '';
  const administratorEmail = typeof input.administratorEmail === 'string'
    ? input.administratorEmail.trim().toLowerCase()
    : '';
  const administratorName = typeof input.administratorName === 'string'
    ? input.administratorName.trim()
    : '';

  if (!schoolName || !administratorName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(administratorEmail)) {
    return jsonResponse(400, { error: 'School name and valid administrator details are required.' });
  }

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format();
  } catch {
    return jsonResponse(400, { error: 'A valid IANA timezone is required.' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const redirectTo = Deno.env.get('ADMIN_INVITE_REDIRECT') ?? 'quran-school://auth/callback';
  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    administratorEmail,
    { data: { display_name: administratorName }, redirectTo },
  );

  if (inviteError || !inviteData.user) {
    return jsonResponse(400, { error: 'Administrator invitation could not be created.' });
  }

  const { data: schoolId, error: bootstrapError } = await supabase.rpc('bootstrap_first_school', {
    p_school_name: schoolName,
    p_timezone: timezone,
    p_admin_profile_id: inviteData.user.id,
  });

  if (bootstrapError || !schoolId) {
    await supabase.auth.admin.deleteUser(inviteData.user.id);
    return jsonResponse(409, { error: 'School bootstrap did not complete. No school was created.' });
  }

  return jsonResponse(201, { schoolId, invitationSent: true });
});