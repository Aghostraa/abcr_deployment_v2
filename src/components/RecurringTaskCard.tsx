'use client'

import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface RecurringTask {
  id: number;
  name: string;
  description: string;
  type: 'check_in' | 'meeting_participation';
  points: number;
}

interface RecurringTaskCardProps {
  task: RecurringTask;
}

const RecurringTaskCard: React.FC<RecurringTaskCardProps> = ({ task }) => {
  const { user } = useUser();
  const supabase = createClientComponentClient();

  const handleComplete = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('recurring_task_completions')
      .insert({ recurring_task_id: task.id, user_id: user.id });

    if (error) {
      console.error('Error completing task:', error);
    } else {
      // Provide user feedback about successful completion
      console.log('Task completed successfully');
    }
  };

  if (user?.role === 'Visitor') {
    return null;
  }

  return (
    <div className="bg-white bg-opacity-10 p-4 rounded-lg">
      <h3 className="text-xl font-semibold">{task.name}</h3>
      <p>{task.description}</p>
      <p>Points: {task.points}</p>
      <button
        onClick={handleComplete}
        className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
      >
        Complete
      </button>
    </div>
  );
};

export default RecurringTaskCard;