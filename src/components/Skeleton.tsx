import React from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 14, circle, style }) => (
  <div
    className={`tw-skeleton${circle ? ' tw-skeleton-circle' : ''}`}
    style={{ width, height: circle ? width : height, ...style }}
  />
);

export const SkeletonCard: React.FC = () => (
  <div style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '17px 18px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Skeleton width={42} height={42} style={{ borderRadius: 12 }} />
      <Skeleton width={48} height={22} style={{ borderRadius: 8 }} />
    </div>
    <Skeleton width={80} height={28} style={{ marginTop: 14, borderRadius: 6 }} />
    <Skeleton width={120} height={13} style={{ marginTop: 8, borderRadius: 6 }} />
  </div>
);

export const SkeletonRow: React.FC = () => (
  <div style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '15px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
    <Skeleton width={46} height={46} circle />
    <div style={{ flex: 1 }}>
      <Skeleton width={120} height={14} style={{ marginBottom: 8 }} />
      <Skeleton width={80} height={12} />
    </div>
    <Skeleton width={90} height={30} style={{ borderRadius: 9 }} />
    <Skeleton width={70} height={30} style={{ borderRadius: 10 }} />
  </div>
);

export const SkeletonChat: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
    {[1, 2, 3, 4].map(i => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '1px solid #F4F5F7' }}>
        <Skeleton width={42} height={42} circle />
        <div style={{ flex: 1 }}>
          <Skeleton width={100} height={14} style={{ marginBottom: 6 }} />
          <Skeleton width={150} height={11} />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonProfile: React.FC = () => (
  <div style={{ maxWidth: 780, margin: '0 auto', padding: '26px 30px 42px' }}>
    <Skeleton width={200} height={26} style={{ marginBottom: 24, borderRadius: 6 }} />
    <div style={{ background: 'linear-gradient(135deg, #E8DAF8, #D4C4F0)', borderRadius: 20, padding: '32px 28px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <Skeleton width={90} height={90} circle style={{ opacity: 0.5 }} />
        <div>
          <Skeleton width={160} height={22} style={{ marginBottom: 8, opacity: 0.5 }} />
          <Skeleton width={200} height={14} style={{ opacity: 0.4 }} />
        </div>
      </div>
    </div>
    <div style={{ background: '#fff', borderRadius: 16, padding: '18px 22px', marginBottom: 20, border: '1px solid #EEF0F3' }}>
      <Skeleton width={180} height={14} style={{ marginBottom: 12 }} />
      <Skeleton height={8} style={{ borderRadius: 4 }} />
    </div>
    <div style={{ background: '#fff', borderRadius: 18, padding: '22px 24px', border: '1px solid #EEF0F3' }}>
      <Skeleton width={140} height={16} style={{ marginBottom: 18 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} height={52} style={{ borderRadius: 12 }} />
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonTable: React.FC = () => (
  <div style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, overflow: 'hidden' }}>
    <div style={{ padding: '13px 20px', background: '#FAFBFC', borderBottom: '1px solid #EEF0F3' }}>
      <Skeleton width={300} height={12} />
    </div>
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #F4F5F7' }}>
        <Skeleton width={38} height={38} circle />
        <div style={{ flex: 1 }}>
          <Skeleton width={130} height={14} style={{ marginBottom: 6 }} />
          <Skeleton width={180} height={11} />
        </div>
        <Skeleton width={70} height={24} style={{ borderRadius: 8 }} />
        <Skeleton width={60} height={12} />
        <Skeleton width={33} height={33} style={{ borderRadius: 9 }} />
      </div>
    ))}
  </div>
);
