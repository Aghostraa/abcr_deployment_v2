import React, { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  instructions: string;
  status: string;
  points: number;
  assigned_user_id: string | null;
  created_at: string;
  deadline: string;
}

export interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onTaskUpdate: () => void;
}

type SortKey = 'name' | 'status' | 'points' | 'created_at' | 'deadline';

const TaskList: React.FC<TaskListProps> = ({ tasks, loading, onTaskUpdate }) => {
  const [userRole, setUserRole] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data, error } = await supabase.rpc('get_user_role', { user_email: user.email });
      if (error) console.error('Error fetching user role:', error);
      else setUserRole(data);
    }
  };

  const applyForTask = async (taskId: string) => {
    console.log(taskId, userId, userRole);
    const { error } = await supabase
      .from('tasks')
      .update({ assigned_user_id: userId, status: 'Awaiting Applicant Approval' })
      .eq('id', taskId);
    alert('Task applied for');
    if (error) console.error('Error applying for task:', error);
    else onTaskUpdate();
  };

  const approveApplication = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'In Progress' })
      .eq('id', taskId);
    if (error) console.error('Error approving application:', error);
    else onTaskUpdate();
  };

  const markTaskAsDone = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'Awaiting Completion Approval' })
      .eq('id', taskId);
    if (error) console.error('Error marking task as done:', error);
    else onTaskUpdate();
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
      .sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [tasks, sortKey, sortDirection, filterStatus]);

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
      case 'open':
        return `${baseClass} bg-gradient-to-r from-blue-400 to-blue-600 text-white`;
      case 'in progress':
        return `${baseClass} bg-gradient-to-r from-yellow-400 to-yellow-600 text-black`;
      case 'complete':
        return `${baseClass} bg-gradient-to-r from-green-400 to-green-600 text-white`;
      case 'awaiting applicant approval':
        return `${baseClass} bg-gradient-to-r from-purple-400 to-purple-600 text-white`;
      case 'awaiting completion approval':
        return `${baseClass} bg-gradient-to-r from-orange-400 to-orange-600 text-white`;
      default:
        return `${baseClass} bg-gradient-to-r from-gray-400 to-gray-600 text-white`;
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return <div className="text-center py-10">No tasks available.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => handleSort('name')}
            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Name {sortKey === 'name' && (sortDirection === 'asc' ? <ChevronUp /> : <ChevronDown />)}
          </button>
          <button
            onClick={() => handleSort('status')}
            className="px-3 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md hover:from-blue-600 hover:to-teal-600 transition-all duration-300"
          >
            Status {sortKey === 'status' && (sortDirection === 'asc' ? <ChevronUp /> : <ChevronDown />)}
          </button>
          <button
            onClick={() => handleSort('points')}
            className="px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-md hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
          >
            Points {sortKey === 'points' && (sortDirection === 'asc' ? <ChevronUp /> : <ChevronDown />)}
          </button>
          <button
            onClick={() => handleSort('deadline')}
            className="px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-md hover:from-red-600 hover:to-pink-600 transition-all duration-300"
          >
            Deadline {sortKey === 'deadline' && (sortDirection === 'asc' ? <ChevronUp /> : <ChevronDown />)}
          </button>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Complete">Complete</option>
          <option value="Awaiting Applicant Approval">Awaiting Applicant Approval</option>
          <option value="Awaiting Completion Approval">Awaiting Completion Approval</option>
        </select>
      </div>
      {sortedAndFilteredTasks.map(task => (
        <motion.div
          key={task.id}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-filter backdrop-blur-lg rounded-lg p-6 shadow-xl relative overflow-hidden group"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:opacity-100 opacity-0 transition-opacity duration-300 transform -skew-x-12"></div>
          <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">{task.name}</h3>
          <p className="text-gray-300 mb-4">{task.instructions}</p>
          <div className="flex justify-between items-center mb-4">
            <span className={getStatusClassName(task.status)}>{task.status}</span>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-600">
              {task.points} Points
            </span>
          </div>
          <div className="text-sm text-gray-400 mb-4">
            <p>Created: {new Date(task.created_at).toLocaleDateString()}</p>
            <p>Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
          </div>
          {task.assigned_user_id && (
            <Link 
              href={`/profile/${task.assigned_user_id}`}
              className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
            >
              View Applicant Profile
            </Link>
          )}
          {(userRole === 'Member' || userRole === 'Manager' || userRole === 'Admin') && 
           task.status === 'Open' && !task.assigned_user_id && (
            <button 
              onClick={() => applyForTask(task.id)}
              className="mt-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"
            >
              Apply
            </button>
          )}
          {(userRole === 'Manager' || userRole === 'Admin') && task.status === 'Awaiting Applicant Approval' && (
            <button 
              onClick={() => approveApplication(task.id)}
              className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-md hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
            >
              Approve Application
            </button>
          )}
          {task.assigned_user_id === userId && task.status === 'In Progress' && (
            <button 
              onClick={() => markTaskAsDone(task.id)}
              className="mt-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-md hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105"
            >
              Mark as Done
            </button>
          )}
          {(userRole === 'Manager' || userRole === 'Admin') && task.status === 'Awaiting Completion Approval' && (
            <button 
              onClick={() => approveTaskCompletion(task.id)}
              className="mt-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-md hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
            >
              Approve Completion
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default TaskList;