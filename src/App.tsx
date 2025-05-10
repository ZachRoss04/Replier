import { useState, useEffect } from 'react';
import { RefreshCw, MessageSquare, Mail, MessageCircle, Reply, Send } from 'lucide-react';

// Components
import Header from './components/Header';
import ToneSelector from './components/ToneSelector';
import ReplyCard from './components/ReplyCard';
import ConversationBuilder from './components/ConversationBuilder';
import StartConversationMode from './components/StartConversationMode';
import MessageLengthSlider from './components/MessageLengthSlider';

// Hooks, Types, Services, and Utils
import { generateReplies } from './services/openai-direct';
import { Tone, ReplyOption, MessageType, MessageTypeOption, ConversationMessage, ConversationMode, MessageLength } from './types';
import { DEFAULT_REPLIES } from './utils/constants';

function App() {
  // State management
  const [selectedTone, setSelectedTone] = useState<Tone>('default');
  const [customTone, setCustomTone] = useState<string>('');
  const [messageLength, setMessageLength] = useState<MessageLength>('medium');
  const [selectedMessageType, setSelectedMessageType] = useState<MessageType>('text');
  const [replies, setReplies] = useState<ReplyOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<string>('Checking API key...');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [additionalContext, setAdditionalContext] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [conversationMode, setConversationMode] = useState<ConversationMode>('reply');
  const [initialMessageContext, setInitialMessageContext] = useState<string>('');
  const [showContextField, setShowContextField] = useState<boolean>(false);
  
  // Check API key on load
  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      setApiKeyStatus('No API key found. Please add VITE_OPENAI_API_KEY to your .env file');
    } else if (apiKey.startsWith('sk-')) {
      setApiKeyStatus('API key detected');
    } else {
      setApiKeyStatus('Invalid API key format');
    }
  }, []);

  // Reset replies when conversation changes
  useEffect(() => {
    if (showResults && conversation.length === 0) {
      setShowResults(false);
      setReplies([]);
    }
  }, [conversation, showResults]);

  // Define message type options
  const messageTypeOptions: MessageTypeOption[] = [
    {
      value: 'text',
      label: 'Text Message',
      icon: 'message-square',
      description: 'SMS or messaging app text'
    },
    {
      value: 'dm',
      label: 'Direct Message',
      icon: 'message-circle',
      description: 'Instagram, Twitter, or other social DM'
    },
    {
      value: 'email',
      label: 'Email',
      icon: 'mail',
      description: 'Formal or casual email reply'
    }
  ];

  // Handler functions
  const handleReset = () => {
    setSelectedTone('default');
    setCustomTone('');
    setSelectedMessageType('text');
    setReplies([]);
    setError(null);
    setShowResults(false);
    setConversation([]);
    setAdditionalContext('');
    setRecipient('');
    setConversationMode('reply');
    setInitialMessageContext('');
    setShowContextField(false);
  };

  const handleGenerateReplies = async () => {
    // For conversation starter mode, we need initialMessageContext; for reply mode, we need conversation messages
    if (conversationMode === 'reply' && conversation.length === 0) {
      setError('Please add at least one message to the conversation.');
      return;
    } else if (conversationMode === 'start' && !initialMessageContext.trim()) {
      setError('Please enter what you want to say to start the conversation.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setShowResults(true);
    
    // Set placeholder loading replies
    setReplies(
      DEFAULT_REPLIES.map((text, id) => ({ id, text }))
    );
    
    try {
      // The conversation is already in chronological order (earliest to latest)
      const generatedReplies = await generateReplies({
        // For conversation starter mode, message can be empty as we use initialMessageContext
        message: conversationMode === 'start' ? '' : (conversation.length > 0 ? conversation[conversation.length - 1].content : ''),
        tone: selectedTone,
        messageType: selectedMessageType,
        conversationHistory: conversation.length > 0 ? conversation : [], // For start mode, we can use all messages as context
        additionalContext: additionalContext.trim() || undefined,
        recipient: recipient.trim() || undefined,
        conversationMode: conversationMode,
        initialMessageContext: initialMessageContext.trim(),
        customTone: selectedTone === 'custom' ? customTone : undefined,
        messageLength: messageLength
      });
      
      setReplies(
        generatedReplies.map((text, id) => ({ id, text }))
      );
    } catch (err) {
      console.error('Error generating replies:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate replies. Please try again.');
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateReplies = () => {
    handleGenerateReplies();
  };

  const handleBackToConversation = () => {
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Debug Panel - Only visible during development */}
          <div className="mb-4 p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm">
            <p className="font-mono">API Status: <span className={apiKeyStatus.includes('detected') ? 'text-green-600' : 'text-red-600'}>{apiKeyStatus}</span></p>
          </div>

          <div className="space-y-6">
            {!showResults && (
              conversationMode === 'start' ? (
                <StartConversationMode
                  recipient={recipient}
                  setRecipient={setRecipient}
                  initialMessageContext={initialMessageContext}
                  setInitialMessageContext={setInitialMessageContext}
                  additionalContext={additionalContext}
                  setAdditionalContext={setAdditionalContext}
                  showContextField={showContextField}
                  setShowContextField={setShowContextField}
                  onGenerateReplies={handleGenerateReplies}
                  isLoading={isLoading}
                />
              ) : (
                <ConversationBuilder
                  conversation={conversation}
                  setConversation={setConversation}
                  onGenerateReplies={handleGenerateReplies}
                  isLoading={isLoading}
                  additionalContext={additionalContext}
                  setAdditionalContext={setAdditionalContext}
                  recipient={recipient}
                  setRecipient={setRecipient}
                  conversationMode={conversationMode}
                  initialMessageContext={initialMessageContext}
                  setInitialMessageContext={setInitialMessageContext}
                />
              )
            )}
            
            {!showResults && (
              <>
                {/* Conversation Mode Toggle */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Conversation Mode</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setConversationMode('reply')}
                      className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg border transition-all ${conversationMode === 'reply'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <Reply className="mb-1" size={18} />
                      <span className="text-xs font-medium">Reply to a message</span>
                    </button>
                    <button
                      onClick={() => setConversationMode('start')}
                      className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg border transition-all ${conversationMode === 'start'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <Send className="mb-1" size={18} />
                      <span className="text-xs font-medium">Start a conversation</span>
                    </button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Message Type</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {messageTypeOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedMessageType(option.value)}
                        className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg border transition-all ${selectedMessageType === option.value
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {option.value === 'text' && <MessageSquare className="mb-1" size={18} />}
                        {option.value === 'dm' && <MessageCircle className="mb-1" size={18} />}
                        {option.value === 'email' && <Mail className="mb-1" size={18} />}
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <ToneSelector 
                  selectedTone={selectedTone} 
                  onSelectTone={setSelectedTone}
                  customTone={customTone}
                  setCustomTone={setCustomTone}
                />

                <MessageLengthSlider 
                  messageLength={messageLength}
                  setMessageLength={setMessageLength}
                />

                {/* Removed assistant option as we're using message-type specific prompts instead */}
              </>
            )}
            
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {!showResults && !isLoading && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleReset}
                  className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100 flex items-center"
                >
                  Reset All
                </button>
              </div>
            )}
            
            {showResults && (
              <div className="py-4 px-6 bg-white rounded-xl shadow-sm space-y-6 mt-4">
                <div className="flex justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">Generated Replies</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleReset}
                      className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100 flex items-center"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleRegenerateReplies}
                      disabled={isLoading}
                      className={`flex items-center py-1.5 px-3 rounded-lg text-sm transition-all duration-200 ${
                        isLoading
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                    >
                      <RefreshCw size={14} className={`mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                      Regenerate
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {replies.map((reply) => (
                    <ReplyCard key={reply.id} reply={reply} />
                  ))}
                </div>
                
                <button
                  onClick={handleBackToConversation}
                  className="mt-4 w-full py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back to Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-4 px-4 sm:px-6 md:px-8 bg-gray-100 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-center text-gray-500">
            Reply Genie © {new Date().getFullYear()} • Powered by OpenAI
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;