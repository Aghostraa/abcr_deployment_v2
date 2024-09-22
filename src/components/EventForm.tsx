import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/contexts/UserContext';

interface EventFormProps {
  onEventCreated: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ onEventCreated }) => {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (user.role !== 'Admin' && user.role !== 'Manager')) {
      alert('You do not have permission to create events.');
      return;
    }

    const { data, error } = await supabase
      .from('events')
      .insert({ name, description, event_date: eventDate, created_by: user.id });

    if (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } else {
      alert('Event created successfully!');
      setName('');
      setDescription('');
      setEventDate('');
      onEventCreated();
    }
  };

  if (!user || (user.role !== 'Admin' && user.role !== 'Manager')) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Event Name"
        required
        className="w-full px-4 py-2 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Event Description"
        required
        className="w-full px-4 py-2 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400"
      />
      <input
        type="datetime-local"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        required
        className="w-full px-4 py-2 rounded-md bg-white bg-opacity-20 text-white"
      />
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Create Event
      </button>
    </form>
  );
};

export default EventForm;