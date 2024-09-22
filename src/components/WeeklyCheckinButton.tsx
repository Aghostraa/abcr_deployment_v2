import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/contexts/UserContext';

const WeeklyCheckinButton: React.FC = () => {
  const { user } = useUser();
  const [canCheckin, setCanCheckin] = useState(false);
  const [cooldownTime, setCooldownTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user && user.role !== 'Visitor') {
      checkCheckinStatus();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const checkCheckinStatus = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase.rpc('has_checked_in_this_week', { p_user_id: user.id });

    if (error) {
      console.error('Error checking check-in status:', error);
      setCanCheckin(false);
    } else {
      setCanCheckin(!data);
      if (data) {
        setCooldownTime(getNextMondayDate());
      }
    }
    setIsLoading(false);
  };

  const handleCheckin = async () => {
    if (!user || !canCheckin) return;

    setIsLoading(true);
    const { data, error } = await supabase.rpc('perform_weekly_checkin', { p_user_id: user.id });

    if (error) {
      console.error('Error performing check-in:', error);
      alert('Failed to check in. Please try again later.');
    } else if (data) {
      alert('Check-in successful! You have been awarded 10 points.');
      setCanCheckin(false);
      setCooldownTime(getNextMondayDate());
    } else {
      alert('You have already checked in this week.');
    }
    setIsLoading(false);
  };

  const getNextMondayDate = () => {
    const today = new Date();
    const nextMonday = new Date(today.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7));
    return nextMonday.toLocaleDateString();
  };

  // Don't render anything for visitors or if user data is not available
  if (!user || user.role === 'Visitor') {
    return null;
  }

  return (
    <div>
      {isLoading ? (
        <span className="text-gray-400">Loading...</span>
      ) : canCheckin ? (
        <button
          onClick={handleCheckin}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          disabled={isLoading}
        >
          Weekly Check-in
        </button>
      ) : (
        <span className="text-gray-400">
          Next check-in available on {cooldownTime}
        </span>
      )}
    </div>
  );
};

export default WeeklyCheckinButton;