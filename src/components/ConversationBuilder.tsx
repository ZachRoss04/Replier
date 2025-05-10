import React, { useState, useRef } from 'react';
import { Plus, X, User, UserRound, Send, Info, Mail, Image, Clipboard } from 'lucide-react';
import { ConversationMessage, MessageSender, ConversationMode } from '../types';

interface ConversationBuilderProps {
  conversation: ConversationMessage[];
  setConversation: React.Dispatch<React.SetStateAction<ConversationMessage[]>>;
  onGenerateReplies: () => void;
  isLoading: boolean;
  additionalContext: string;
  setAdditionalContext: React.Dispatch<React.SetStateAction<string>>;
  recipient: string;
  setRecipient: React.Dispatch<React.SetStateAction<string>>;
  conversationMode: ConversationMode;
  initialMessageContext: string;
  setInitialMessageContext: React.Dispatch<React.SetStateAction<string>>;
}

const ConversationBuilder: React.FC<ConversationBuilderProps> = ({
  conversation,
  setConversation,
  onGenerateReplies,
  isLoading,
  additionalContext,
  setAdditionalContext,
  recipient,
  setRecipient
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [sender, setSender] = useState<MessageSender>('other');
  const [isAddingMessage, setIsAddingMessage] = useState(conversation.length === 0);
  const [showContextField, setShowContextField] = useState(!!additionalContext);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagePasteRef = useRef<HTMLDivElement>(null);

  // Check if we have necessary content to generate replies
  const canGenerateReplies = conversation.length > 0;

  const handleAddMessage = () => {
    if (newMessage.trim()) {
      const newConversationMessage: ConversationMessage = {
        content: newMessage.trim(),
        sender,
        timestamp: new Date().toISOString()
      };
      
      // Add message to the end of the conversation (chronological order)
      setConversation(prev => [...prev, newConversationMessage]);
      setNewMessage('');
      setIsAddingMessage(false);
      
      // Reset the image if one was uploaded
      setImage(null);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsProcessingImage(true);
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string);
          // In a real app, we would use OCR service here
          // For demo, we'll simulate OCR processing with a timeout
          setTimeout(() => {
            setIsProcessingImage(false);
            // Pretend we extracted some text
            setNewMessage("[Message extracted from image: Replace this with actual message text from the image]");
          }, 1500);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePasteImage = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        setIsProcessingImage(true);
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              setImage(e.target.result as string);
              // In a real app, we would use OCR service here
              // For demo, we'll simulate OCR processing with a timeout
              setTimeout(() => {
                setIsProcessingImage(false);
                // Pretend we extracted some text
                setNewMessage("[Message extracted from image: Replace this with actual message text from the image]");
              }, 1500);
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveMessage = (index: number) => {
    setConversation(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 mb-4">
      <div className="space-y-6">
        {/* Recipient field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <Mail size={16} className="mr-2" /> 
            Recipient
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Who are you messaging? (e.g., friend, mom, boss)"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        
        {/* Toggle for showing additional context */}
        <div className="flex items-center">
          <button 
            onClick={() => setShowContextField(!showContextField)}
            className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            <Info size={16} className="mr-1" />
            {showContextField ? 'Hide additional context' : 'Add additional context'}
          </button>
        </div>
        
        {/* Additional context field */}
        {showContextField && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Additional Context</label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Anything else that would help generate better replies? (e.g., emotional state, desired tone)"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
              rows={2}
            />
          </div>
        )}
      </div>
      
      {/* Display messages */}
      {conversation.length > 0 && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 flex items-center">
            <Mail size={16} className="mr-2" />
            Conversation
          </h3>
          <div className="space-y-3">
            {conversation.map((msg, index) => (
              <div key={index} className="flex group">
                <div 
                  className={`flex-1 p-3 rounded-lg relative ${msg.sender === 'user' 
                    ? 'bg-blue-100 ml-8 rounded-bl-none' 
                    : 'bg-gray-200 mr-8 rounded-br-none'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-xs text-gray-600">
                      {msg.sender === 'user' ? 'You' : 'Other Person'}
                    </span>
                    <button 
                      onClick={() => handleRemoveMessage(index)}
                      className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add message UI */}
      {isAddingMessage ? (
        <div className="p-4 border border-gray-300 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Add Message</h3>
            <div className="flex space-x-3">
              <button 
                onClick={() => setSender('other')}
                className={`px-3 py-1 text-xs rounded-md flex items-center ${
                  sender === 'other' 
                    ? 'bg-gray-200 text-gray-800' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <UserRound size={14} className="mr-1" />
                Other Person
              </button>
              <button 
                onClick={() => setSender('user')}
                className={`px-3 py-1 text-xs rounded-md flex items-center ${
                  sender === 'user' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User size={14} className="mr-1" />
                You
              </button>
            </div>
          </div>
          
          <div className="relative">
            {image && (
              <div className="relative mb-2">
                <img src={image} alt="Uploaded" className="max-h-48 rounded border" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            <div 
              ref={imagePasteRef}
              onPaste={handlePasteImage}
              className={`relative ${isProcessingImage ? 'opacity-50' : ''}`}
            >
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Type the ${sender === 'user' ? 'your' : 'other person\'s'} message here...`}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm pr-10"
                rows={3}
                disabled={isProcessingImage}
              />
              <button 
                onClick={triggerFileInput}
                className="absolute right-2 bottom-2 text-gray-500 hover:text-indigo-600"
                disabled={isProcessingImage}
                title="Upload image"
              >
                <Image size={16} />
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500 italic">
              <Clipboard size={12} className="inline mr-1" /> 
              You can paste images directly
            </div>
            <div className="flex space-x-2">
              {conversation.length > 0 && (
                <button
                  onClick={() => setIsAddingMessage(false)}
                  className="px-3 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleAddMessage}
                disabled={!newMessage.trim()}
                className={`px-3 py-1 text-xs rounded-md flex items-center ${
                  !newMessage.trim() 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                }`}
              >
                Add to Conversation
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {conversation.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Start Building Your Conversation</h3>
              <p className="text-sm text-gray-600 mb-4">Add messages in chronological order (earliest to latest)</p>
              <button
                onClick={() => setIsAddingMessage(true)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center mx-auto"
              >
                <Plus size={18} className="mr-2" />
                Start Conversation
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsAddingMessage(true)}
                className="flex-1 py-3 px-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-indigo-300 hover:text-indigo-500 flex items-center justify-center transition-all"
              >
                <Plus size={16} className="mr-2" />
                Add Next Message
              </button>
              
              <button
                onClick={onGenerateReplies}
                disabled={!canGenerateReplies}
                className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center ${
                  !canGenerateReplies
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
                    Generating...
                  </div>
                ) : (
                  <>
                    Generate Replies
                    <Send size={16} className="ml-2" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationBuilder;
