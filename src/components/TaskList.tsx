import React, { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronUp, ChevronDown, ExternalLink, AlertTriangle, BarChart, Tag, User, Zap } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import ReactMarkdown from 'react-markdown';

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

export interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onTaskUpdate: () => void;
  projectId?: string;
  defaultFilterStatus?: string;
}

type SortKey = 'name' | 'status' | 'points' | 'created_at' | 'deadline' | 'project_name' | 'urgency' | 'difficulty' | 'priority';

const TaskList: React.FC<TaskListProps> = ({ tasks, loading, onTaskUpdate, projectId, defaultFilterStatus = '' }) => {
  const { user } = useUser();
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>(defaultFilterStatus);
  const supabase = createClientComponentClient();

  useEffect(() => {
    setFilterStatus(defaultFilterStatus);
  }, [defaultFilterStatus]);

  const applyForTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ assigned_user_id: user?.id, status: 'Awaiting Applicant Approval' })
      .eq('id', taskId);
    if (error) {
      console.error('Error applying for task:', error);
      alert('Failed to apply for task. Please try again.');
    } else {
      alert('Task applied for successfully!');
      onTaskUpdate();
    }
  };

  const approveApplication = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'In Progress' })
      .eq('id', taskId);
    if (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application. Please try again.');
    } else {
      alert('Application approved successfully!');
      onTaskUpdate();
    }
  };

  const markTaskAsDone = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'Awaiting Completion Approval' })
      .eq('id', taskId);
    if (error) {
      console.error('Error marking task as done:', error);
      alert('Failed to mark task as done. Please try again.');
    } else {
      alert('Task marked as done successfully!');
      onTaskUpdate();
    }
  };

  const approveTaskCompletion = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'Complete' })
      .eq('id', taskId);
    if (error) {
      console.error('Error approving task completion:', error);
      alert('Failed to approve task completion. Please try again.');
    } else {
      alert('Task completion approved successfully!');
      onTaskUpdate();
    }
  };

  const sortedAndFilteredTasks = useMemo(() => {
    return tasks
      .filter(task => filterStatus ? task.status.toLowerCase() === filterStatus.toLowerCase() : true)
      .filter(task => projectId ? task.project_id === projectId : true)
      .sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [tasks, sortKey, sortDirection, filterStatus, projectId]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getStatusClassName = (status: string) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-semibold";
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
  
  const stripMarkdown = (markdown: string) => {
    // This is a simple stripping function. For more complex markdown, consider using a dedicated library.
    return markdown
      .replace(/#{1,6}\s?/g, '')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '$1')
      .replace(/\n/g, ' ')
      .trim();
  };

  const getAmplifiedPoints = (task: Task) => {
    return Math.round(task.points * task.point_amplifier);
  };
  const getCardClassName = (task: Task) => {
    const baseClass = "bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md";
    if (task.point_amplifier > 1) {
      return `${baseClass} border-2 border-yellow-400 shadow-lg shadow-yellow-400/50`;
    }
    return baseClass;
  };

  if (loading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  if (sortedAndFilteredTasks.length === 0) {
    return <div className="text-center py-4">No tasks available.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
        <div className="flex space-x-2 flex-wrap">
          <button onClick={() => handleSort('name')} className="px-2 py-1 bg-purple-600 text-white rounded-md text-sm">
            Name {sortKey === 'name' && (sortDirection === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
          </button>
          <button onClick={() => handleSort('status')} className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm">
            Status {sortKey === 'status' && (sortDirection === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
          </button>
          <button onClick={() => handleSort('points')} className="px-2 py-1 bg-yellow-600 text-white rounded-md text-sm">
            Points {sortKey === 'points' && (sortDirection === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
          </button>
          <button onClick={() => handleSort('deadline')} className="px-2 py-1 bg-red-600 text-white rounded-md text-sm">
            Deadline {sortKey === 'deadline' && (sortDirection === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
          </button>
          <button onClick={() => handleSort('urgency')} className="px-2 py-1 bg-orange-600 text-white rounded-md text-sm">
            Urgency {sortKey === 'urgency' && (sortDirection === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
          </button>
          {!projectId && (
            <button onClick={() => handleSort('project_name')} className="px-2 py-1 bg-green-600 text-white rounded-md text-sm">
              Project {sortKey === 'project_name' && (sortDirection === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
            </button>
          )}
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in progress">In Progress</option>
          <option value="complete">Complete</option>
          <option value="awaiting applicant approval">Awaiting Applicant Approval</option>
          <option value="awaiting completion approval">Awaiting Completion Approval</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAndFilteredTasks.map(task => (
          <motion.div
            key={task.id}
            className={getCardClassName(task)}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link href={`/dashboard/tasks/${task.id}`} className="block">
              <h3 className="text-lg font-bold mb-2 text-purple-300 hover:text-purple-400 transition-colors">{task.name}</h3>
            </Link>
            {!projectId && (
              <p className="text-sm text-blue-300 mb-2">Project: {task.project_name}</p>
            )}
            <div className="flex justify-between items-center mb-2">
              <span className={getStatusClassName(task.status)}>{task.status}</span>
              <div className="flex items-center">
                <span className="font-bold text-yellow-400">
                  {task.points} {task.point_amplifier > 1 && `x${task.point_amplifier.toFixed(1)}`}
                </span>
                {task.point_amplifier > 1 && (
                  <span className="ml-2 font-bold text-green-400 flex items-center">
                    {getAmplifiedPoints(task)} <Zap className="ml-1" size={16} />
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="flex items-center">
                <AlertTriangle className={`mr-1 ${getUrgencyColor(task.urgency)}`} size={12} />
                <span className="text-xs text-gray-400">{task.urgency}/5</span>
              </div>
              <div className="flex items-center">
                <BarChart className="mr-1 text-blue-400" size={12} />
                <span className="text-xs text-gray-400">{task.difficulty}/5</span>
              </div>
              <div className="flex items-center">
                <Tag className="mr-1 text-green-400" size={12} />
                <span className="text-xs text-gray-400">{task.priority}/5</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 mb-2">
              <p>Created: {new Date(task.created_at).toLocaleDateString()}</p>
              <p>Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link 
                href={`/dashboard/tasks/${task.id}`}
                className="text-xs px-2 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center"
              >
                View Instructions <ExternalLink size={12} className="ml-1" />
              </Link>
              {task.assigned_user_id && (
                <Link 
                  href={`/dashboard/profile/${task.assigned_user_id}`}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
                >
                  View Applicant <User size={12} className="ml-1" />
                </Link>
              )}
              {(user?.role === 'Member' || user?.role === 'Manager' || user?.role === 'Admin') && 
               task.status === 'Open' && !task.assigned_user_id && (
                <button 
                  onClick={() => applyForTask(task.id)}
                  className="text-xs px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Apply
                </button>
              )}
              {(user?.role === 'Manager' || user?.role === 'Admin') && task.status === 'Awaiting Applicant Approval' && (
                <button 
                  onClick={() => approveApplication(task.id)}
                  className="text-xs px-2 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                >
                  Approve Application
                </button>
              )}
              {task.assigned_user_id === user?.id && task.status === 'In Progress' && (
                <button 
                  onClick={() => markTaskAsDone(task.id)}
                  className="text-xs px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                >
                  Mark as Done
                </button>
              )}
              {(user?.role === 'Manager' || user?.role === 'Admin') && task.status === 'Awaiting Completion Approval' && (
                <button 
                  onClick={() => approveTaskCompletion(task.id)}
                  className="text-xs px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Approve Completion
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;