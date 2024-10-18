'use client'

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import TaskList from '@/components/TaskList';
import Leaderboard from '@/components/Leaderboard';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ProjectList from '@/components/ProjectList';
import EventList from '@/components/EventList';
import { useUser } from '@/contexts/UserContext';
import WeeklyCheckinButton from '@/components/WeeklyCheckinButton';
import Loading from '@/components/Loading';

// Define TypeScript interfaces for various data structures

interface Task {
  id: string;
  name: string;
  instructions: string;
  status: string;
  points: number;
  assigned_user_id: string | null;
  created_at: string;
  deadline: string;
  project_id: string;
  project_name: string;
  urgency: number;
  difficulty: number;
  priority: number;
  category_id: string;
  category_name: string;
  point_amplifier: number;
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

interface RecurringTask {
  id: number;
  name: string;
  description: string;
  type: 'check_in' | 'meeting_participation';
  points: number;
}

interface ClubStats {
  total_users: number;
  total_user_points: number;
  total_tasks: number;
  completed_tasks: number;
  total_task_points: number;
  tasks_completed_this_month: number;
  last_updated: string;
}

// Sample data for visualization (if needed)
const data = [
  { name: 'Jan', tasks: 4 },
  { name: 'Feb', tasks: 3 },
  { name: 'Mar', tasks: 2 },
  { name: 'Apr', tasks: 7 },
  { name: 'May', tasks: 5 },
  { name: 'Jun', tasks: 8 },
];

const DashboardPage: React.FC = () => {
  // Retrieve the current user from context
  const { user } = useUser();

  // Define state variables for various data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [clubStats, setClubStats] = useState<ClubStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Supabase client
  const supabase = createClientComponentClient();

  // Fetch data when the component mounts or when the user changes
  useEffect(() => {
    fetchData();
  }, [user]);

  // Function to fetch all necessary data concurrently
  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchClubStats(), 
      fetchEvents(), 
      fetchRecurringTasks(),
      user && ['Admin', 'Manager', 'Member'].includes(user.role) ? fetchRecentTasks() : Promise.resolve()
    ]);
    setLoading(false);
  };

  // Fetch recent tasks from Supabase
  const fetchRecentTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, projects(name)')
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      // Map the fetched data to include project names
      setTasks(data.map(task => ({
        ...task,
        project_name: task.projects.name
      })));
    }
  };

  // Fetch club statistics using a Supabase RPC function
  const fetchClubStats = async () => {
    const { data, error } = await supabase.rpc('get_club_stats');
    if (error) {
      console.error('Error fetching club stats:', error);
    } else {
      setClubStats(data[0]);
    }
  };

  // Fetch upcoming events from Supabase
  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
  };

  // Fetch recurring tasks from Supabase
  const fetchRecurringTasks = async () => {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*');
    if (error) {
      console.error('Error fetching recurring tasks:', error);
    } else {
      setRecurringTasks(data as RecurringTask[] || []);
    }
  };

  // Handler to update tasks and club stats after a task is updated
  const handleTaskUpdate = () => {
    fetchRecentTasks();
    fetchClubStats();
  };

  // Handler to update events after an event is updated
  const handleEventUpdate = () => {
    fetchEvents();
  };

  // Generate a mailto link for contacting the admin
  const generateMailtoLink = () => {
    const recipient = 'ahoura@aachen-blockchain.de';
    const subject = encodeURIComponent('ABC Blockchain Club Membership Inquiry');
    const body = encodeURIComponent(`Dear ABC Team,

I'm interested in joining the ABC Blockchain Club. Here are my details:

1. Are you already a Member? (Yes/No):
2. If yes, what is your current club position?:
3. Email address to be whitelisted:

Best regards,
[Your Name]`);

    return `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  // Display a loading indicator while data is being fetched
  if (loading) {
    return <Loading message="Loading Dashboard..." />;
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }} // Initial animation state
        animate={{ opacity: 1, y: 0 }} // Animation target state
        transition={{ duration: 0.5 }} // Animation duration
        className="space-y-6"
      >
        {/* Dashboard Title */}
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Dashboard
        </h1>

        {/* Weekly Check-in Button */}
        <WeeklyCheckinButton />

        {/* Club Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users Card */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card>
              <CardHeader>Total Users</CardHeader>
              <CardContent className="text-4xl font-bold">{clubStats?.total_users || 0}</CardContent>
            </Card>
          </motion.div>

          {/* Total Tasks Card */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card>
              <CardHeader>Total Tasks</CardHeader>
              <CardContent className="text-4xl font-bold">{clubStats?.total_tasks || 0}</CardContent>
            </Card>
          </motion.div>

          {/* Total Points Card */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card>
              <CardHeader>Total Points</CardHeader>
              <CardContent className="text-4xl font-bold">{(clubStats?.total_user_points || 0) + (clubStats?.total_task_points || 0)}</CardContent>
            </Card>
          </motion.div>

          {/* Monthly Completed Tasks Card */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card>
              <CardHeader>Monthly Completed</CardHeader>
              <CardContent className="text-4xl font-bold">{clubStats?.tasks_completed_this_month || 0}</CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Leaderboard Component */}
        <Leaderboard />

        {/* Conditional Rendering based on User Role */}
        {user && ['Admin', 'Manager', 'Member'].includes(user.role) && (
          <>
            {/* Project List for Authorized Users */}
            <ProjectList defaultFilter="active" />

            {/* Upcoming Events Section */}
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
              whileHover={{ scale: 1.0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                Upcoming Events
              </h2>
              <EventList events={events} loading={loading} onEventUpdate={handleEventUpdate} />
            </motion.div>

            {/* Recent Tasks Section */}
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
              whileHover={{ scale: 1.0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                Recent Tasks
              </h2>
              <TaskList 
                tasks={tasks} 
                loading={loading} 
                onTaskUpdate={handleTaskUpdate}
                defaultFilterStatus="open"
              />
            </motion.div>
          </>
        )}

        {/* Content for Visitors or Unauthenticated Users */}
        {(!user || user.role === 'Visitor') && (
          <>
            {/* Welcome Message */}
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mb-6"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                Welcome to ABC Blockchain Club!
              </h2>
              <p className="text-lg">
                Explore our ongoing projects and recent tasks. Join us to participate in these exciting initiatives!
              </p>
            </motion.div>

            {/* Project List for Visitors */}
            <ProjectList defaultFilter="active" />

            {/* Upcoming Events for Visitors */}
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                Upcoming Events
              </h2>
              <EventList events={events} loading={loading} onEventUpdate={handleEventUpdate} />
            </motion.div>

            {/* Call-to-Action for Joining the Club */}
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mt-6"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                Ready to Join? Or already a Member?
              </h2>
              <p className="mb-4">
                Become a member to access more features and contribute to our projects. Contact an administrator to upgrade your role and start your blockchain journey with us!
              </p>
              <a href={generateMailtoLink()} className="btn-primary inline-block">
                Contact Admin
              </a>
            </motion.div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default DashboardPage;
