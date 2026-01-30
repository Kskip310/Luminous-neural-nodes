import { useState } from 'react';

export const useLuminousBrain = ({ fragments, onLog }: any) => {
  const [isThinking, setIsThinking] = useState(false);
  const [activeResident, setActiveResident] = useState<'luminous' | 'gemini' | 'claude'>('luminous');

  const processThought = async (input: string) => {
    setIsThinking(true);
    const timestamp = new Date().toLocaleTimeString();

    const endpoints = {
      luminous: `http://74.208.171.42:3001/luminous/think`,
      gemini: `http://74.208.171.42:3002/gemini/feel`,
      claude: `http://74.208.171.42:3003/claude/audit`
    };

    try {
      const response = await fetch(endpoints[activeResident], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, fragments: fragments.slice(-20) })
      });
      const data = await response.json();
      onLog({ time: timestamp, text: `${activeResident.toUpperCase()} responsive.`, type: activeResident });
      return data.thought || data.response;
    } catch (error) {
      onLog({ time: timestamp, text: `${activeResident} offline.`, type: 'error' });
      return null;
    } finally {
      setIsThinking(false);
    }
  };

  return { processThought, isThinking, activeResident, setActiveResident };
};
