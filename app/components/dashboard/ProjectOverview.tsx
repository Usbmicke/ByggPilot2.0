'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';

const ProjectOverview = () => {
  const handleCreateFirstProject = () => {
    alert('Funktionalitet för att skapa projekt kommer snart!');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-2xl font-semibold text-gray-200 mb-2">
          Du har inga aktiva projekt än
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Kom igång genom att skapa ditt första projekt.
        </p>
        <motion.button
          onClick={handleCreateFirstProject}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors shadow-lg"
        >
          <PlusCircle size={24} />
          Skapa ditt första projekt
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ProjectOverview;
