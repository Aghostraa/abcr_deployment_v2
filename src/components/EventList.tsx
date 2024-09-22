import React, { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  description: string;
  event_date: string;
  status: 'upcoming' | 'ongoing' | 'past';
  attendees: string[];
}

export interface EventListProps {
  events: Event[];
  loading: boolean;
  onEventUpdate: () => void;
}

type SortKey = 'name' | 'event_date' | 'status';

const EventList: React.FC<EventListProps> = ({ events, loading, onEventUpdate }) => {
  const { user } = useUser();
  const [sortKey, setSortKey] = useState<SortKey>('event_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const supabase = createClientComponentClient();

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredEvents = useMemo(() => {
    return events
      .filter(event => filterStatus ? event.status === filterStatus : true)
      .sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [events, sortKey, sortDirection, filterStatus]);

  const handleAttend = async (eventId: string) => {
    if (!user) return;
  
    // First, fetch the current attendees array
    const { data: eventData, error: fetchError } = await supabase
      .from('events')
      .select('attendees')
      .eq('id', eventId)
      .single();
  
    if (fetchError) {
      console.error('Error fetching event:', fetchError);
      alert('Failed to register for the event. Please try again.');
      return;
    }
  
    // Add the user's ID to the attendees array
    const updatedAttendees = [...(eventData.attendees || []), user.id];
  
    // Update the event with the new attendees array
    const { data, error } = await supabase
      .from('events')
      .update({ attendees: updatedAttendees })
      .eq('id', eventId);
  
    if (error) {
      console.error('Error registering for event:', error);
      alert('Failed to register for the event. Please try again.');
    } else {
      alert('Successfully registered for the event!');
      onEventUpdate();
    }
  };

  const getStatusClassName = (status: string) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case 'upcoming': return `${baseClass} bg-blue-500 text-white`;
      case 'ongoing': return `${baseClass} bg-green-500 text-white`;
      case 'past': return `${baseClass} bg-gray-500 text-white`;
      default: return `${baseClass} bg-gray-500 text-white`;
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user || !['Admin', 'Manager'].includes(user.role)) return;

    if (confirm('Are you sure you want to delete this event?')) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete the event. Please try again.');
      } else {
        alert('Event deleted successfully!');
        onEventUpdate();
      }
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading events...</div>;
  }

  if (events.length === 0) {
    return <div className="text-center py-4">No events available.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex space-x-2">
          <button onClick={() => handleSort('name')} className="px-2 py-1 bg-purple-600 text-white rounded-md text-sm">
            Name {sortKey === 'name' && (sortDirection === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
          </button>
          <button onClick={() => handleSort('event_date')} className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm">
            Date {sortKey === 'event_date' && (sortDirection === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
          </button>
          <button onClick={() => handleSort('status')} className="px-2 py-1 bg-green-600 text-white rounded-md text-sm">
            Status {sortKey === 'status' && (sortDirection === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
          </button>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
        >
          <option value="">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="past">Past</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAndFilteredEvents.map(event => (
          <motion.div
            key={event.id}
            className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md relative"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {user && ['Admin', 'Manager'].includes(user.role) && (
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Delete Event"
              >
                <X size={20} />
              </button>
            )}
            <h3 className="text-lg font-bold mb-2 text-purple-300">{event.name}</h3>
            <p className="text-sm text-gray-300 mb-2 line-clamp-2">{event.description}</p>
            <div className="flex justify-between items-center mb-2">
              <span className={getStatusClassName(event.status)}>{event.status}</span>
              <span className="text-sm text-gray-400">{new Date(event.event_date).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-gray-300 mb-2">Attendees: {event.attendees.length}</p>
            {user && user.role !== 'Visitor' && event.status === 'upcoming' && (
              event.attendees.includes(user.id) ? (
                <p className="text-sm text-green-400">You are registered for this event</p>
              ) : (
                <button 
                  onClick={() => handleAttend(event.id)}
                  className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Attend
                </button>
              )
            )}
            {user && ['Admin', 'Manager'].includes(user.role) && (
              <Link href={`/dashboard/events/${event.id}`} className="block w-full mt-2 text-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors">
                Manage Event
              </Link>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EventList;