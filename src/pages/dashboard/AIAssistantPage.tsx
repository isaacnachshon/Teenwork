import React, { useState, useRef, useEffect } from 'react';
import { DIcon } from '@/components/DashboardIcons';
import { AIService } from '@/services/AIService';
import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface ChatMsg {
  role: 'user' | 'model';
  text: string;
}

const QUICK_ACTIONS = [
  { icon: 'briefcase', label: 'בנה לי קורות חיים', action: 'resume', color: '#7B2FF6', bg: '#F3ECFE' },
  { icon: 'user', label: 'הכן אותי לראיון', action: 'interview', color: '#2D6BE0', bg: '#E8F0FE' },
  { icon: 'star', label: 'נתח את הפרופיל שלי', action: 'analyze', color: '#0E8A48', bg: '#E4F5EA' },
  { icon: 'wallet', label: 'כמה שכר מגיע לי?', action: 'salary', color: '#B5740A', bg: '#FBF0DA' },
  { icon: 'shield', label: 'מה הזכויות שלי?', action: 'rights', color: '#C8364A', bg: '#FBE7EA' },
  { icon: 'search', label: 'מצא לי עבודה', action: 'suggest', color: '#4E5BD6', bg: '#EAECFE' },
];

const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const uid = auth?.currentUser?.uid;
    if (!uid) return;
    getDoc(doc(db, 'users', uid)).then(snap => {
      if (snap.exists()) setProfile(snap.data());
    }).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role: 'user' | 'model', text: string) => {
    setMessages(prev => [...prev, { role, text }]);
  };

  const handleQuickAction = async (action: string) => {
    setLoading(true);
    try {
      let userMsg = '';
      let response = '';
      switch (action) {
        case 'resume':
          userMsg = 'בנה לי קורות חיים';
          addMessage('user', userMsg);
          response = await AIService.buildResume(profile || {});
          break;
        case 'interview':
          userMsg = 'הכן אותי לראיון עבודה';
          addMessage('user', userMsg);
          response = await AIService.prepareForInterview(profile?.preferredJobTypes?.[0] || 'עבודה כללית');
          break;
        case 'analyze':
          userMsg = 'נתח את הפרופיל שלי';
          addMessage('user', userMsg);
          response = await AIService.analyzeProfile(profile || {});
          break;
        case 'salary':
          userMsg = 'כמה שכר מגיע לי?';
          addMessage('user', userMsg);
          response = await AIService.suggestSalary(profile?.preferredJobTypes?.[0] || 'עבודה כללית', profile?.city);
          break;
        case 'rights':
          userMsg = 'מה הזכויות שלי בעבודה?';
          addMessage('user', userMsg);
          response = await AIService.explainRights();
          break;
        case 'suggest':
          userMsg = 'מצא לי עבודה מתאימה';
          addMessage('user', userMsg);
          response = await AIService.suggestJobs(profile || {});
          break;
      }
      addMessage('model', response);
    } catch (err) {
      addMessage('model', 'מצטער, אירעה שגיאה. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    addMessage('user', text);
    setLoading(true);
    try {
      const response = await AIService.chat(messages, text);
      addMessage('model', response);
    } catch {
      addMessage('model', 'מצטער, אירעה שגיאה. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: '#F7F8FA' }}>
      {messages.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #7B2FF6, #5560FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {DIcon('star', { size: 30, color: '#fff' })}
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1B2333' }}>העוזר החכם שלך</h2>
            <p style={{ marginTop: 8, fontSize: 15, color: '#8A93A3', maxWidth: 400 }}>אני יכול לעזור לך לבנות קורות חיים, להתכונן לראיון, למצוא עבודה מתאימה ועוד</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxWidth: 520, width: '100%' }}>
            {QUICK_ACTIONS.map(qa => (
              <button key={qa.action} className="tw-card" onClick={() => handleQuickAction(qa.action)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 12px', borderRadius: 14, border: '1px solid #EEF0F3', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: qa.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {DIcon(qa.icon, { size: 20, color: qa.color })}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#3A4456', textAlign: 'center' }}>{qa.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-start' : 'flex-end', width: '100%' }}>
              <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: 16, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', background: m.role === 'user' ? '#7B2FF6' : '#fff', color: m.role === 'user' ? '#fff' : '#26303F', border: m.role === 'user' ? 'none' : '1px solid #E7E9EE', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ padding: '12px 20px', borderRadius: 16, background: '#fff', border: '1px solid #E7E9EE', color: '#8A93A3', fontSize: 14 }}>
                חושב...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '14px 20px', background: '#fff', borderTop: '1px solid #EAECEF', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {messages.length > 0 && (
          <button className="tw-btn-ghost" onClick={() => setMessages([])} style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid #E6E8ED', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} title="שיחה חדשה">
            {DIcon('plus', { size: 18, color: '#7A8699' })}
          </button>
        )}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
          placeholder="שאל אותי כל שאלה..."
          disabled={loading}
          style={{ flex: 1, border: '1px solid #E6E8ED', borderRadius: 12, padding: '12px 15px', outline: 'none', fontFamily: 'inherit', fontSize: 14, background: '#F8F9FB' }}
        />
        <button className="tw-btn-primary" onClick={handleSend} disabled={loading || !input.trim()} style={{ width: 46, height: 46, borderRadius: 12, border: 'none', background: '#7B2FF6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: loading || !input.trim() ? 0.5 : 1 }}>
          {DIcon('send', { size: 19, color: '#fff' })}
        </button>
      </div>
    </div>
  );
};

export default AIAssistantPage;
