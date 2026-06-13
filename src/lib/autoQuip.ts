const FALLBACK_QUIPS = [
  "I googled it and immediately closed the tab",
  "My therapist said not to answer this",
  "The economy, probably",
  "My left foot",
  "This is fine 🔥",
  "Three raccoons in a trench coat",
  "That's for the jury to decide",
  "*nervous laughter*",
  "The audacity. Incredible audacity.",
  "Certified Guinness world record somehow",
  "Strong 'I'll figure it out later' energy",
  "My mom's disappointed face",
  "A very confused golden retriever",
  "I'm legally not allowed to say",
  "Technically yes, morally absolutely not",
  "Did someone say chaotic neutral?",
  "[buffering]",
  "Same thing I use for everything: vibes",
  "The ghost of bad decisions past",
  "Plot twist: nobody knows",
  "Existential dread, but make it fun",
  "NASA scientists are still baffled",
  "A very long email chain about nothing",
  "Whoever smelt it dealt it",
  "Unironically my entire personality",
]

function pickFallbackQuip(): string {
  return FALLBACK_QUIPS[Math.floor(Math.random() * FALLBACK_QUIPS.length)]
}

export async function generateAutoQuip(promptText: string): Promise<string> {
  const token = import.meta.env.VITE_GITHUB_API_TOKEN
  if (!token) return pickFallbackQuip()

  try {
    const res = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a comedic writer for a party game like Quiplash. Write ONE short, funny, absurdist response to the prompt. Max 80 characters. Be creative, unexpected, and weird. No quotes around your answer. Just the answer text, nothing else.',
          },
          { role: 'user', content: promptText },
        ],
        max_tokens: 60,
        temperature: 1.2,
      }),
    })

    if (!res.ok) return pickFallbackQuip()
    const data = await res.json()
    const text: string = data.choices?.[0]?.message?.content?.trim()
    return text || pickFallbackQuip()
  } catch {
    return pickFallbackQuip()
  }
}
