import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/contexts/UserContext';
import { motion } from 'framer-motion';
import { Calendar, Link as LinkIcon, Globe, Lock } from 'lucide-react';

interface EventFormProps {
  onEventCreated: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ onEventCreated }) => {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLink, setEventLink] = useState('');
  const [eventType, setEventType] = useState<'Internal' | 'Public'>('Internal');
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (user.role !== 'Admin' && user.role !== 'Manager')) {
      alert('You do not have permission to create events.');
      return;
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        name,
        description,
        event_date: eventDate,
        event_link: eventLink,
        event_type: eventType,
        created_by: user.id
      });

    if (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } else {
      alert('Event created successfully!');
      setName('');
      setDescription('');
      setEventDate('');
      setEventLink('');
      setEventType('Internal');
      onEventCreated();
    }
  };

  if (!user || (user.role !== 'Admin' && user.role !== 'Manager')) {
    return null;
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">Event Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter event name"
          required
          className="w-full px-4 py-2 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">Event Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter event description"
          required
          className="w-full px-4 py-2 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={4}
        />
      </div>

      <div>
        <label htmlFor="eventDate" className="block text-sm font-medium text-gray-200 mb-1">Event Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            id="eventDate"
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2 rounded-md bg-white bg-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="eventLink" className="block text-sm font-medium text-gray-200 mb-1">Event Link</label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            id="eventLink"
            type="url"
            value={eventLink}
            onChange={(e) => setEventLink(e.target.value)}
            placeholder="Enter event link (optional)"
            className="w-full pl-10 pr-4 py-2 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">Event Type</label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setEventType('Internal')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              eventType === 'Internal' ? 'bg-purple-600 text-white' : 'bg-white bg-opacity-20 text-gray-300'
            }`}
          >
            <Lock size={16} className="mr-2" />
            Internal
          </button>
          <button
            type="button"
            onClick={() => setEventType('Public')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              eventType === 'Public' ? 'bg-green-600 text-white' : 'bg-white bg-opacity-20 text-gray-300'
            }`}
          >
            <Globe size={16} className="mr-2" />
            Public
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        Create Event
      </button>
    </motion.form>
  );
};

export default EventForm;