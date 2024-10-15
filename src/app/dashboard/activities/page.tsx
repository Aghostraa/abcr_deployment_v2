// app/dashboard/activities/page.tsx

'use client'

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import EventList from '@/components/EventList';
import EventForm from '@/components/EventForm';
import RecurringTaskCard from '@/components/RecurringTaskCard';
import { useUser } from '@/contexts/UserContext';
import { Tab } from '@headlessui/react';

// Define the structure of an Event object
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

// Define the structure of a RecurringTask object
interface RecurringTask {
  id: number;
  name: string;
  description: string;
  type: 'check_in' | 'meeting_participation';
  points: number;
}

// Main component for the Activities page
const ActivitiesPage = () => {
  // Retrieve the current user from the UserContext
  const { user } = useUser();

  // State to hold the list of events
  const [events, setEvents] = useState<Event[]>([]);

  // State to hold the list of recurring tasks
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);

  // State to manage the loading state
  const [loading, setLoading] = useState(true);

  // Initialize the Supabase client
  const supabase = createClientComponentClient();

  // useEffect to fetch activities when the user or their role changes
  useEffect(() => {
    // Only fetch activities if the user is authenticated and has one of the specified roles
    if (user && ['Admin', 'Manager', 'Member'].includes(user.role)) {
      fetchActivities();
    }
  }, [user]);

  // Function to fetch both events and recurring tasks concurrently
  const fetchActivities = async () => {
    setLoading(true); // Start the loading state
    // Fetch events and recurring tasks in parallel
    await Promise.all([fetchEvents(), fetchRecurringTasks()]);
    setLoading(false); // End the loading state
  };

  // Function to fetch events from the 'events' table in Supabase
  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true }); // Order events by date ascending

    if (error) {
      // Log any errors encountered during fetch
      console.error('Error fetching events:', error);
    } else {
      // Update the events state with fetched data or an empty array if no data
      setEvents(data || []);
    }
  };

  // Function to fetch recurring tasks from the 'recurring_tasks' table in Supabase
  const fetchRecurringTasks = async () => {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*');

    if (error) {
      // Log any errors encountered during fetch
      console.error('Error fetching recurring tasks:', error);
    } else {
      // Update the recurringTasks state with fetched data or an empty array if no data
      setRecurringTasks(data || []);
    }
  };

  // Handler function to refresh events after an event is created or updated
  const handleEventUpdate = () => {
    fetchEvents();
  };

  // Access Control: If the user is not authenticated or doesn't have the required role, show a permission message
  if (!user || !['Admin', 'Manager', 'Member'].includes(user.role)) {
    return (
      <DashboardLayout>
        <div>You do not have permission to view this page.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Title */}
      <h1 className="text-4xl font-bold mb-6">Activities</h1>
      
      {/* Tab Group for switching between Events and Recurring Tasks */}
      <Tab.Group>
        {/* Tab List with two tabs: Events and Recurring Tasks */}
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-4">
          {/* Events Tab */}
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
            ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>
            Events
          </Tab>
          
          {/* Recurring Tasks Tab */}
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
            ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>
            Recurring Tasks
          </Tab>
        </Tab.List>
        
        {/* Tab Panels corresponding to each Tab */}
        <Tab.Panels>
          {/* Events Panel */}
          <Tab.Panel>
            {/* Conditionally render the EventForm if the user is an Admin or Manager */}
            {(user.role === 'Admin' || user.role === 'Manager') && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Create New Event</h2>
                {/* EventForm component with a callback to handle event creation */}
                <EventForm onEventCreated={handleEventUpdate} />
              </div>
            )}
            
            {/* Upcoming Events Header */}
            <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
            {/* EventList component to display the list of events */}
            <EventList events={events} loading={loading} onEventUpdate={handleEventUpdate} />
          </Tab.Panel>
          
          {/* Recurring Tasks Panel */}
          <Tab.Panel>
            {/* Recurring Tasks Header */}
            <h2 className="text-2xl font-semibold mb-4">Recurring Tasks</h2>
            
            {/* Conditional rendering based on loading state */}
            {loading ? (
              <div>Loading recurring tasks...</div>
            ) : (
              /* Grid layout for displaying recurring tasks */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Map through the recurringTasks array and render a RecurringTaskCard for each task */}
                {recurringTasks.map(task => (
                  <RecurringTaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </DashboardLayout>
  );
};

export default ActivitiesPage;
