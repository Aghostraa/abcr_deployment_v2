import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { Menu, X, Home, FileText, Rocket, Users, User, LogOut, Calendar, RepeatIcon } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactElement<{ userRole?: string }> | React.ReactElement<{ userRole?: string }>[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, loading, setUser } = useUser();
  const { isOpen, toggle } = useSidebar();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
      {/* Sidebar Toggle Button (Mobile) */}
      <button
        className="md:hidden fixed top-4 left-4 z-20 p-2 bg-indigo-600 rounded-md"
        onClick={toggle}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed md:relative z-10 h-full bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <div className="w-64 h-full flex flex-col">
              <div className="p-4">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  ABCr Dashboard
                </h1>
              </div>
              <nav className="flex-grow mt-8">
                <NavLink href="/dashboard" icon={<Home size={20} />}>Home</NavLink>
                {['Admin', 'Manager', 'Member'].includes(user.role) && (
                  <>
                    <NavLink href="/dashboard/tasks" icon={<FileText size={20} />}>Tasks</NavLink>
                    <NavLink href="/dashboard/activities" icon={<Calendar size={20} />}>Activities</NavLink>
                  </>
                )}
                {['Admin', 'Manager'].includes(user.role) && (
                  <NavLink href="/dashboard/projects" icon={<Rocket size={20} />}>Projects</NavLink>
                )}
                {user.role === 'Admin' && (
                  <NavLink href="/dashboard/users" icon={<Users size={20} />}>Users</NavLink>
                )}
                <NavLink href="/dashboard/profile" icon={<User size={20} />}>Profile</NavLink>
              </nav>
              <button 
                onClick={handleSignOut} 
                className="w-full text-left py-2 px-4 text-gray-300 hover:bg-indigo-600 transition-colors duration-200 flex items-center"
              >
                <LogOut size={20} className="mr-2" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <main className="p-6">
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

const NavLink: React.FC<{ href: string; icon: React.ReactNode; children: React.ReactNode }> = ({ href, icon, children }) => (
  <Link href={href} className="block py-2 px-4 text-gray-300 hover:bg-indigo-600 transition-colors duration-200 flex items-center">
    <span className="mr-2">{icon}</span>
    <span>{children}</span>
  </Link>
);

export default DashboardLayout;