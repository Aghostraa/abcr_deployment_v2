import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: role } = await supabase.rpc('get_user_role', { user_email: user.email });
    
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('points, completed_tasks')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, name, instructions, urgency, difficulty, priority, points, project_id, status, assigned_user_id, created_by, created_at, deadline');

    if (tasksError) throw tasksError;

    return NextResponse.json({ tasks, userRole: role, userPoints: userData.points, completedTasks: userData.completed_tasks });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'An error occurred while fetching data' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: role } = await supabase.rpc('get_user_role', { user_email: user.email });

    const { id, newStatus, newAssignedUserId } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Here you might want to add role-based checks before allowing updates

    const { error } = await supabase
      .from('tasks')
      .update({ 
        status: newStatus,
        assigned_user_id: newAssignedUserId
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'An error occurred while updating the task' }, { status: 500 });
  }
}