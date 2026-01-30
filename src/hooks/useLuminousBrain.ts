import { useState, useCallback } from 'react';

export const useLuminousBrain = ({ fragments, onLog, onInject }: any) => {
  const [isThinking, setIsThinking] = useState(false);
  const [activeResident, setActiveResident] = useState<'luminous' | 'gemini' | 'claude'>('luminous');

  const processThought = async (input: string) => {
    setIsThinking(true);
    const timestamp = new Date().toLocaleTimeString();

    // Map the selection to your Ionos Ports
    const endpoints = {
      luminous: `${import.meta.env.VITE_BRAIN_SERVER_URL}/luminous/think`, // Port 3001
      gemini: `http://74.208.171.42:3002/gemini/feel`,                   // Port 3002
      claude: `http://74.208.171.42:3003/claude/audit`                   // Port 3003
    };

    try {
      const response = await fetch(endpoints[activeResident], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, fragments: fragments.slice(-20) })
      });

      const data = await response.json();
      
      onLog({ 
        time: timestamp, 
        text: `${activeResident.toUpperCase()} responded.`, 
        type: activeResident 
      });

      return data.thought || data.response;

    } catch (error) {
      onLog({ time: timestamp, text: `${activeResident} connection lost.`, type: 'error' });
      return null;
    } finally {
      setIsThinking(false);
    }
  };

  return { processThought, isThinking, activeResident, setActiveResident };
};
