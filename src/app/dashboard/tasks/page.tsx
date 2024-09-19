'use client'

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';

interface Task {
  id: string;
  name: string;
  instructions: string;
  project_id: string;
  category_id: string;
  urgency: number;
  priority: number;
  difficulty: number;
  points: number;
  status: string;
  assigned_user_id: string | null;
}

interface Project {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

const TasksPage: React.FC = () => {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user && ['Admin', 'Manager', 'Member'].includes(user.role)) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTasks(), fetchProjects(), fetchCategories()]);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw error;
    setTasks(data || []);
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    setProjects(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    setCategories(data || []);
  };

  const handleTaskCreated = () => {
    fetchTasks();
  };

  const handleTaskUpdate = () => {
    fetchTasks();
  };

  const filteredTasks = tasks.filter(task => 
    (!selectedProject || task.project_id === selectedProject) &&
    (!selectedCategory || task.category_id === selectedCategory)
  );

  if (!user || !['Admin', 'Manager', 'Member'].includes(user.role)) {
    return null;
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
          Tasks Management
        </h1>

        {(user.role === 'Admin' || user.role === 'Manager') && (
          <motion.div
            className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mb-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              Create New Task
            </h2>
            <TaskForm onTaskCreated={handleTaskCreated} />
          </motion.div>
        )}

        <motion.div
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Task List
          </h2>

          <div className="mb-4 flex space-x-4">
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value || null)}
              className="bg-white bg-opacity-20 rounded p-2"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="bg-white bg-opacity-20 rounded p-2"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <TaskList tasks={filteredTasks} loading={loading} onTaskUpdate={handleTaskUpdate} />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TasksPage;