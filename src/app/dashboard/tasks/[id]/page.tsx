'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ExternalLink, Clock, Calendar, User, Tag, AlertTriangle, BarChart } from 'lucide-react';

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

export default function TaskDetailsPage() {
  const params = useParams();
  const { id } = params;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (id) {
      fetchTaskDetails();
    }
  }, [id]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects(name),
        categories(name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching task details:', error);
      setLoading(false);
      return;
    }

    setTask({
      ...data,
      project_name: data.projects.name,
      category_name: data.categories.name,
    });
    setLoading(false);
  };

  const getStatusClassName = (status: string) => {
    const baseClass = "px-3 py-1 rounded-full text-sm font-semibold";
    switch (status.toLowerCase()) {
      case 'open': return `${baseClass} bg-blue-500 text-white`;
      case 'in progress': return `${baseClass} bg-yellow-500 text-black`;
      case 'complete': return `${baseClass} bg-green-500 text-white`;
      case 'awaiting applicant approval': return `${baseClass} bg-purple-500 text-white`;
      case 'awaiting completion approval': return `${baseClass} bg-orange-500 text-white`;
      default: return `${baseClass} bg-gray-500 text-white`;
    }
  };

  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 8) return 'text-red-500';
    if (urgency >= 5) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500">Task not found</h1>
          <Link href="/dashboard/tasks" className="text-blue-500 hover:underline mt-4 inline-block">
            Back to Tasks
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto p-6 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-4 text-purple-300">{task.name}</h1>
        <div className="flex flex-wrap gap-4 mb-6">
          <span className={getStatusClassName(task.status)}>{task.status}</span>
          <span className="flex items-center text-yellow-400">
            <Tag className="mr-1" size={16} />
            {task.points} Points
          </span>
          <span className="flex items-center text-blue-300">
            <Calendar className="mr-1" size={16} />
            Created: {new Date(task.created_at).toLocaleDateString()}
          </span>
          <span className="flex items-center text-red-300">
            <Clock className="mr-1" size={16} />
            Deadline: {new Date(task.deadline).toLocaleDateString()}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-blue-200">Project</h2>
            <p className="text-gray-300">{task.project_name}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-blue-200">Category</h2>
            <p className="text-gray-300">{task.category_name}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-center">
            <AlertTriangle className={`mr-2 ${getUrgencyColor(task.urgency)}`} size={20} />
            <span className="text-gray-300">Urgency: {task.urgency}/5</span>
          </div>
          <div className="flex items-center">
            <BarChart className="mr-2 text-blue-400" size={20} />
            <span className="text-gray-300">Difficulty: {task.difficulty}/5</span>
          </div>
          <div className="flex items-center">
            <Tag className="mr-2 text-green-400" size={20} />
            <span className="text-gray-300">Priority: {task.priority}/5</span>
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-blue-200">Instructions</h2>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} className="text-blue-400 hover:underline flex items-center">
                    {props.children}
                    <ExternalLink size={12} className="ml-1" />
                  </a>
                ),
              }}
            >
              {task.instructions}
            </ReactMarkdown>
          </div>
        </div>
        {task.assigned_user_id && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-blue-200">Assigned To</h2>
            <Link 
              href={`/dashboard/profile/${task.assigned_user_id}`}
              className="flex items-center text-indigo-400 hover:underline"
            >
              <User className="mr-2" size={16} />
              View Assigned User
            </Link>
          </div>
        )}
        <Link 
          href="/dashboard"
          className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors mt-4"
        >
          Back to Home
        </Link>
      </motion.div>
    </DashboardLayout>
  );
}