// app/api/events/[id]/approve/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const eventId = params.id;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: role } = await supabase.rpc('get_user_role', { user_email: user.email });
  if (role !== 'Admin' && role !== 'Manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { attendees } = await request.json();

  // Update status to 'approved' for all attendees
  const { data, error } = await supabase
    .from('event_attendances')
    .update({ status: 'approved' })
    .eq('event_id', eventId)
    .in('user_id', attendees);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Award points to approved attendees
  const { error: pointsError } = await supabase.rpc('award_points_for_event', {
    p_event_id: eventId,
    p_attendees: attendees
  });

  if (pointsError) {
    return NextResponse.json({ error: pointsError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Attendance approved and points awarded' });
}