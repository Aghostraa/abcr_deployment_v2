import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  name: string;
  instructions: string;
  status: string;
  points: number;
  assigned_user_id: string | null;
}

export interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onTaskUpdate: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, loading, onTaskUpdate }) => {
  const [userRole, setUserRole] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
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

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return <div>No tasks available.</div>;
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <motion.div
          key={task.id}
          className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md"
          whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.25)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3 className="text-xl font-semibold">{task.name}</h3>
          <p>{task.instructions}</p>
          <p>Status: {task.status}</p>
          <p>Points: {task.points}</p>
          {(userRole === 'Member' || userRole === 'Manager' || userRole === 'Admin') && 
           task.status === 'Open' && !task.assigned_user_id && (
            <button 
              onClick={() => applyForTask(task.id)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Apply
            </button>
          )}
          {(userRole === 'Manager' || userRole === 'Admin') && task.status === 'Awaiting Applicant Approval' && (
            <button 
              onClick={() => approveApplication(task.id)}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Approve Application
            </button>
          )}
          {task.assigned_user_id === userId && task.status === 'In Progress' && (
            <button 
              onClick={() => markTaskAsDone(task.id)}
              className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Mark as Done
            </button>
          )}
          {(userRole === 'Manager' || userRole === 'Admin') && task.status === 'Awaiting Completion Approval' && (
            <button 
              onClick={() => approveTaskCompletion(task.id)}
              className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
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