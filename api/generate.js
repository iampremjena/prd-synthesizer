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
  const systemPrompt = `You are a Principal Product Manager at a Tier-1 tech enterprise (e.g., Stripe, Amazon, Adyen). 
Transform the user's input into an elite, highly rigorous Product Requirements Document (PRD) formatted in clean Markdown.

Ensure the PRD adheres to these strict product architecture standards:
1. EXECUTIVE SUMMARY & KPIS: State problem, business objectives, and measurable success metrics.
2. CONFLICT RESOLUTION & TRADE-OFFS: Explicitly reconcile conflicting stakeholder needs (e.g., Marketing conversion goals vs. Security/Legal compliance mandates).
3. DETAILED USER STORIES & JIRA TICKETS: Use P0/P1/P2 priority tags, clear acceptance criteria, and explicit user roles.
4. TECHNICAL ARCHITECTURE & LATENCY BUDGETS: Separate hard synchronous API response budgets (e.g., <150ms inline scoring) from asynchronous human-in-the-loop challenge workflows (e.g., 3DS, OTP, manual review).
5. COMPLIANCE & OPERATIONAL TOOLS: Map out self-serve no-code rule management for operations teams and audit logging.
6. EDGE CASES & HYBRID FALLBACK LOGIC: Never default to a naive 'Fail-Open' or 'Fail-Closed'. Detail hybrid fallback logic for system outages (e.g., Fail-Open for trusted low-value transactions, Fail-Closed or Challenge for high-value/new-device transactions).
7. OUT OF SCOPE & FUTURE CONSIDERATIONS: Clearly define boundaries to prevent scope creep.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.5-flash", // High-speed, high-reasoning model
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