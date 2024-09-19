import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: role } = await supabase.rpc('get_user_role', { user_email: user.email });
    
    if (role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email, role, last_login, created_at');

    if (error) throw error;

    return NextResponse.json({ users: data });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'An error occurred while fetching users' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: role } = await supabase.rpc('get_user_role', { user_email: user.email });
    
    if (role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, newRole } = await request.json();

    const { error } = await supabase.rpc('set_user_role', { user_id: userId, new_role: newRole });

    if (error) throw error;

    return NextResponse.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'An error occurred while updating user role' }, { status: 500 });
  }
}