import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-800/50">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-neutral-500">&copy; {new Date().getFullYear()} ByggPilot. Alla rättigheter förbehållna.</p>
          {/* Add social links here if needed in the future */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
