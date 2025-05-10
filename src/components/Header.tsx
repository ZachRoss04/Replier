import React from 'react';
import { MessageSquare } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="py-4 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center">
          <div className="flex items-center justify-center bg-white bg-opacity-20 w-10 h-10 rounded-full">
            <MessageSquare size={20} className="text-white" />
          </div>
          <h1 className="ml-3 text-xl font-bold">Reply Genie</h1>
        </div>
        <p className="mt-2 text-sm text-white text-opacity-90 max-w-lg">
          Craft perfect replies to awkward or tricky messages with AI assistance.
        </p>
      </div>
    </header>
  );
};

export default Header;