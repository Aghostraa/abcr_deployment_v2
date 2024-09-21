'use client'

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import TaskList from '@/components/TaskList';
import Leaderboard from '@/components/Leaderboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ProjectList from '@/components/ProjectList';
import { useUser } from '@/contexts/UserContext';

interface Task {
  id: string;
  name: string;
  instructions: string;
  urgency: number;
  difficulty: number;
  priority: number;
  points: number;
  project_id: string;
  status: string;
  assigned_user_id: string | null;
  created_by: string;
  created_at: string;
  deadline: string;
  category_id: string;
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

const data = [
  { name: 'Jan', tasks: 4 },
  { name: 'Feb', tasks: 3 },
  { name: 'Mar', tasks: 2 },
  { name: 'Apr', tasks: 7 },
  { name: 'May', tasks: 5 },
  { name: 'Jun', tasks: 8 },
];

const DashboardPage: React.FC = () => {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clubStats, setClubStats] = useState<ClubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchRecentTasks(), fetchClubStats()]);
    setLoading(false);
  };

  const fetchRecentTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
  };

  const fetchClubStats = async () => {
    const { data, error } = await supabase.rpc('get_club_stats');
    if (error) {
      console.error('Error fetching club stats:', error);
    } else {
      setClubStats(data[0]);  // The function now returns a single row
    }
  };

  const handleTaskUpdate = () => {
    fetchRecentTasks();
    fetchClubStats();  // Refresh stats when a task is updated
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card>
              <CardHeader>Total Users</CardHeader>
              <CardContent className="text-4xl font-bold">{clubStats?.total_users || 0}</CardContent>
            </Card>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card>
              <CardHeader>Total Tasks</CardHeader>
              <CardContent className="text-4xl font-bold">{clubStats?.total_tasks || 0}</CardContent>
            </Card>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card>
              <CardHeader>Total Points</CardHeader>
              <CardContent className="text-4xl font-bold">{(clubStats?.total_user_points || 0) + (clubStats?.total_task_points || 0)}</CardContent>
            </Card>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card>
              <CardHeader>Monthly Completed</CardHeader>
              <CardContent className="text-4xl font-bold">{clubStats?.tasks_completed_this_month || 0}</CardContent>
            </Card>
          </motion.div>
        </div>

        <Leaderboard />

        {user && ['Admin', 'Manager', 'Member'].includes(user.role) && (
          <>
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                Task Completion Trend
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                Recent Tasks
              </h2>
              <TaskList tasks={tasks} loading={loading} onTaskUpdate={handleTaskUpdate} />
            </motion.div>
          </>
        )}

        {(!user || user.role === 'Visitor') && (
          <>
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                Welcome to ABC Blockchain Club!
              </h2>
              <p className="text-lg">
                Explore our ongoing projects and recent tasks. Join us to participate in these exciting initiatives!
              </p>
            </motion.div>

            <ProjectList />

            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mt-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                Ready to Join?
              </h2>
              <p className="mb-4">
                Become a member to access more features and contribute to our projects. Contact an administrator to upgrade your role and start your blockchain journey with us!
              </p>
              <button className="btn-primary">Contact Admin</button>
            </motion.div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default DashboardPage;