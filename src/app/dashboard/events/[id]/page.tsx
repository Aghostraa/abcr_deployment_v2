// app/dashboard/events/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/contexts/UserContext';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Calendar, Globe, Lock, ExternalLink, Users, CheckCircle, XCircle } from 'lucide-react';

interface Attendee {
  id: string;
  email: string;
}

interface Event {
  id: string;
  name: string;
  description: string;
  event_date: string;
  attendees: string[];
  status: 'upcoming' | 'ongoing' | 'past';
  event_link: string;
  event_type: 'Internal' | 'Public';
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Event Details
        </h1>
        {loading ? (
          <div className="text-center py-4">Loading event details...</div>
        ) : event ? (
          <>
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-purple-300">{event.name}</h2>
              <p className="text-gray-300 mb-4">{event.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="mr-2 text-blue-400" size={20} />
                  <span>{new Date(event.event_date).toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  {event.event_type === 'Internal' ? (
                    <Lock className="mr-2 text-yellow-400" size={20} />
                  ) : (
                    <Globe className="mr-2 text-green-400" size={20} />
                  )}
                  <span>{event.event_type}</span>
                </div>
              </div>
              {event.event_link && (
                <a
                  href={event.event_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-blue-400 hover:text-blue-300 flex items-center"
                >
                  Event Link <ExternalLink size={14} className="ml-1" />
                </a>
              )}
            </motion.div>

            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Attendees</h3>
              <ul className="space-y-2 mb-6">
                {attendees.map((attendee) => (
                  <li key={attendee.id} className="flex justify-between items-center">
                    <span>{attendee.email}</span>
                    <button
                      onClick={() => removeAttendee(attendee.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center"
                    >
                      <XCircle size={14} className="mr-1" />
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              {event.status === 'upcoming' && (
                <button
                  onClick={approveAttendance}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  <CheckCircle size={14} className="mr-1" />
                  Approve Attendance and Award Points
                </button>
              )}
            </motion.div>
          </>
        ) : (
          <div className="text-center py-4">Event not found.</div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default EventDetailsPage;