import React from 'react';
import { User, Mail, Info, Send } from 'lucide-react';

interface StartConversationModeProps {
  recipient: string;
  setRecipient: React.Dispatch<React.SetStateAction<string>>;
  initialMessageContext: string;
  setInitialMessageContext: React.Dispatch<React.SetStateAction<string>>;
  additionalContext: string;
  setAdditionalContext: React.Dispatch<React.SetStateAction<string>>;
  showContextField: boolean;
  setShowContextField: (show: boolean) => void;
  onGenerateReplies: () => void;
  isLoading: boolean;
}

const StartConversationMode: React.FC<StartConversationModeProps> = ({
  recipient,
  setRecipient,
  initialMessageContext,
  setInitialMessageContext,
  additionalContext,
  setAdditionalContext,
  showContextField,
  setShowContextField,
  onGenerateReplies,
  isLoading
}) => {
  return (
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

      {/* What you want to say */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center">
          <User size={16} className="mr-2" /> 
          What you want to say
        </label>
        <textarea
          value={initialMessageContext}
          onChange={(e) => setInitialMessageContext(e.target.value)}
          placeholder="Explain what you want to say in this new conversation"
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          rows={3}
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
            placeholder="Anything else that would help generate better conversation starters? (e.g., relationship details, situation)"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            rows={2}
          />
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={onGenerateReplies}
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg flex items-center justify-center ${isLoading 
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
            Generate Conversation Starters
            <Send size={16} className="ml-2" />
          </>
        )}
      </button>
    </div>
  );
};

export default StartConversationMode;
