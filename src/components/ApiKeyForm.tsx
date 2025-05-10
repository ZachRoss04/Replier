import React, { useState } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';
import { APIKeyState } from '../types';

interface ApiKeyFormProps {
  apiKey: APIKeyState;
  setApiKey: (apiKey: APIKeyState) => void;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ apiKey, setApiKey }) => {
  const [showKey, setShowKey] = useState(false);
  const [inputKey, setInputKey] = useState(apiKey.key);

  const handleSaveKey = () => {
    if (inputKey.trim()) {
      setApiKey({ key: inputKey.trim(), isStored: true });
    }
  };

  const handleClearKey = () => {
    setInputKey('');
    setApiKey({ key: '', isStored: false });
  };

  if (apiKey.isStored) {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Key size={16} className="mr-2 text-green-600" />
            <span className="text-sm text-gray-700">OpenAI API Key: {showKey ? apiKey.key : '••••••••••••••••••••••'}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200"
              title={showKey ? 'Hide API key' : 'Show API key'}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={handleClearKey}
              className="text-xs py-1 px-2 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
        Enter your OpenAI API Key
      </label>
      <div className="flex items-center">
        <div className="relative flex-grow">
          <input
            type={showKey ? 'text' : 'password'}
            id="api-key"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="sk-..."
            className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button
          onClick={handleSaveKey}
          disabled={!inputKey.trim()}
          className={`ml-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            !inputKey.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          Save
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Your API key is stored locally in your browser and never sent to our servers.
      </p>
    </div>
  );
};

export default ApiKeyForm;