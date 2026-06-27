import React, { useState } from 'react';
import { DIcon } from './DashboardIcons';
import { DashRole } from './types';
import { auth } from '../../firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

interface Props {
  role: DashRole;
  onLogout: () => void;
}

const SettingsPage: React.FC<Props> = ({ role, onLogout }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const user = auth?.currentUser;
  const isPasswordUser = user?.providerData?.some(p => p.providerId === 'password');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('הסיסמאות אינן תואמות.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('הסיסמה חייבת להיות לפחות 6 תווים.');
      return;
    }
    if (!user || !user.email) return;

    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordSuccess('הסיסמה שונתה בהצלחה!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPasswordError('הסיסמה הנוכחית שגויה.');
      } else {
        setPasswordError('שינוי הסיסמה נכשל. נסה שוב.');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '26px 30px 42px' }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800 }}>הגדרות</h1>
        <div style={{ marginTop: 5, fontSize: 14, color: '#8A93A3' }}>ניהול חשבון והעדפות</div>
      </div>

      {/* Account Info */}
      <div style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          {DIcon('user', { size: 20, color: '#7B2FF6' })}
          פרטי חשבון
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <InfoBlock label="אימייל" value={user?.email || ''} />
          <InfoBlock label="ספק התחברות" value={isPasswordUser ? 'אימייל + סיסמה' : 'Google'} />
          <InfoBlock label="תפקיד" value={role === 'teen' ? 'נוער' : role === 'employer' ? 'מעסיק' : 'מנהל'} />
          <InfoBlock label="מזהה חשבון" value={user?.uid?.slice(0, 12) + '...' || ''} />
        </div>
      </div>

      {/* Change Password */}
      {isPasswordUser && (
        <div style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            {DIcon('shield', { size: 20, color: '#7B2FF6' })}
            שינוי סיסמה
          </div>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
            <PasswordField label="סיסמה נוכחית" value={currentPassword} onChange={setCurrentPassword} />
            <PasswordField label="סיסמה חדשה" value={newPassword} onChange={setNewPassword} />
            <PasswordField label="אימות סיסמה חדשה" value={confirmPassword} onChange={setConfirmPassword} />
            {passwordError && <div style={{ color: '#C8364A', fontSize: 13, fontWeight: 600 }}>{passwordError}</div>}
            {passwordSuccess && <div style={{ color: '#0E8A48', fontSize: 13, fontWeight: 600 }}>{passwordSuccess}</div>}
            <button type="submit" disabled={changingPassword} style={{ padding: '12px 18px', borderRadius: 12, background: '#7B2FF6', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: changingPassword ? 0.6 : 1, alignSelf: 'flex-start' }}>
              {changingPassword ? 'משנה...' : 'שנה סיסמה'}
            </button>
          </form>
        </div>
      )}

      {/* Danger Zone */}
      <div style={{ background: '#fff', border: '1px solid #FBE7EA', borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: '#C8364A' }}>
          {DIcon('alert', { size: 20, color: '#C8364A' })}
          אזור רגיש
        </div>
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, background: '#FBE7EA', color: '#C8364A', border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {DIcon('logout', { size: 18, color: '#C8364A' })}
          התנתקות מהחשבון
        </button>
      </div>
    </div>
  );
};

const InfoBlock: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ background: '#F8F9FB', borderRadius: 10, padding: '10px 14px' }}>
    <div style={{ fontSize: 12, color: '#8A93A3', fontWeight: 600, marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 600, color: '#2A3242' }}>{value}</div>
  </div>
);

const PasswordField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A576E', marginBottom: 6 }}>{label}</label>
    <input type="password" value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E3E6EC', fontFamily: 'inherit', fontSize: 14, outline: 'none' }} />
  </div>
);

export default SettingsPage;
