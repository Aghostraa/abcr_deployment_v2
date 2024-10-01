import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Trophy, Medal, Award, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface LeaderboardEntry {
  email: string;
  total_points: number;
  monthly_points: number;
  tasks_completed_this_month: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_leaderboard');
      if (error) throw error;
      setLeaderboard(data);
    } catch (err) {
      setError('Failed to fetch leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const shortenEmail = (email: string) => {
    const [username, domain] = email.split('@');
    return username.length > 10 ? `${username.slice(0, 10)}...` : username;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-400" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Award className="text-orange-400" size={24} />;
      default:
        return <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">{rank}</span>;
    }
  };

  if (loading) return <div className="text-center py-4">Loading leaderboard...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-900">
      <CardHeader className="p-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          Leaderboard
        </h2>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-gray-700">
          {leaderboard.slice(0, 5).map((entry, index) => (
            <motion.li
              key={entry.email}
              className="hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Link href={`/dashboard/profile/${encodeURIComponent(entry.email)}`} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <span className="flex-shrink-0">{getRankIcon(index + 1)}</span>
                  <span className="font-medium">{shortenEmail(entry.email)}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{entry.total_points} pts</p>
                    <p className="text-xs text-gray-400">{entry.monthly_points} this month</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;