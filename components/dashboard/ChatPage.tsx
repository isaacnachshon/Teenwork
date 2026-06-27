import React, { useState } from 'react';
import { DIcon } from './DashboardIcons';
import { DashRole, CONN_STATUS, DEMO_CONVERSATIONS, DEMO_THREADS, DEMO_CONNECTIONS, avatarGrad, initial, Message } from './types';

interface Props {
  role: DashRole;
}

const ChatPage: React.FC<Props> = ({ role }) => {
  const [activeChat, setActiveChat] = useState('c1');
  const [draft, setDraft] = useState('');
  const [threads, setThreads] = useState<Record<string, Message[]>>({ ...DEMO_THREADS });
  const [convFlags, setConvFlags] = useState<Record<string, boolean>>({});

  const isAdmin = role === 'admin';
  const meSender = role === 'teen' ? 'teen' : 'employer';

  const convFlagged = (id: string, base: boolean) => id in convFlags ? convFlags[id] : base;
  const toggleConvFlag = (id: string) => {
    const base = DEMO_CONVERSATIONS.find(c => c.id === id)?.flagged ?? false;
    const cur = convFlagged(id, base);
    setConvFlags(f => ({ ...f, [id]: !cur }));
  };
  const toggleMsgFlag = (cid: string, idx: number) => {
    setThreads(t => ({
      ...t,
      [cid]: t[cid].map((m, i) => i === idx ? { ...m, flagged: !m.flagged } : m),
    }));
  };

  const now = () => {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setThreads(th => ({
      ...th,
      [activeChat]: [...(th[activeChat] || []), { sender: meSender as 'teen' | 'employer', text: t, time: now(), flagged: false }],
    }));
    setDraft('');
  };

  const titleOf = (c: typeof DEMO_CONVERSATIONS[0]) => role === 'teen' ? c.emp : c.teen;
  const subOf = (c: typeof DEMO_CONVERSATIONS[0]) => isAdmin ? (c.emp + ' · ' + c.role) : c.role;

  const convRaw = DEMO_CONVERSATIONS.find(c => c.id === activeChat) || DEMO_CONVERSATIONS[0];
  const headTitle = titleOf(convRaw);
  const connOfConv = DEMO_CONNECTIONS.find(c => c.id === convRaw.connId);
  const activeStatus = CONN_STATUS[connOfConv?.status || 'active'];
  const isFlaggedConv = convFlagged(convRaw.id, convRaw.flagged);

  const msgs = (threads[convRaw.id] || []).map((m, idx) => {
    let justify: string, bg: string, fg: string, border: string, showName = false, name = '';
    if (isAdmin) {
      const isTeen = m.sender === 'teen';
      justify = isTeen ? 'flex-start' : 'flex-end';
      bg = isTeen ? '#fff' : '#F1ECFB';
      fg = '#26303F';
      border = isTeen ? '1px solid #E7E9EE' : '1px solid #E3D7FA';
      showName = true;
      name = isTeen ? convRaw.teen : convRaw.emp;
    } else {
      const mine = m.sender === meSender;
      justify = mine ? 'flex-start' : 'flex-end';
      if (mine) { bg = '#7B2FF6'; fg = '#fff'; border = 'none'; }
      else { bg = '#fff'; fg = '#26303F'; border = '1px solid #E7E9EE'; }
    }
    return { ...m, idx, justify, align: justify, bg, fg, border, showName, name };
  });

  let threadTitle: string, threadSub: string;
  if (isAdmin) { threadTitle = convRaw.teen; threadSub = convRaw.emp + ' · ' + convRaw.role; }
  else if (role === 'employer') { threadTitle = convRaw.teen; threadSub = convRaw.role; }
  else { threadTitle = convRaw.emp; threadSub = convRaw.role; }

  // Panel actions
  let panelActions: { icon: React.ReactElement; label: string; bg: string; color: string; border: string; go: () => void }[];
  if (isAdmin) {
    panelActions = [
      { icon: DIcon('flag', { size: 17, color: '#9A6406' }), label: isFlaggedConv ? 'הסר סימון מהשיחה' : 'סמן שיחה לבדיקה', bg: '#FBF0DA', color: '#9A6406', border: 'none', go: () => toggleConvFlag(convRaw.id) },
      { icon: DIcon('alert', { size: 17, color: '#3A4456' }), label: 'שלח אזהרה לשני הצדדים', bg: '#F8F9FB', color: '#3A4456', border: '1px solid #EEF0F3', go: () => {} },
      { icon: DIcon('ban', { size: 17, color: '#C8364A' }), label: 'השהיית משתמש', bg: '#FBE7EA', color: '#C8364A', border: 'none', go: () => {} },
      { icon: DIcon('eye', { size: 17, color: '#3A4456' }), label: 'צפה בפרופיל הנער/ה', bg: '#F8F9FB', color: '#3A4456', border: '1px solid #EEF0F3', go: () => {} },
      { icon: DIcon('eye', { size: 17, color: '#3A4456' }), label: 'צפה בפרופיל המעסיק', bg: '#F8F9FB', color: '#3A4456', border: '1px solid #EEF0F3', go: () => {} },
    ];
  } else {
    panelActions = [
      { icon: DIcon('eye', { size: 17, color: '#3A4456' }), label: role === 'teen' ? 'צפה בפרופיל המעסיק' : 'צפה בפרופיל הנער/ה', bg: '#F8F9FB', color: '#3A4456', border: '1px solid #EEF0F3', go: () => {} },
      { icon: DIcon('star', { size: 17, color: '#3A4456' }), label: 'דרג את הצד השני', bg: '#F8F9FB', color: '#3A4456', border: '1px solid #EEF0F3', go: () => {} },
      { icon: DIcon('calendar', { size: 17, color: '#fff' }), label: 'תיאום משמרת', bg: '#7B2FF6', color: '#fff', border: 'none', go: () => {} },
    ];
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
      {/* Conversation List */}
      <div style={{ width: 310, flexShrink: 0, borderLeft: '1px solid #EAECEF', background: '#fff', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '18px 18px 12px', borderBottom: '1px solid #F1F2F5' }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{isAdmin ? 'ניהול שיחות' : 'הודעות'}</div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, background: '#F4F5F7', borderRadius: 10, padding: '8px 12px' }}>
            <span style={{ display: 'flex' }}>{DIcon('search', { size: 16, color: '#9AA3B2' })}</span>
            <input placeholder="חיפוש שיחה" style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontFamily: 'inherit', fontSize: 13.5 }} />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {DEMO_CONVERSATIONS.map(cv => {
            const title = titleOf(cv);
            const flagged = convFlagged(cv.id, cv.flagged);
            return (
              <button key={cv.id} onClick={() => setActiveChat(cv.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', border: 'none', borderBottom: '1px solid #F4F5F7', cursor: 'pointer', textAlign: 'right', padding: '13px 16px', background: cv.id === activeChat ? '#F6F2FE' : '#fff', fontFamily: 'inherit' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: avatarGrad(title), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{initial(title)}</div>
                  {flagged && <span style={{ position: 'absolute', bottom: -2, left: -2, width: 19, height: 19, borderRadius: '50%', background: '#E23B4E', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{DIcon('flag', { size: 10, color: '#fff' })}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
                    <span style={{ fontSize: 11.5, color: '#9AA3B2', flexShrink: 0 }}>{cv.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#9AA3B2', margin: '1px 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subOf(cv)}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#6B7689', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{cv.last}</span>
                    {cv.unread > 0 && <span style={{ minWidth: 19, height: 19, padding: '0 5px', borderRadius: 10, background: '#7B2FF6', color: '#fff', fontSize: 11.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{cv.unread}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Thread */}
      <div style={{ flex: 1, minWidth: 360, display: 'flex', flexDirection: 'column', background: '#F7F8FA', minHeight: 0 }}>
        {/* Thread header */}
        <div style={{ padding: '13px 20px', background: '#fff', borderBottom: '1px solid #EAECEF', display: 'flex', alignItems: 'center', gap: 13, flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: avatarGrad(headTitle), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{initial(headTitle)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700 }}>{threadTitle}</div>
            <div style={{ fontSize: 12.5, color: '#8A93A3' }}>{threadSub}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: activeStatus.bg, color: activeStatus.color, padding: '6px 12px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: activeStatus.color }} />
            {activeStatus.label}
          </div>
        </div>

        {/* Flagged banner */}
        {isFlaggedConv && (
          <div style={{ padding: '10px 20px', background: '#FBEEEF', borderBottom: '1px solid #F6DADC', display: 'flex', alignItems: 'center', gap: 9, color: '#B23046', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
            <span style={{ display: 'flex' }}>{DIcon('alert', { size: 17, color: '#B23046' })}</span>
            שיחה זו סומנה לבדיקה — זוהתה בקשה ליצירת קשר מחוץ לאפליקציה
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 11, minHeight: 0 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.justify as any, width: '100%' }}>
              <div style={{ maxWidth: '74%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: m.align as any }}>
                {m.showName && <span style={{ fontSize: 11.5, color: '#9AA3B2', fontWeight: 700, padding: '0 4px' }}>{m.name}</span>}
                <div style={{ background: m.bg, color: m.fg, border: m.border, padding: '10px 14px', borderRadius: 14, fontSize: 14, lineHeight: 1.45, boxShadow: '0 1px 2px rgba(20,20,40,.04)' }}>
                  {m.text}
                  {m.flagged && <span style={{ display: 'block', marginTop: 5, fontSize: 11, fontWeight: 700, color: '#C8364A' }}>⚑ סומן לבדיקה</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 4px' }}>
                  <span style={{ fontSize: 11, color: '#A6AEBC' }}>{m.time}</span>
                  {isAdmin && (
                    <button onClick={() => toggleMsgFlag(convRaw.id, m.idx)} style={{ fontSize: 11, fontWeight: 700, color: '#C8364A', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                      {m.flagged ? 'בטל סימון' : 'סמן הודעה'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input / Admin bar */}
        {isAdmin ? (
          <div style={{ padding: '13px 18px', background: '#fff', borderTop: '1px solid #EAECEF', display: 'flex', alignItems: 'center', gap: 10, color: '#8A93A3', fontSize: 13, flexShrink: 0 }}>
            <span style={{ display: 'flex' }}>{DIcon('shield', { size: 17, color: '#9AA3B2' })}</span>
            מצב צפייה למנהל — השתמש בכלי הניהול שמשמאל כדי לפעול
          </div>
        ) : (
          <div style={{ padding: '14px 18px', background: '#fff', borderTop: '1px solid #EAECEF', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
              placeholder="כתוב/כתבי הודעה..."
              style={{ flex: 1, border: '1px solid #E6E8ED', borderRadius: 12, padding: '12px 15px', outline: 'none', fontFamily: 'inherit', fontSize: 14, background: '#F8F9FB' }}
            />
            <button onClick={send} style={{ width: 46, height: 46, borderRadius: 12, border: 'none', background: '#7B2FF6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              {DIcon('send', { size: 19, color: '#fff' })}
            </button>
          </div>
        )}
      </div>

      {/* Details Panel */}
      <div style={{ width: 282, flexShrink: 0, borderRight: '1px solid #EAECEF', background: '#fff', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto' }}>
        <div style={{ padding: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>{isAdmin ? 'כלי ניהול שיחה' : 'פרטי ההתקשרות'}</div>
          <div style={{ background: '#FAFBFC', border: '1px solid #EEF0F3', borderRadius: 13, padding: '6px 14px', marginBottom: 16 }}>
            {[
              ['תפקיד', convRaw.role],
              ['נער/ה', convRaw.teen],
              ['מעסיק', convRaw.emp],
              ['סטטוס', activeStatus.label],
            ].map(([label, val], i, arr) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, borderBottom: i < arr.length - 1 ? '1px solid #F1F2F5' : 'none' }}>
                <span style={{ color: '#8A93A3' }}>{label}</span>
                <span style={{ fontWeight: i === 3 ? 700 : 600, color: i === 3 ? activeStatus.color : undefined }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9AA3B2', marginBottom: 9, letterSpacing: '.3px' }}>{isAdmin ? 'פעולות מנהל' : 'פעולות מהירות'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {panelActions.map((pa, i) => (
              <button key={i} onClick={pa.go} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'right', padding: '11px 13px', borderRadius: 11, border: pa.border, background: pa.bg, color: pa.color, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600 }}>
                <span style={{ display: 'flex' }}>{pa.icon}</span>
                <span style={{ flex: 1 }}>{pa.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
