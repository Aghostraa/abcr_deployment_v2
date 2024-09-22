import React from 'react';
import { motion } from 'framer-motion';

const KnowledgeHubSection: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="my-24"
    >
      <h2 className="text-3xl font-bold mb-8 text-center gradient-text gradient-purple-pink">Knowledge Hub</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Latest Videos</h3>
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.youtube.com/embed/3R8NHfn4W1U?si=3yyjAdXb7yFDfagJ"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Must Read</h3>
          <ul className="space-y-2">
            <li>
              <a href="https://app.t2.world/article/cm13hjiki91314821mcrbk78i1q" className="text-blue-300 hover:text-blue-100">
                Is Ethereum experiencing an existential crisis?
              </a>
            </li>
            <li>
              <a href="https://vitalik.eth.limo/general/2024/05/29/l2culture.html" className="text-blue-300 hover:text-blue-100">
                Layer 2s as cultural extensions of Ethereum
              </a>
            </li>
            <li>
              <a href="https://docs.growthepie.xyz/" className="text-blue-300 hover:text-blue-100">
                growthepie&apos;s Knowledge Hub for beginners
              </a>
            </li>
          </ul>
        </div>
      </div>
    </motion.section>
  );
};

export default KnowledgeHubSection;