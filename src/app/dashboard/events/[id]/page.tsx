// app/dashboard/events/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/contexts/UserContext';
import DashboardLayout from '@/components/DashboardLayout';

interface Attendee {
  id: string;
  email: string;
}

interface Event {
  id: string;
  name: string;
  attendees: string[];
  status: 'upcoming' | 'past';
}

const EventDetailsPage = ({ params }: { params: { id: string } }) => {
  const { user } = useUser();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user && ['Admin', 'Manager'].includes(user.role)) {
      fetchEventAndAttendees();
    }
  }, [user, params.id]);

  const fetchEventAndAttendees = async () => {
    setLoading(true);
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .single();

    if (eventError) {
      console.error('Error fetching event:', eventError);
      setLoading(false);
      return;
    }

    setEvent(eventData);

    if (eventData.attendees && eventData.attendees.length > 0) {
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('user_profiles')
        .select('id, email')
        .in('id', eventData.attendees);

      if (attendeesError) {
        console.error('Error fetching attendees:', attendeesError);
      } else {
        setAttendees(attendeesData || []);
      }
    }

    setLoading(false);
  };

  const removeAttendee = async (attendeeId: string) => {
    if (!event) return;

    const updatedAttendees = event.attendees.filter(id => id !== attendeeId);

    const { error } = await supabase
      .from('events')
      .update({ attendees: updatedAttendees })
      .eq('id', event.id);

    if (error) {
      console.error('Error removing attendee:', error);
    } else {
      setEvent({ ...event, attendees: updatedAttendees });
      setAttendees(attendees.filter(attendee => attendee.id !== attendeeId));
    }
  };

  const approveAttendance = async () => {
    if (!event) return;

    const { error } = await supabase.rpc('approve_event_attendance', {
      p_event_id: event.id,
      p_points: 20
    });

    if (error) {
      console.error('Error approving attendance:', error);
      alert('Failed to approve attendance. Please try again.');
    } else {
      alert('Attendance approved and points awarded!');
      fetchEventAndAttendees();
    }
  };

  if (!user || !['Admin', 'Manager'].includes(user.role)) {
    return <DashboardLayout><div>You do not have permission to view this page.</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-6">Event Details</h1>
      {loading ? (
        <div>Loading event details...</div>
      ) : event ? (
        <>
          <h2 className="text-2xl font-semibold mb-4">{event.name}</h2>
          <p className="mb-4">Status: {event.status}</p>
          <h3 className="text-xl font-semibold mb-2">Attendees</h3>
          <ul className="space-y-2 mb-6">
            {attendees.map((attendee) => (
              <li key={attendee.id} className="flex justify-between items-center">
                <span>{attendee.email}</span>
                <button
                  onClick={() => removeAttendee(attendee.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          {event.status === 'upcoming' && (
            <button
              onClick={approveAttendance}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Approve Attendance and Award Points
            </button>
          )}
        </>
      ) : (
        <div>Event not found.</div>
      )}
    </DashboardLayout>
  );
};

export default EventDetailsPage;