// app/api/recurring-tasks/[id]/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const taskId = params.id;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if the task has already been completed today
  const today = new Date().toISOString().split('T')[0];
  const { data: existingCompletion, error: checkError } = await supabase
    .from('recurring_task_completions')
    .select()
    .eq('recurring_task_id', taskId)
    .eq('user_id', user.id)
    .gte('completed_at', today)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }

  if (existingCompletion) {
    return NextResponse.json({ error: 'Task already completed today' }, { status: 400 });
  }

  // Complete the task
  const { data, error } = await supabase
    .from('recurring_task_completions')
    .insert({ recurring_task_id: taskId, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Award points to the user
  const { error: pointsError } = await supabase.rpc('award_points_for_recurring_task', {
    p_task_id: taskId,
    p_user_id: user.id
  });

  if (pointsError) {
    return NextResponse.json({ error: pointsError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const taskId = params.id;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if the task has already been completed today
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('recurring_task_completions')
    .select()
    .eq('recurring_task_id', taskId)
    .eq('user_id', user.id)
    .gte('completed_at', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ canComplete: !data });
}