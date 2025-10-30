
import React from 'react';

const StatCard = ({ icon, title, value }) => (
  <div className="bg-background-secondary p-5 rounded-xl shadow-lg flex items-center gap-5 hover:shadow-primary-500/10 transition-shadow duration-300">
    <div className={`p-4 rounded-lg bg-gray-800`}>  {/* Mörkare bakgrund för ikonen */}
      {icon}
    </div>
    <div>
      <p className="text-md text-text-secondary font-medium">{title}</p>
      <p className="text-3xl font-bold text-text-primary tracking-tight">{value}</p>
    </div>
  </div>
);

export default StatCard;
