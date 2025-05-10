import React, { useState, useRef } from 'react';
import { Send, Upload } from 'lucide-react';

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  message, 
  setMessage, 
  onSubmit,
  isLoading
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // This is a placeholder for image handling
    // In a real implementation, you would process the image here
    // For now, we'll just show a message that image upload isn't implemented yet
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      alert("Image upload functionality will be implemented in a future version.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      alert("Image upload functionality will be implemented in a future version.");
      e.target.value = ''; // Reset the input
    }
  };

  return (
    <div className="w-full">
      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
        Message to Reply To <span className="text-xs font-normal text-gray-500">(the most recent message you received)</span>
      </label>
      <form onSubmit={handleSubmit} className="w-full">
        <div 
          className={`relative border-2 rounded-lg transition-all duration-200 ${
            isDragging 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <textarea
            ref={textareaRef}
            id="message"
            value={message}
            onChange={handleTextareaChange}
            placeholder="Type or paste the most recent message you need to reply to..."
            className="w-full p-3 min-h-[120px] rounded-lg focus:outline-none focus:ring-0 bg-transparent resize-none"
            disabled={isLoading}
          />
          <div className="absolute bottom-2 right-2 flex gap-2">
            <label 
              htmlFor="file-upload" 
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer"
              title="Upload a screenshot (coming soon)"
            >
              <Upload size={16} className="text-gray-600" />
              <input 
                id="file-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={isLoading}
              />
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={`mt-4 flex items-center justify-center w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            !message.trim() || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Replies...
            </div>
          ) : (
            <>
              Generate Replies
              <Send size={16} className="ml-2" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;