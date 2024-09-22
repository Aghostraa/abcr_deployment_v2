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

interface Event {
  id: string;
  name: string;
  description: string;
  attendees: string[];
  event_date: string;
  status: 'upcoming' | 'ongoing' | 'past';
}

interface RecurringTask {
  id: number;
  name: string;
  description: string;
  type: 'check_in' | 'meeting_participation';
  points: number;
}

const ActivitiesPage = () => {
  const { user } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user && ['Admin', 'Manager', 'Member'].includes(user.role)) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    setLoading(true);
    await Promise.all([fetchEvents(), fetchRecurringTasks()]);
    setLoading(false);
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
  };

  const fetchRecurringTasks = async () => {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*');

    if (error) {
      console.error('Error fetching recurring tasks:', error);
    } else {
      setRecurringTasks(data || []);
    }
  };

  const handleEventUpdate = () => {
    fetchEvents();
  };

  if (!user || !['Admin', 'Manager', 'Member'].includes(user.role)) {
    return <DashboardLayout><div>You do not have permission to view this page.</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-6">Activities</h1>
      
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-4">
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
            ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>
            Events
          </Tab>
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
            ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>
            Recurring Tasks
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            {(user.role === 'Admin' || user.role === 'Manager') && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Create New Event</h2>
                <EventForm onEventCreated={handleEventUpdate} />
              </div>
            )}
            <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
            <EventList events={events} loading={loading} onEventUpdate={handleEventUpdate} />
          </Tab.Panel>
          <Tab.Panel>
            <h2 className="text-2xl font-semibold mb-4">Recurring Tasks</h2>
            {loading ? (
              <div>Loading recurring tasks...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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