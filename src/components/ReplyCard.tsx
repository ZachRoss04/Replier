import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ReplyCardProps {
  reply: {
    id: number;
    text: string;
  };
}

const ReplyCard: React.FC<ReplyCardProps> = ({ reply: { id, text } }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div 
      className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-200"
      style={{ animationDelay: `${id * 150}ms` }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-gray-500">Option {id + 1}</span>
        <button
          onClick={handleCopy}
          className={`p-1.5 rounded-full transition-all duration-200 ${
            copied 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
          aria-label="Copy reply to clipboard"
          title="Copy reply to clipboard"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <p className="text-gray-800 whitespace-pre-line">
        {text}
      </p>
    </div>
  );
};

export default ReplyCard;