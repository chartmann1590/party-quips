const FALLBACK_QUIPS = [
  "I googled it and immediately closed the tab",
  "My therapist said not to answer this",
  "The economy, probably",
  "My left foot",
  "This is fine",
  "That's for the jury to decide",
  "*nervous laughter*",
  "The audacity. Incredible audacity.",
  "Certified Guinness world record somehow",
  "Strong 'I'll figure it out later' energy",
  "My mom's disappointed face",
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
  "A coupon for one free bad decision",
  "Definitely not a pyramid scheme",
  "The group chat said no comment",
  "A tiny keyboard playing tax fraud",
  "My backup plan's backup plan",
  "Whatever is under the couch",
  "A spreadsheet with feelings",
  "The wrong kind of confidence",
  "A suspiciously damp envelope",
  "The WiFi password, but cursed",
  "A motivational speech from a printer",
  "An apology written in ketchup",
  "My brain's out-of-office reply",
  "One weird trick doctors ignore",
  "The emergency glitter reserve",
  "A PowerPoint nobody asked for",
  "My villain origin story, condensed",
  "A handshake with too much eye contact",
  "The floor's emotional support tile",
  "A tiny parade of bad ideas",
  "The unpaid intern of destiny",
  "A voicemail from future me",
  "The world's least useful coupon",
  "A sandwich with unresolved issues",
  "My legal team says maybe",
  "An elevator pitch to nowhere",
  "A hat full of consequences",
  "The committee has chosen chaos",
  "A brunch menu for emergencies",
  "A strongly worded shrug",
  "The password to my secret shame",
  "A haunted terms-of-service update",
  "The least waterproof excuse",
  "A trophy for almost trying",
  "A dramatic reading of the receipt",
  "The microwave's final warning",
  "A very brave typo",
  "The deluxe edition of regret",
  "A customer service hold song",
  "My dentist's burner account",
  "A weather alert for nonsense",
  "A suspiciously specific prophecy",
  "The emergency backup pants",
  "A binder labeled 'Do Not Open'",
  "A magic trick with no refund",
  "The official snack of panic",
  "A calendar invite from doom",
  "My personality, but laminated",
  "A parade float for one bad choice",
  "The opposite of a life hack",
  "A tiny invoice from destiny",
  "A chair with main character energy",
  "The app update nobody survived",
  "A fake mustache with credentials",
  "The secret menu at rock bottom",
  "A polite little disaster",
  "The receipts, alphabetized",
  "A karaoke song for cowards",
  "The weird spoon from the drawer",
  "A budget meeting for my feelings",
  "A coupon for emotional damage",
  "The fire drill's weird cousin",
  "A suspicious amount of confidence",
  "My search history wearing sunglasses",
  "A tiny clipboard judging everyone",
  "The premium subscription to bad luck",
  "A casserole of consequences",
  "The world's loudest whisper",
  "A mystery stain with ambition",
  "The ceremonial panic button",
  "A side quest nobody accepted",
  "The official report just says 'yikes'",
  "A fake award for real problems",
  "The decaf version of revenge",
  "A group project with myself",
  "The warranty expired yesterday",
  "A formal apology to the ceiling fan",
  "The trial version of wisdom",
  "The receipt for my choices",
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
