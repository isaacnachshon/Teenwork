import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase';

// Prompts are answered by the `aiGenerate` Cloud Function so the Gemini key
// stays on the server. The function streams text deltas and returns the full text.

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type OnChunk = (textSoFar: string) => void;

async function generate(prompt: string, context?: string, onChunk?: OnChunk): Promise<string> {
  const callable = httpsCallable<{ prompt: string; context?: string }, { text: string }, string>(functions, 'aiGenerate');
  const { stream, data } = await callable.stream({ prompt, context });
  let text = '';
  for await (const delta of stream) {
    text += delta;
    if (text && onChunk) onChunk(text);
  }
  const result = await data;
  return result?.text || text || 'לא הצלחתי לייצר תשובה. נסה שוב.';
}

export const AIService = {
  async buildResume(profile: {
    name: string;
    age?: number;
    city?: string;
    school?: string;
    skills?: string[];
    workHistory?: { title: string; company: string; duration: string }[];
    bio?: string;
  }, onChunk?: OnChunk): Promise<string> {
    const profileText = [
      `שם: ${profile.name}`,
      profile.age ? `גיל: ${profile.age}` : '',
      profile.city ? `עיר: ${profile.city}` : '',
      profile.school ? `בית ספר: ${profile.school}` : '',
      profile.skills?.length ? `כישורים: ${profile.skills.join(', ')}` : '',
      profile.workHistory?.length ? `ניסיון: ${profile.workHistory.map(w => `${w.title} ב-${w.company} (${w.duration})`).join('; ')}` : '',
      profile.bio ? `אודות: ${profile.bio}` : '',
    ].filter(Boolean).join('\n');

    return generate(
      'בנה קורות חיים תמציתיים לנוער עבור הפרופיל הבא (חריגה מכלל 80 המילים מותרת כאן, עד 150 מילים). סעיפים: פרטים אישיים, השכלה, ניסיון, כישורים. שורה אחת לכל פריט.',
      profileText,
      onChunk
    );
  },

  async prepareForInterview(jobTitle: string, company?: string, onChunk?: OnChunk): Promise<string> {
    const context = company ? `משרה: ${jobTitle} בחברת ${company}` : `משרה: ${jobTitle}`;
    return generate(
      'הכנה לראיון עבודה לנוער: 3 שאלות נפוצות עם תשובה לדוגמה במשפט אחד לכל שאלה, ו-2 טיפים קצרים להתנהגות בראיון.',
      context,
      onChunk
    );
  },

  async suggestJobs(profile: {
    skills?: string[];
    city?: string;
    availability?: string[];
    preferredJobTypes?: string[];
  }, onChunk?: OnChunk): Promise<string> {
    const profileText = [
      profile.skills?.length ? `כישורים: ${profile.skills.join(', ')}` : '',
      profile.city ? `עיר: ${profile.city}` : '',
      profile.availability?.length ? `זמינות: ${profile.availability.join(', ')}` : '',
      profile.preferredJobTypes?.length ? `העדפות: ${profile.preferredJobTypes.join(', ')}` : '',
    ].filter(Boolean).join('\n');

    return generate(
      'בהתבסס על הפרופיל, הצע 3 סוגי עבודות מתאימים לנוער — שורה אחת לכל עבודה: שם + למה מתאימה. רק עבודות חוקיות ובטוחות לנוער בישראל.',
      profileText,
      onChunk
    );
  },

  async suggestSalary(jobType: string, city?: string, onChunk?: OnChunk): Promise<string> {
    const context = city ? `סוג עבודה: ${jobType}, עיר: ${city}` : `סוג עבודה: ${jobType}`;
    return generate(
      'טווח שכר לנוער לסוג עבודה זה בישראל: שכר מינימום לנוער לפי חוק (לפי גיל) + הטווח המקובל בשוק. נקודות קצרות בלבד.',
      context,
      onChunk
    );
  },

  async explainRights(topic?: string, onChunk?: OnChunk): Promise<string> {
    const context = topic ? `נושא ספציפי: ${topic}` : '';
    return generate(
      'זכויות נוער בעבודה בישראל — 5 הנקודות הכי חשובות: שעות מותרות, שכר מינימום, הפסקות, איסורים, למי פונים כשמפרים זכויות. אם יש נושא ספציפי — התמקד רק בו.',
      context,
      onChunk
    );
  },

  async analyzeProfile(profile: {
    name: string;
    skills?: string[];
    bio?: string;
    workHistory?: { title: string; company: string }[];
    profileCompleted?: boolean;
  }, onChunk?: OnChunk): Promise<string> {
    const profileText = [
      `שם: ${profile.name}`,
      profile.skills?.length ? `כישורים: ${profile.skills.join(', ')}` : 'כישורים: לא צוינו',
      profile.bio ? `אודות: ${profile.bio}` : 'אודות: לא צוין',
      profile.workHistory?.length ? `ניסיון: ${profile.workHistory.length} עבודות` : 'ניסיון: אין',
      `פרופיל מושלם: ${profile.profileCompleted ? 'כן' : 'לא'}`,
    ].join('\n');

    return generate(
      'נתח את הפרופיל: ציון מ-1 עד 10 בשורה הראשונה, ואז 3 טיפים קונקרטיים לשיפור — שורה אחת לכל טיפ.',
      profileText,
      onChunk
    );
  },

  async chat(messages: ChatMessage[], newMessage: string, onChunk?: OnChunk): Promise<string> {
    const history = messages.map(m => `${m.role === 'user' ? 'נער/ה' : 'AI'}: ${m.text}`).join('\n');
    return generate(newMessage, history ? `היסטוריית שיחה:\n${history}` : undefined, onChunk);
  },
};
