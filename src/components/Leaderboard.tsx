import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface LeaderboardEntry {
  email: string;
  total_points: number;
  monthly_points: number;
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
    return `${username.slice(0, 3)}...@${domain}`;
  };

  if (loading) return <div>Loading leaderboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          Leaderboard
        </h2>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-2">Rank</th>
                <th className="pb-2">User</th>
                <th className="pb-2">Total Points</th>
                <th className="pb-2">Monthly Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <motion.tr
                  key={entry.email}
                  className="border-t border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">{shortenEmail(entry.email)}</td>
                  <td className="py-2">{entry.total_points}</td>
                  <td className="py-2">{entry.monthly_points}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;