'use client'



import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ExternalLink, Clock, Calendar, User, Tag, AlertTriangle, BarChart, Zap } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';


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
  created_by: string;
}

export default function TaskDetailsPage() {
  const params = useParams();
  const { id } = params;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [amplifier, setAmplifier] = useState('1.00');
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (id) {
      fetchTaskDetails();
    }
  }, [id]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    setError(null);
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
      setError('Failed to load task details. Please try again.');
      setLoading(false);
      return;
    }

    setTask({
      ...data,
      project_name: data.projects.name,
      category_name: data.categories.name,
    });
    setAmplifier(data.point_amplifier.toFixed(2));
    setLoading(false);
  };

  const handleAmplifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmplifier(e.target.value);
  };

  const updateAmplifier = async () => {
    if (!task) return;
    
    const { error } = await supabase
      .from('tasks')
      .update({ point_amplifier: parseFloat(amplifier) })
      .eq('id', task.id);

    if (error) {
      console.error('Error updating amplifier:', error);
      setError('Failed to update point amplifier. Please try again.');
    } else {
      fetchTaskDetails();
    }
  };

  const updateTaskStatus = async (newStatus: string) => {
    if (!task) return;

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id);

    if (error) {
      console.error('Error updating task status:', error);
      setError('Failed to update task status. Please try again.');
    } else {
      fetchTaskDetails();
    }
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
    if (urgency >= 4) return 'text-red-500';
    if (urgency >= 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getAmplifiedPoints = (task: Task) => {
    return Math.round(task.points * task.point_amplifier);
  };

  const components: React.ComponentProps<typeof ReactMarkdown>['components'] = {
    a: ({ node, ...props }) => (
      <a {...props} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
        {props.children}
      </a>
    ),
    h1: ({ node, ...props }) => <h1 {...props} className="text-2xl font-bold mt-4 mb-2" />,
    h2: ({ node, ...props }) => <h2 {...props} className="text-xl font-bold mt-3 mb-2" />,
    h3: ({ node, ...props }) => <h3 {...props} className="text-lg font-bold mt-2 mb-1" />,
    ul: ({ node, ...props }) => <ul {...props} className="list-disc list-inside my-2" />,
    ol: ({ node, ...props }) => <ol {...props} className="list-decimal list-inside my-2" />,
    li: ({ node, ...props }) => <li {...props} className="ml-4" />
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

  if (error || !task) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-500">
          <p>{error || 'Task not found'}</p>
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
            {task.points} Base Points
          </span>
          <span className="flex items-center text-green-400">
            <Zap className="mr-1" size={16} />
            {getAmplifiedPoints(task)} Amplified Points
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
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={components}
            >
              {task?.instructions || ''}
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
        {(user?.role === 'Admin' || user?.role === 'Manager') && task.status === 'Open' && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-blue-200">Amplify Points</h2>
            <div className="flex items-center">
              <input
                type="number"
                value={amplifier}
                onChange={handleAmplifierChange}
                min="1.00"
                max="9.99"
                step="0.01"
                className="input-field w-32 mr-2"
              />
              <button
                onClick={updateAmplifier}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Update Amplifier
              </button>
            </div>
          </div>
        )}
        {user && (user.role === 'Admin' || user.role === 'Manager' || user.id === task.created_by || user.id === task.assigned_user_id) && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-blue-200">Task Actions</h2>
            <div className="flex flex-wrap gap-2">
              {task.status === 'Open' && (
                <button
                  onClick={() => updateTaskStatus('In Progress')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Start Task
                </button>
              )}
              {task.status === 'In Progress' && (
                <button
                  onClick={() => updateTaskStatus('Awaiting Completion Approval')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Mark as Completed
                </button>
              )}
              {task.status === 'Awaiting Completion Approval' && (user.role === 'Admin' || user.role === 'Manager') && (
                <button
                  onClick={() => updateTaskStatus('Complete')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Approve Completion
                </button>
              )}
            </div>
          </div>
        )}
        <Link 
          href="/dashboard/tasks"
          className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors mt-4"
        >
          Back to Tasks
        </Link>
      </motion.div>
    </DashboardLayout>
  );
}