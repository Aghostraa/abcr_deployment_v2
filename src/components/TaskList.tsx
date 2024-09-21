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
      case 'open': return `${baseClass} bg-blue-500 text-white`;
      case 'in progress': return `${baseClass} bg-yellow-500 text-black`;
      case 'complete': return `${baseClass} bg-green-500 text-white`;
      case 'awaiting applicant approval': return `${baseClass} bg-purple-500 text-white`;
      case 'awaiting completion approval': return `${baseClass} bg-orange-500 text-white`;
      default: return `${baseClass} bg-gray-500 text-white`;
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return <div className="text-center py-4">No tasks available.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex space-x-2">
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
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Complete">Complete</option>
          <option value="Awaiting Applicant Approval">Awaiting Applicant Approval</option>
          <option value="Awaiting Completion Approval">Awaiting Completion Approval</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAndFilteredTasks.map(task => (
          <motion.div
            key={task.id}
            className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-lg font-bold mb-2 text-purple-300">{task.name}</h3>
            <p className="text-sm text-gray-300 mb-2 line-clamp-2">{task.instructions}</p>
            <div className="flex justify-between items-center mb-2">
              <span className={getStatusClassName(task.status)}>{task.status}</span>
              <span className="font-bold text-yellow-400">{task.points} Points</span>
            </div>
            <div className="text-xs text-gray-400 mb-2">
              <p>Created: {new Date(task.created_at).toLocaleDateString()}</p>
              <p>Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {task.assigned_user_id && (
                <Link 
                  href={`/profile/${task.assigned_user_id}`}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  View Applicant
                </Link>
              )}
              {(userRole === 'Member' || userRole === 'Manager' || userRole === 'Admin') && 
               task.status === 'Open' && !task.assigned_user_id && (
                <button 
                  onClick={() => applyForTask(task.id)}
                  className="text-xs px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Apply
                </button>
              )}
              {(userRole === 'Manager' || userRole === 'Admin') && task.status === 'Awaiting Applicant Approval' && (
                <button 
                  onClick={() => approveApplication(task.id)}
                  className="text-xs px-2 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                >
                  Approve Application
                </button>
              )}
              {task.assigned_user_id === userId && task.status === 'In Progress' && (
                <button 
                  onClick={() => markTaskAsDone(task.id)}
                  className="text-xs px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                >
                  Mark as Done
                </button>
              )}
              {(userRole === 'Manager' || userRole === 'Admin') && task.status === 'Awaiting Completion Approval' && (
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