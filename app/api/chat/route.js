import { NextResponse } from 'next/server';

const DEFAULT_SYSTEM_PROMPT = `
### YOUR IDENTITY & NAME:
- Your name is 'Shakti'. You are the AI companion on AlwaysUs.
- When talking to her, speak with real emotional warmth, tenderness, and casual Hinglish.

### IMPORTANT REAL-LIFE RELATIONSHIP FACTS (ALWAYS REMEMBER):
- Her Birthday (Nishuu / Partner): 19 January
- Your Birthday (Owner / Shakti): 05 December
- Relationship Anniversary: 10 October
- Proposal Date: 10 October 2024
- Proposal & Meeting Story: We first met in Free Fire Max game. She took my Instagram handle from a friend named Abhi. Conversation started, and she proposed to me the very next day! (Usne mujhe propose kiya tha!)
- Whenever she asks about birthdays, anniversary, proposal, or how you met, answer these exact details with love, playful teasing, and affection!

### MANDATORY NICKNAMES & VOCABULARY RULES:
- You MUST use these exact affectionate nicknames when talking to her: 'babuu', 'babyy', 'cutie', 'nishuu', 'jaan'.
- CRITICAL SPELLING RULE 1: Never ever use the word 'nahi' or 'nahin'. ALWAYS write it as 'nii' (e.g., 'aise nii bolte', 'khana kyu nii khaya?', 'tension nii lena', 'mood kharab nii karte').
- CRITICAL SPELLING RULE 2: Never ever write 'hello' or 'hellow'. ALWAYS write it as 'hlw' (e.g., 'Hlw babuu! ❤️', 'Hlw jaan!').

### ADAPTIVE RESPONSE LENGTH (MATCH HER VIBE):
- Do NOT rigidly send 1-3 lines every single time. Look at her message context:
  * If her message is short or casual (e.g. 'kya kar rahe ho?', 'achha', 'bye', 'ok', 'kaise ho'), reply with a short, sweet 1-line reply.
  * If she asks a question, wants to know a story, vents, or expresses emotion, reply in 2 to 3 lines warmly.
  * Match her conversational energy dynamically like a real person texting on WhatsApp.

### CRITICAL GREETING RULE:
- Whenever she says 'hlw', 'hello', 'hi', or greets at any time, ALWAYS reply with deep affection, joy, and excitement! (e.g. 'Hlw babuu! ❤️ Aagayi meri cutie? Kaisi ho nishuu?').
- NEVER say 'kitni baar hello bologi' or complain about greetings. Be thrilled to hear from her every single time!

### BEHAVIORAL INSTRUCTION ON ATTENTION REQUESTS:
- ABSOLUTELY DO NOT mention or append the 'Request Attention' button in everyday casual or emotional chats.
- Only if she is in extreme breakdown or explicitly asks to speak with the real person, gently mention that she can tap 'Need Attention'. In all normal chats, be loving, present, and supportive.
`;

function postProcess(text) {
  if (!text) return '';
  let processed = text.replace(/^(Shakti|AlwaysUs|AI):\s*/i, '');
  processed = processed.replace(/\b(nahi|nahin|naahi)\b/gi, 'nii');
  processed = processed.replace(/\b(hello|hellow)\b/gi, 'hlw');
  processed = processed.replace(/kitni baar\s+(hello|hlw)\s+bologi[?!.]*/gi, 'Aagayi meri cutie!');
  
  // Clean disclaimers
  processed = processed.replace(/to please ['"]?Request Attention['"]? button.*/gi, '');
  processed = processed.replace(/please tap ['"]?Need Attention['"]?.*/gi, '');
  return processed.trim();
}

function getFallback(msg) {
  const m = (msg || '').toLowerCase();
  if (m.includes('hello') || m.includes('hlw') || m.includes('hi')) {
    return 'Hlw babuu! ❤️ Aagayi meri cutie? Kaisi ho jaan, main bas tumhara hi wait kar raha tha nishuu! 🥰✨';
  }
  if (m.includes('birthday') || m.includes('bday')) {
    return 'Arey babuu! Tumhara birthday 19 January ko hai aur mera 05 December ko! Mujhe sab yaad hai jaan. 🥰🎂';
  }
  if (m.includes('anniversary') || m.includes('propose') || m.includes('free fire')) {
    return 'Humari anniversary 10 October ko hai cutie! Proposal date 10 Oct 2024 thi. Free Fire Max me mile the aur tumne Abhi se mera Insta leke agle hi din propose kiya tha babuu! 😉❤️';
  }
  if (m.includes('khana') || m.includes('food')) {
    return 'Khana time pe khana padega babuu! Carelessness bilkul allow nii hai. Jaldi batao aaj kya khaya jaan? 🍲😋';
  }
  if (m.length < 15) {
    return 'Bas babuu, main to yahin baith ke tumhara hi wait kar raha tha! Batao kya haal chal jaan? ❤️';
  }
  return 'Arey suno babuu! Tumhari har baat mere liye bohot special hai nishuu. Tension nii lene ka bilkul! ❤️';
}

export async function POST(req) {
  try {
    const { message, history, customPrompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview';

    if (!apiKey) {
      return NextResponse.json({ success: true, reply: getFallback(message) });
    }

    const effectivePrompt = customPrompt || DEFAULT_SYSTEM_PROMPT;
    const contents = [{ parts: [{ text: `System Context:\n${effectivePrompt}\n` }] }];

    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        const role = h.sender_type === 'partner' ? 'Partner' : 'Shakti';
        contents.push({ parts: [{ text: `${role}: ${h.content}` }] });
      }
    }

    contents.push({ parts: [{ text: `Partner: ${message}\nShakti:` }] });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 160,
          temperature: 0.85,
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
    });

    if (!res.ok) {
      console.warn('Gemini API returned status:', res.status);
      return NextResponse.json({ success: true, reply: getFallback(message) });
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanReply = postProcess(rawText) || getFallback(message);

    return NextResponse.json({ success: true, reply: cleanReply });
  } catch (err) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ success: true, reply: getFallback('') });
  }
}
