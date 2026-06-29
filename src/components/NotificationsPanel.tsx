import React, { useState, useEffect, useRef } from 'react';
import { DIcon } from '@/components/DashboardIcons';
import { Skeleton } from '@/components/Skeleton';
import { NotificationService } from '@/services/NotificationService';
import type { NotificationDoc } from '@/services/NotificationService';

interface Props {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  application: 'briefcase',
  message: 'chat',
  status_change: 'check',
  system: 'bell',
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  application: { bg: '#E8F0FE', color: '#2D6BE0' },
  message: { bg: '#F3ECFE', color: '#7B2FF6' },
  status_change: { bg: '#E4F5EA', color: '#0E8A48' },
  system: { bg: '#FBF0DA', color: '#B5740A' },
};

const formatTime = (date: any): string => {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'עכשיו';
  if (diffMin < 60) return `לפני ${diffMin} דק׳`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `לפני ${diffHr} שעות`;
  return `לפני ${Math.floor(diffHr / 24)} ימים`;
};

const NotificationsPanel: React.FC<Props> = ({ userId, isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId || !isOpen) return;
    setLoading(true);
    const unsub = NotificationService.onUserNotifications(userId, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });
    return unsub;
  }, [userId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  const handleMarkRead = async (id: string) => {
    await NotificationService.markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead(userId);
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div ref={panelRef} style={{ position: 'absolute', top: 56, left: 0, width: 360, maxHeight: 480, background: '#fff', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #EAECEF', zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F2F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>התראות</div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} style={{ fontSize: 12, fontWeight: 600, color: '#7B2FF6', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            סמן הכל כנקרא
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ padding: '12px 18px', borderBottom: '1px solid #F4F5F7', display: 'flex', gap: 12 }}>
                <Skeleton width={34} height={34} style={{ borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Skeleton width={160} height={13} style={{ marginBottom: 6 }} />
                  <Skeleton width={100} height={11} />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="tw-empty-state" style={{ padding: '40px 20px' }}>
            <div className="tw-empty-icon" style={{ width: 56, height: 56, borderRadius: 16 }}>
              {DIcon('bell', { size: 24, color: '#7B2FF6' })}
            </div>
            <h3 className="tw-empty-title" style={{ fontSize: 14 }}>אין התראות</h3>
            <p className="tw-empty-desc" style={{ fontSize: 13 }}>התראות חדשות יופיעו כאן</p>
          </div>
        ) : (
          notifications.map(n => {
            const typeStyle = TYPE_COLORS[n.type] || TYPE_COLORS.system;
            const icon = TYPE_ICONS[n.type] || 'bell';
            return (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkRead(n.id)}
                style={{
                  padding: '12px 18px',
                  borderBottom: '1px solid #F4F5F7',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  background: n.read ? '#fff' : '#FAFBFE',
                  cursor: n.read ? 'default' : 'pointer',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: typeStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {DIcon(icon, { size: 17, color: typeStyle.color })}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: n.read ? 500 : 700, color: '#2A3242', lineHeight: 1.4 }}>{n.title}</div>
                  <div style={{ fontSize: 12.5, color: '#8A93A3', marginTop: 2 }}>{n.content}</div>
                  <div style={{ fontSize: 11, color: '#A6AEBC', marginTop: 4 }}>{formatTime(n.createdAt)}</div>
                </div>
                {!n.read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7B2FF6', flexShrink: 0, marginTop: 6 }} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
