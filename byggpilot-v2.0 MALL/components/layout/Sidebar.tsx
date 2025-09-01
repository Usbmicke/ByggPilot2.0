
import React, { useContext } from 'react';
import { AuthContext } from '../../App';
import { IconDashboard, IconProjects, IconDocuments, IconCustomers, IconPlus, IconSettings, IconLightbulb } from '../../constants';
import { View } from '../Dashboard';

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
}
const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-colors duration-200 text-left ${
      active
        ? 'bg-cyan-500 text-white shadow-md'
        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </button>
);

interface SidebarProps {
    activeView: View;
    onSettingsClick: () => void;
    onNavClick: (view: View) => void;
    onProTipsClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onSettingsClick, onNavClick, onProTipsClick }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex flex-col w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 text-white">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
         <img src="/layout/byggpilot-logo.png" alt="ByggPilot Logotyp" className="h-8 w-auto"/>
         <h1 className="text-2xl font-bold ml-2">ByggPilot</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem icon={<IconDashboard className="w-6 h-6" />} label="Översikt" active={activeView === 'DASHBOARD'} onClick={() => onNavClick('DASHBOARD')} />
        <NavItem icon={<IconProjects className="w-6 h-6" />} label="Projekt" active={activeView === 'PROJECTS'} onClick={() => onNavClick('PROJECTS')} />
        <NavItem icon={<IconDocuments className="w-6 h-6" />} label="Dokument" active={activeView === 'DOCUMENTS'} onClick={() => onNavClick('DOCUMENTS')} />
        <NavItem icon={<IconCustomers className="w-6 h-6" />} label="Kunder" active={activeView === 'CUSTOMERS'} onClick={() => onNavClick('CUSTOMERS')} />
        
        <div className="pt-4 mt-4 border-t border-gray-700/50">
            <NavItem icon={<IconLightbulb className="w-6 h-6" />} label="Tips för proffs" onClick={onProTipsClick} />
        </div>
      </nav>
      <div className="px-4 py-4 space-y-4">
        <button className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40">
          <IconPlus className="w-5 h-5" />
          <span>Nytt Projekt</span>
        </button>
      </div>
      <div className="border-t border-gray-700 p-4">
         <button onClick={onSettingsClick} className="flex items-center w-full px-4 py-2.5 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors duration-200 mb-2">
            <IconSettings className="w-6 h-6" />
            <span className="ml-4 font-medium">Inställningar</span>
        </button>
        <div className="flex items-center mt-4">
          <img className="h-10 w-10 rounded-full object-cover" src={user?.avatarUrl} alt="User avatar" />
          <div className="ml-3">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full mt-4 text-left text-sm text-gray-400 hover:text-white transition-colors duration-200 pl-1">
          Logga ut
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
