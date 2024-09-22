'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';

interface Video {
  id: string;
  title: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  url: string;
}

const videos: Video[] = [
  { id: 'VIDEO_ID_1', title: 'Introduction to Blockchain' },
  { id: 'VIDEO_ID_2', title: 'Smart Contracts Explained' },
  // Add more videos here
];

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of DeFi',
    excerpt: 'Exploring the potential of decentralized finance...',
    url: 'https://blog.abcblockchain.com/future-of-defi'
  },
  {
    id: '2',
    title: 'NFTs and Digital Art',
    excerpt: 'How non-fungible tokens are revolutionizing the art world...',
    url: 'https://blog.abcblockchain.com/nfts-and-digital-art'
  },
  // Add more blog posts here
];

const KnowledgeHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'videos' | 'blog'>('videos');

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <h1 className="text-4xl font-bold mb-8 text-center gradient-text gradient-purple-pink">Knowledge Hub</h1>
        
        <div className="flex justify-center mb-8">
          <button
            className={`px-4 py-2 rounded-l-lg ${activeTab === 'videos' ? 'bg-blue-500' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </button>
          <button
            className={`px-4 py-2 rounded-r-lg ${activeTab === 'blog' ? 'bg-blue-500' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('blog')}
          >
            Blog Posts
          </button>
        </div>

        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videos.map((video) => (
              <motion.div
                key={video.id}
                className="glass-panel p-4 rounded-lg shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <h3 className="text-xl font-semibold mt-4">{video.title}</h3>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="space-y-8">
            {blogPosts.map((post) => (
              <motion.div
                key={post.id}
                className="glass-panel p-6 rounded-lg shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-2xl font-semibold mb-2">{post.title}</h3>
                <p className="mb-4">{post.excerpt}</p>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Read More
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default KnowledgeHubPage;