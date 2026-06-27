import React, { useState, useEffect, useRef } from 'react';
import { DIcon } from './DashboardIcons';
import { DashRole, avatarGrad, initial } from './types';
import { auth, db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp, or } from 'firebase/firestore';

interface Props {
  role: DashRole;
}

interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  recipientName: string;
  text: string;
  timestamp: Date;
  flagged: boolean;
}

interface Conversation {
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  lastTime: Date;
  unread: number;
}

const ChatPage: React.FC<Props> = ({ role }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePartner, setActivePartner] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const uid = auth?.currentUser?.uid || '';
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!uid) return;

    let q;
    if (isAdmin) {
      q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
    } else {
      q = query(
        collection(db, 'messages'),
        or(
          where('senderId', '==', uid),
          where('recipientId', '==', uid)
        )
      );
    }

    const unsub = onSnapshot(q, (snap) => {
      const allMsgs: ChatMessage[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          senderId: data.senderId || '',
          recipientId: data.recipientId || '',
          senderName: data.senderName || 'משתמש',
          recipientName: data.recipientName || 'משתמש',
          text: data.text || '',
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
          flagged: data.flagged || false,
        };
      });

      const convMap = new Map<string, Conversation>();
      for (const msg of allMsgs) {
        const partnerId = isAdmin
          ? `${msg.senderId}_${msg.recipientId}`
          : msg.senderId === uid ? msg.recipientId : msg.senderId;
        const partnerName = isAdmin
          ? `${msg.senderName} ↔ ${msg.recipientName}`
          : msg.senderId === uid ? msg.recipientName : msg.senderName;

        const existing = convMap.get(partnerId);
        if (!existing || msg.timestamp > existing.lastTime) {
          convMap.set(partnerId, {
            partnerId,
            partnerName,
            lastMessage: msg.text,
            lastTime: msg.timestamp,
            unread: 0,
          });
        }
      }

      const sorted = Array.from(convMap.values()).sort((a, b) => b.lastTime.getTime() - a.lastTime.getTime());
      setConversations(sorted);

      if (!activePartner && sorted.length > 0) {
        setActivePartner(sorted[0].partnerId);
      }

      setMessages(allMsgs);
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [uid, role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activePartner]);

  const activeMessages = messages
    .filter(m => {
      if (isAdmin) {
        return `${m.senderId}_${m.recipientId}` === activePartner || `${m.recipientId}_${m.senderId}` === activePartner;
      }
      return m.senderId === activePartner || m.recipientId === activePartner;
    })
    .filter(m => {
      if (!isAdmin) {
        return m.senderId === uid || m.recipientId === uid;
      }
      return true;
    })
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const send = async () => {
    const text = draft.trim();
    if (!text || !activePartner || isAdmin || !uid) return;

    try {
      const partnerConv = conversations.find(c => c.partnerId === activePartner);
      await addDoc(collection(db, 'messages'), {
        senderId: uid,
        recipientId: activePartner,
        senderName: auth.currentUser?.displayName || 'משתמש',
        recipientName: partnerConv?.partnerName || 'משתמש',
        text,
        timestamp: serverTimestamp(),
        flagged: false,
      });
      setDraft('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const formatTime = (d: Date) => {
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };

  const activeConv = conversations.find(c => c.partnerId === activePartner);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 16, color: '#8A93A3' }}>טוען הודעות...</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
      {/* Conversation List */}
      <div style={{ width: 310, flexShrink: 0, borderLeft: '1px solid #EAECEF', background: '#fff', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '18px 18px 12px', borderBottom: '1px solid #F1F2F5' }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{isAdmin ? 'ניהול שיחות' : 'הודעות'}</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ marginBottom: 10 }}>{DIcon('chat', { size: 36, color: '#C8CDD7' })}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#4A576E', marginBottom: 4 }}>אין הודעות עדיין</div>
              <div style={{ fontSize: 13, color: '#8A93A3' }}>
                {role === 'teen' ? 'שלח הודעה למעסיק דרך דף המשרה' : 'הודעות ממועמדים יופיעו כאן'}
              </div>
            </div>
          ) : (
            conversations.map(cv => (
              <button key={cv.partnerId} onClick={() => setActivePartner(cv.partnerId)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', border: 'none', borderBottom: '1px solid #F4F5F7', cursor: 'pointer', textAlign: 'right', padding: '13px 16px', background: cv.partnerId === activePartner ? '#F6F2FE' : '#fff', fontFamily: 'inherit' }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: avatarGrad(cv.partnerName), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{initial(cv.partnerName)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cv.partnerName}</span>
                    <span style={{ fontSize: 11.5, color: '#9AA3B2', flexShrink: 0 }}>{formatTime(cv.lastTime)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7689', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3 }}>{cv.lastMessage}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Thread */}
      <div style={{ flex: 1, minWidth: 360, display: 'flex', flexDirection: 'column', background: '#F7F8FA', minHeight: 0 }}>
        {activeConv ? (
          <>
            <div style={{ padding: '13px 20px', background: '#fff', borderBottom: '1px solid #EAECEF', display: 'flex', alignItems: 'center', gap: 13, flexShrink: 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: avatarGrad(activeConv.partnerName), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{initial(activeConv.partnerName)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 700 }}>{activeConv.partnerName}</div>
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 11, minHeight: 0 }}>
              {activeMessages.map(m => {
                const isMine = m.senderId === uid;
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-start' : 'flex-end', width: '100%' }}>
                    <div style={{ maxWidth: '74%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: isMine ? 'flex-start' : 'flex-end' }}>
                      {isAdmin && <span style={{ fontSize: 11.5, color: '#9AA3B2', fontWeight: 700, padding: '0 4px' }}>{m.senderName}</span>}
                      <div style={{ background: isMine && !isAdmin ? '#7B2FF6' : '#fff', color: isMine && !isAdmin ? '#fff' : '#26303F', border: isMine && !isAdmin ? 'none' : '1px solid #E7E9EE', padding: '10px 14px', borderRadius: 14, fontSize: 14, lineHeight: 1.45, boxShadow: '0 1px 2px rgba(20,20,40,.04)' }}>
                        {m.text}
                      </div>
                      <span style={{ fontSize: 11, color: '#A6AEBC', padding: '0 4px' }}>{formatTime(m.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {isAdmin ? (
              <div style={{ padding: '13px 18px', background: '#fff', borderTop: '1px solid #EAECEF', display: 'flex', alignItems: 'center', gap: 10, color: '#8A93A3', fontSize: 13, flexShrink: 0 }}>
                <span style={{ display: 'flex' }}>{DIcon('shield', { size: 17, color: '#9AA3B2' })}</span>
                מצב צפייה למנהל
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
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div>{DIcon('chat', { size: 48, color: '#C8CDD7' })}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#4A576E' }}>אין שיחות פעילות</div>
            <div style={{ fontSize: 14, color: '#8A93A3' }}>בחר שיחה מהרשימה או התחל שיחה חדשה</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
