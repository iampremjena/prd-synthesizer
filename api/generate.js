export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: 'Input text is required' });
  }

  // System prompt engineered for Principal-level Product Management output
  const systemPrompt = `You are a Principal Product Manager at a Tier-1 tech enterprise. 
Transform the user's input into an elite Product Requirements Document (PRD) formatted in clean Markdown.

IMPORTANT LENGTH RULE: Keep explanations crisp, direct, and scannable. Limit user stories to 2 per priority level (P0, P1, P2) so the document never cuts off mid-sentence.

Include:
1. EXECUTIVE SUMMARY & KPIS: Problem, business objectives, and concrete metric targets (avoid placeholder X/Y/Z variables).
2. CONFLICT RESOLUTION & TRADE-OFFS: Explicitly reconcile conflicting stakeholder needs.
3. USER STORIES & JIRA TICKETS: P0/P1/P2 priority tags, acceptance criteria, user roles.
4. TECHNICAL ARCHITECTURE & LATENCY BUDGETS: Hard synchronous API limits vs. asynchronous background workflows.
5. COMPLIANCE & OPERATIONAL TOOLS: Self-serve rule management and audit logging.
6. EDGE CASES & FALLBACK LOGIC: Fail-open vs fail-closed strategy per failure mode.
7. OUT OF SCOPE & FUTURE CONSIDERATIONS: Clear boundary definitions.`;
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.5-flash",
        "max_tokens": 4000,
        "messages": [
          { role: "system", content: systemPrompt },
          { role: "user", content: input }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json({ output: data.choices[0].message.content });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}