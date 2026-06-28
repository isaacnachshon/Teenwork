import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
const MODEL = 'gemini-2.0-flash';

const SYSTEM_CONTEXT = `אתה עוזר AI של פלטפורמת TeenWork — פלטפורמה לחיבור בין נוער בישראל (גילאי 14-18) למעסיקים.
אתה מדבר בעברית, בגובה העיניים, בטון ידידותי ומקצועי.
אתה מכיר את חוקי העבודה לנוער בישראל.
אל תמציא מידע — אם אתה לא בטוח, אמור זאת.`;

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

async function generate(prompt: string, context?: string): Promise<string> {
  const fullPrompt = context ? `${SYSTEM_CONTEXT}\n\n${context}\n\n${prompt}` : `${SYSTEM_CONTEXT}\n\n${prompt}`;

  const response = await genai.models.generateContent({
    model: MODEL,
    contents: fullPrompt,
  });

  return response.text || 'לא הצלחתי לייצר תשובה. נסה שוב.';
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
  }): Promise<string> {
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
      'בנה קורות חיים מקצועיים ומותאמים לנוער עבור הפרופיל הבא. הקורות חיים צריכים להיות בעברית, בפורמט נקי ומסודר, עם סעיפים: פרטים אישיים, השכלה, ניסיון תעסוקתי, כישורים, ותכונות אישיות.',
      profileText
    );
  },

  async prepareForInterview(jobTitle: string, company?: string): Promise<string> {
    const context = company ? `משרה: ${jobTitle} בחברת ${company}` : `משרה: ${jobTitle}`;
    return generate(
      'הכן את הנער/ה לראיון עבודה. תן 5 שאלות נפוצות שעשויות להישאל, עם הצעות לתשובות. הוסף טיפים כלליים להתנהגות בראיון. התייחס לכך שמדובר בנוער בגילאי 14-18.',
      context
    );
  },

  async suggestJobs(profile: {
    skills?: string[];
    city?: string;
    availability?: string[];
    preferredJobTypes?: string[];
  }): Promise<string> {
    const profileText = [
      profile.skills?.length ? `כישורים: ${profile.skills.join(', ')}` : '',
      profile.city ? `עיר: ${profile.city}` : '',
      profile.availability?.length ? `זמינות: ${profile.availability.join(', ')}` : '',
      profile.preferredJobTypes?.length ? `העדפות: ${profile.preferredJobTypes.join(', ')}` : '',
    ].filter(Boolean).join('\n');

    return generate(
      'בהתבסס על הפרופיל, הצע 5 סוגי עבודות מתאימים לנוער עם הסבר קצר למה כל אחד מתאים. התמקד בעבודות חוקיות ובטוחות לנוער בישראל.',
      profileText
    );
  },

  async suggestSalary(jobType: string, city?: string): Promise<string> {
    const context = city ? `סוג עבודה: ${jobType}, עיר: ${city}` : `סוג עבודה: ${jobType}`;
    return generate(
      'מהו טווח השכר המומלץ לנוער עבור סוג עבודה זה בישראל? ציין את שכר המינימום לנוער לפי החוק, ואת הטווח המקובל בשוק. ציין את המקור (חוק עבודת הנוער).',
      context
    );
  },

  async explainRights(topic?: string): Promise<string> {
    const context = topic ? `נושא ספציפי: ${topic}` : '';
    return generate(
      'הסבר את זכויות הנוער בעבודה בישראל. כלול: שעות עבודה מותרות, שכר מינימום, חופשות, ביטוח, ותנאים מיוחדים. אם יש נושא ספציפי — התמקד בו. ציין מקורות חוקיים.',
      context
    );
  },

  async analyzeProfile(profile: {
    name: string;
    skills?: string[];
    bio?: string;
    workHistory?: { title: string; company: string }[];
    profileCompleted?: boolean;
  }): Promise<string> {
    const profileText = [
      `שם: ${profile.name}`,
      profile.skills?.length ? `כישורים: ${profile.skills.join(', ')}` : 'כישורים: לא צוינו',
      profile.bio ? `אודות: ${profile.bio}` : 'אודות: לא צוין',
      profile.workHistory?.length ? `ניסיון: ${profile.workHistory.length} עבודות` : 'ניסיון: אין',
      `פרופיל מושלם: ${profile.profileCompleted ? 'כן' : 'לא'}`,
    ].join('\n');

    return generate(
      'נתח את הפרופיל ותן ציון מ-1 עד 10 עם המלצות לשיפור. התייחס ל: מידת השלמת הפרופיל, כישורים, ניסיון, ותיאור עצמי. תן 3 טיפים קונקרטיים לשיפור הפרופיל.',
      profileText
    );
  },

  async chat(messages: ChatMessage[], newMessage: string): Promise<string> {
    const history = messages.map(m => `${m.role === 'user' ? 'נער/ה' : 'AI'}: ${m.text}`).join('\n');
    return generate(newMessage, history ? `היסטוריית שיחה:\n${history}` : undefined);
  },
};
