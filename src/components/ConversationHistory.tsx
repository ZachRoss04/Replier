import React, { useState } from 'react';
import { Plus, X, User, UserRound } from 'lucide-react';
import { ConversationMessage, MessageSender } from '../types';

interface ConversationHistoryProps {
  conversationHistory: ConversationMessage[];
  setConversationHistory: React.Dispatch<React.SetStateAction<ConversationMessage[]>>;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ 
  conversationHistory, 
  setConversationHistory 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [sender, setSender] = useState<MessageSender>('other');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddMessage = () => {
    if (newMessage.trim()) {
      const newConversationMessage: ConversationMessage = {
        content: newMessage.trim(),
        sender,
        timestamp: new Date().toISOString()
      };
      // Add to the start for newest first in UI, but we'll reverse when sending to API
      setConversationHistory(prev => [newConversationMessage, ...prev]);
      setNewMessage('');
      setIsAdding(false);
    }
  };

  const handleRemoveMessage = (index: number) => {
    setConversationHistory(prev => prev.filter((_, i) => i !== index));
  };

  if (conversationHistory.length === 0 && !isAdding) {
    return (
      <div className="text-center">
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-indigo-300 hover:text-indigo-500 flex items-center justify-center space-x-2 transition-all"
        >
          <Plus size={18} />
          <span>Add Conversation Context</span>
        </button>
        <p className="mt-2 text-xs text-gray-500">Start by adding messages exchanged before the one you want to reply to</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isAdding && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center mb-2 space-x-2">
            <button 
              onClick={() => setSender('other')}
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                sender === 'other' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <UserRound size={14} className="mr-1" />
              Other Person
            </button>
            <button 
              onClick={() => setSender('user')}
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                sender === 'user' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <User size={14} className="mr-1" />
              Me
            </button>
          </div>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type previous message content..."
            className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            rows={2}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMessage}
              disabled={!newMessage.trim()}
              className={`px-3 py-1 text-xs rounded-md ${
                !newMessage.trim() 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {conversationHistory.length > 0 && (
        <div className="space-y-2">
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="mb-2 py-1 px-3 rounded-md text-xs bg-gray-100 hover:bg-gray-200 flex items-center"
            >
              <Plus size={14} className="mr-1" />
              Add Earlier Message
            </button>
          )}
          
          {conversationHistory.map((msg, index) => (
            <div 
              key={index} 
              className={`p-2 rounded-lg text-sm relative group flex ${
                msg.sender === 'user' 
                  ? 'bg-green-50 border border-green-100' 
                  : 'bg-blue-50 border border-blue-100'
              }`}
            >
              <div className="flex-grow">
                <div className="flex items-center mb-1">
                  <span className={`text-xs font-medium ${
                    msg.sender === 'user' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {msg.sender === 'user' ? 'Me' : 'Other Person'}
                  </span>
                </div>
                <p>{msg.content}</p>
              </div>
              <button
                onClick={() => handleRemoveMessage(index)}
                className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 p-1 rounded-full hover:bg-gray-200"
                title="Remove message"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationHistory;
