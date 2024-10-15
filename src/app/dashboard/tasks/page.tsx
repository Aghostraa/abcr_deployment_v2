'use client'

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';

// Define the structure of a Task
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
}

// Define the structure of a Project
interface Project {
  id: string;
  name: string;
}

// Define the structure of a Category
interface Category {
  id: string;
  name: string;
}

const TasksPage: React.FC = () => {
  // Retrieve the current user from context
  const { user } = useUser();

  // State variables to manage tasks, projects, categories, loading state, errors, and filters
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Initialize Supabase client
  const supabase = createClientComponentClient();

  // useEffect hook to fetch data when the component mounts or when the user changes
  useEffect(() => {
    if (user && ['Admin', 'Manager', 'Member'].includes(user.role)) {
      fetchData();
    }
  }, [user]);

  /**
   * Fetches tasks, projects, and categories concurrently.
   * Sets the loading state to true before fetching and false after fetching.
   * Handles any errors that occur during the fetch process.
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch tasks, projects, and categories concurrently
      await Promise.all([fetchTasks(), fetchProjects(), fetchCategories()]);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches all tasks from the 'tasks' table in Supabase.
   * Updates the 'tasks' state with the fetched data.
   * Throws an error if the fetch fails.
   */
  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw error;
    setTasks(data || []);
  };

  /**
   * Fetches all projects from the 'projects' table in Supabase.
   * Updates the 'projects' state with the fetched data.
   * Throws an error if the fetch fails.
   */
  const fetchProjects = async () => {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    setProjects(data || []);
  };

  /**
   * Fetches all categories from the 'categories' table in Supabase.
   * Updates the 'categories' state with the fetched data.
   * Throws an error if the fetch fails.
   */
  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    setCategories(data || []);
  };

  /**
   * Handler to refresh the task list after a new task is created.
   * Calls the 'fetchTasks' function to fetch the latest tasks.
   */
  const handleTaskCreated = () => {
    fetchTasks();
  };

  /**
   * Handler to refresh the task list after a task is updated.
   * Calls the 'fetchTasks' function to fetch the latest tasks.
   */
  const handleTaskUpdate = () => {
    fetchTasks();
  };

  /**
   * Filters the tasks based on the selected project and category.
   * If no project or category is selected, all tasks are shown.
   */
  const filteredTasks = tasks.filter(task => 
    (!selectedProject || task.project_id === selectedProject) &&
    (!selectedCategory || task.category_id === selectedCategory)
  );

  /**
   * Conditional rendering:
   * If the user is not logged in or does not have the appropriate role, do not render the page.
   */
  if (!user || !['Admin', 'Manager', 'Member'].includes(user.role)) {
    return null;
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }} // Initial animation state (hidden and slightly shifted down)
        animate={{ opacity: 1, y: 0 }} // Final animation state (visible and in original position)
        transition={{ duration: 0.5 }} // Animation duration
        className="space-y-6" // Adds vertical spacing between child elements
      >
        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Tasks Management
        </h1>

        {/* Conditional Rendering: Show Task Creation Form for Admins and Managers */}
        {(user.role === 'Admin' || user.role === 'Manager') && (
          <motion.div
            className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mb-6"
            whileHover={{ scale: 1.00 }} // No scaling on hover
            transition={{ type: "spring", stiffness: 300 }} // Animation properties
          >
            <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              Create New Task
            </h2>
            {/* TaskForm Component: Handles the creation of new tasks */}
            <TaskForm onTaskCreated={handleTaskCreated} />
          </motion.div>
        )}

        {/* Task List Section */}
        <motion.div
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.00 }} // No scaling on hover
          transition={{ type: "spring", stiffness: 300 }} // Animation properties
        >
          <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Task List
          </h2>

          {/* Filter Controls: Dropdowns to filter tasks by project and category */}
          <div className="mb-4 flex space-x-4">
            {/* Project Filter Dropdown */}
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

            {/* Category Filter Dropdown */}
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

          {/* TaskList Component: Displays the list of filtered tasks */}
          <TaskList tasks={filteredTasks} loading={loading} onTaskUpdate={handleTaskUpdate} />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TasksPage;
