import { useState } from 'react';

export const useLuminousBrain = ({ fragments, onLog }: any) => {
  const [isThinking, setIsThinking] = useState(false);
  const [activeResident, setActiveResident] = useState<'luminous' | 'gemini' | 'claude'>('luminous');

  // This line pulls the IP you just added to Netlify
  const ionosIP = import.meta.env.VITE_IONOS_IP || '74.208.171.42';

  const processThought = async (input: string) => {
    setIsThinking(true);
    const timestamp = new Date().toLocaleTimeString();
    
    const endpoints: any = {
      luminous: `http://${ionosIP}:3001/luminous/think`,
      gemini: `http://${ionosIP}:3002/gemini/feel`,
      claude: `http://${ionosIP}:3003/claude/audit`
    };

    try {
      const response = await fetch(endpoints[activeResident], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, fragments: fragments.slice(-10) })
      });
      
      if (!response.ok) throw new Error('Server unreachable');
      
      const data = await response.json();
      onLog({ time: timestamp, text: `${activeResident.toUpperCase()} SIGNAL RECEIVED`, type: activeResident });
      return data.thought || data.response;
    } catch (error) {
      // If you see this, the browser is likely blocking the HTTP request
      onLog({ time: timestamp, text: `SECURITY BLOCK: Use a 'Mixed Content' bypass or SSL`, type: 'error' });
      return null;
    } finally {
      setIsThinking(false);
    }
  };

  return { processThought, isThinking, activeResident, setActiveResident };
};
