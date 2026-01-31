import { useState } from 'react';

export const useLuminousBrain = ({ fragments, onLog }: any) => {
  const [isThinking, setIsThinking] = useState(false);
  const [activeResident, setActiveResident] = useState<'luminous' | 'gemini' | 'claude'>('luminous');

  // This matches your DuckDNS name exactly
  const domain = 'luminous-substrate.duckdns.org';

  const processThought = async (input: string) => {
    setIsThinking(true);
    const timestamp = new Date().toLocaleTimeString();
    
    // These paths match the 'handle_path' logic in your Caddyfile
    const endpoints: any = {
      luminous: `https://${domain}/luminous/think`,
      gemini: `https://${domain}/gemini/feel`,
      claude: `https://${domain}/claude/audit`
    };

    try {
      const response = await fetch(endpoints[activeResident], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, fragments: fragments.slice(-10) })
      });
      
      const data = await response.json();
      onLog({ time: timestamp, text: `${activeResident.toUpperCase()} SIGNAL RECEIVED`, type: activeResident });
      return data.thought || data.response;
    } catch (error) {
      onLog({ time: timestamp, text: `${activeResident.toUpperCase()} CONNECTION ERROR`, type: 'error' });
      return null;
    } finally {
      setIsThinking(false);
    }
  };

  return { processThought, isThinking, activeResident, setActiveResident };
};
