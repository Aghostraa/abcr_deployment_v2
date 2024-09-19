'use client'

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import TaskList from '@/components/TaskList';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/contexts/UserContext';

interface Task {
  id: string;
  name: string;
  instructions: string;
  status: string;
  points: number;
  assigned_user_id: string | null;
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
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      fetchRecentTasks();
    }
  }, [user]);

  const fetchRecentTasks = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const handleTaskUpdate = () => {
    fetchRecentTasks();
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card>
              <CardHeader>Total Tasks</CardHeader>
              <CardContent className="text-4xl font-bold">29</CardContent>
            </Card>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card>
              <CardHeader>Completed Tasks</CardHeader>
              <CardContent className="text-4xl font-bold">18</CardContent>
            </Card>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card>
              <CardHeader>Total Points</CardHeader>
              <CardContent className="text-4xl font-bold">540</CardContent>
            </Card>
          </motion.div>
        </div>

        {user && ['Admin', 'Manager', 'Member'].includes(user.role) && (
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
        )}

        {user && ['Admin', 'Manager', 'Member'].includes(user.role) && (
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
        )}

        {user && user.role === 'Visitor' && (
          <motion.div
            className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              Welcome, Visitor!
            </h2>
            <p>To access more features, please contact an administrator to upgrade your role.</p>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default DashboardPage;