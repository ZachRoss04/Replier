import React, { useState } from 'react';
import { Tone } from '../types';
import { TONE_OPTIONS } from '../utils/constants';

interface ToneSelectorProps {
  selectedTone: Tone;
  onSelectTone: (tone: Tone) => void;
  customTone?: string;
  setCustomTone?: (tone: string) => void;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({ 
  selectedTone, 
  onSelectTone, 
  customTone = '', 
  setCustomTone = () => {} 
}) => {
  const [isPremium] = useState(true); // Premium features are now enabled
  
  // Custom tone input handling
  const handleCustomToneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTone(e.target.value);
  };

  // Premium feature notice
  const showPremiumNotice = selectedTone === 'custom' && !isPremium;
  
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Choose a tone for your reply
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TONE_OPTIONS.map((tone) => (
          <button
            key={tone.value}
            onClick={() => onSelectTone(tone.value)}
            className={`flex items-center justify-start p-3 rounded-lg transition-all duration-200 border ${
              selectedTone === tone.value
                ? `${tone.color} border-2 border-indigo-500 shadow-md`
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <span className="text-2xl mr-2">{tone.emoji}</span>
            <div className="text-left">
              <p className="font-medium">{tone.label}</p>
              <p className="text-xs text-gray-500">{tone.description}</p>
            </div>
          </button>
        ))}
      </div>
      
      {/* Custom tone input field */}
      {selectedTone === 'custom' && (
        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Enter your custom tone
          </label>
          <input
            type="text"
            value={customTone}
            onChange={handleCustomToneChange}
            placeholder={showPremiumNotice ? "Upgrade to Premium to access this feature" : "e.g., 'Enthusiastic but diplomatic'"}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            disabled={showPremiumNotice}
          />
          
          {showPremiumNotice && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-xs text-amber-800 flex items-center">
                <span className="mr-1">✨</span>
                This is a Premium feature. Coming soon!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToneSelector;