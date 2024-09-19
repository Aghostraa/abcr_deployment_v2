import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext';

interface DashboardLayoutProps {
  children: React.ReactElement<{ userRole?: string }> | React.ReactElement<{ userRole?: string }>[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, loading } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to access this page. <Link href="/login">Log In</Link></div>;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
      {/* Sidebar */}
      <motion.div 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg transition-all duration-300 ease-in-out`}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            ABCr Dashboard
          </h1>
        </div>
        <nav className="mt-8">
          <NavLink href="/dashboard" icon="🏠">Home</NavLink>
          {['Admin', 'Manager', 'Member'].includes(user.role) && (
            <NavLink href="/dashboard/tasks" icon="📋">Tasks</NavLink>
          )}
          {['Admin', 'Manager'].includes(user.role) && (
            <NavLink href="/dashboard/projects" icon="🚀">Projects</NavLink>
          )}
          {user.role === 'Admin' && (
            <NavLink href="/dashboard/users" icon="👤">Users</NavLink>
          )}
          <NavLink href="/dashboard/profile" icon="😊">Profile</NavLink>
          <button onClick={handleSignOut} className="w-full text-left py-2 px-4 text-gray-300 hover:bg-indigo-600 transition-colors duration-200 flex items-center">
            <span className="mr-2">🚪</span>
            <span className={`${isSidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>Sign Out</span>
          </button>
        </nav>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { userRole: user.role })
          }
          return child
        })}
        </main>
      </div>
    </div>
  );
};

const NavLink: React.FC<{ href: string; icon: string; children: React.ReactNode }> = ({ href, icon, children }) => (
  <Link href={href} className="block py-2 px-4 text-gray-300 hover:bg-indigo-600 transition-colors duration-200 flex items-center">
    <span className="mr-2">{icon}</span>
    <span className="transition-opacity duration-200">{children}</span>
  </Link>
);

export default DashboardLayout;