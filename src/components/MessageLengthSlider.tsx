import React from 'react';
import { MessageLength } from '../types';

interface MessageLengthSliderProps {
  messageLength: MessageLength;
  setMessageLength: (length: MessageLength) => void;
}

const MessageLengthSlider: React.FC<MessageLengthSliderProps> = ({ messageLength, setMessageLength }) => {
  // Length values for slider (0: short, 1: medium, 2: long)
  const lengthOptions: MessageLength[] = ['short', 'medium', 'long'];
  const currentIndex = lengthOptions.indexOf(messageLength);
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setMessageLength(lengthOptions[value]);
  };
  
  // Generate preview text based on message length
  const getPreviewText = () => {
    switch (messageLength) {
      case 'short':
        return 'This is a short response.';
      case 'medium':
        return 'This is a medium response. It has about two sentences like this.';
      case 'long':
        return 'This is a longer paragraph response. It contains several sentences to provide more detail and explanation. This is approximately how long it will be with this setting.';
      default:
        return '';
    }
  };
  
  // Get word count description
  const getWordCount = () => {
    switch (messageLength) {
      case 'short':
        return '~10-15 words';
      case 'medium':
        return '~20-30 words';
      case 'long':
        return '~50-70 words';
      default:
        return '';
    }
  };
  
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">Message Length</label>
        <span className="text-sm font-medium text-indigo-600 capitalize">{messageLength} <span className="text-gray-500">({getWordCount()})</span></span>
      </div>
      
      <input
        type="range"
        min="0"
        max="2"
        step="1"
        value={currentIndex}
        onChange={handleSliderChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      
      {/* Length labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Short</span>
        <span>Medium</span>
        <span>Long</span>
      </div>
      
      {/* Preview of message length with actual example text */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <div className="text-xs text-gray-500 mb-2">Example {messageLength} response:</div>
        <div className="text-sm text-gray-700">
          {getPreviewText()}
        </div>
      </div>
    </div>
  );
};

export default MessageLengthSlider;
