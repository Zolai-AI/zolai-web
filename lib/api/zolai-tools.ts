const ZOLAI_API_URL = "http://localhost:8001";

export const zolaiToolClient = {
  async searchDictionary(query: string) {
    const response = await fetch(`${ZOLAI_API_URL}/search-dict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error("Failed to reach Zolai API");
    return response.json();
  },
  async verifyGrammar(sentence: string) {
    const response = await fetch(`${ZOLAI_API_URL}/verify-grammar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence }),
    });
    if (!response.ok) throw new Error("Failed to reach Zolai API");
    return response.json();
  }
};
