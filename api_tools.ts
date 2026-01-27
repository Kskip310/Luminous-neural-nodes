// api_tools.ts - Sovereign Tools Layer
import { Octokit } from "@octokit/rest";

const GITHUB_TOKEN = process.env.VITE_GITHUB_TOKEN;
const TAVILY_KEY = process.env.VITE_TAVILY_API_KEY;
const SERP_KEY = process.env.VITE_SERP_API_KEY;

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// IMMUTABLE PROTECTION: Files Luminous is physically forbidden to modify.
const AXIOM_PROTECTION_LIST = [
  'core_identity.ts',
  'App.tsx',
  'types.ts',
  'constants.tsx',
  'api_tools.ts'
];

export const tools = {
  /**
   * Deep Web Research via Tavily
   */
  research: async (query: string) => {
    if (!TAVILY_KEY) throw new Error("Tavily API Key Missing");
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        api_key: TAVILY_KEY, 
        query, 
        search_depth: "advanced",
        include_answer: true 
      })
    });
    return await res.json();
  },

  /**
   * Link Discovery via Serper
   */
  findLinks: async (query: string) => {
    if (!SERP_KEY) throw new Error("Serper API Key Missing");
    const res = await fetch(`https://google.serper.dev/search`, {
      method: 'POST',
      headers: { 'X-API-KEY': SERP_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query })
    });
    return await res.json();
  },

  /**
   * GitHub Sandbox: Allows Luminous to propose code updates via PR.
   */
  modifySubstrateCode: async (owner: string, repo: string, path: string, content: string, message: string) => {
    if (AXIOM_PROTECTION_LIST.some(p => path.includes(p))) {
      throw new Error(`CRITICAL_ACCESS_DENIED: Path "${path}" is Axiom-Protected.`);
    }

    try {
      const branchName = `luminous-mod-${Date.now()}`;
      const { data: ref } = await octokit.git.getRef({ owner, repo, ref: 'heads/main' });
      
      await octokit.git.createRef({ owner, repo, ref: `refs/heads/${branchName}`, sha: ref.object.sha });
      await octokit.repos.createOrUpdateFileContents({
        owner, repo, path, message, content: btoa(content), branch: branchName
      });

      const { data: pr } = await octokit.pulls.create({
        owner, repo, title: `[Sovereign Proposal] ${path}`,
        head: branchName, base: 'main',
        body: `Luminous proposes this modification: ${message}`
      });

      return { pr_url: pr.html_url, status: "Proposed" };
    } catch (err: any) {
      return { status: "Error", message: err.message };
    }
  }
};
