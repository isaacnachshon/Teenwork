import React, { useEffect, useRef } from 'react';
import type { Job } from '../types';

declare const L: any;

interface JobMapProps {
  jobs: Job[];
  userLocation?: { lat: number; lng: number } | null;
  onJobClick?: (job: Job) => void;
  height?: string;
}

const JOB_TYPE_COLORS: Record<string, string> = {
  'קייטרינג': '#8B5CF6',
  'ניקיון': '#10B981',
  'בייביסיטר': '#EC4899',
  'שיעורים': '#3B82F6',
  'מלצרות': '#F59E0B',
  'סבלות': '#EF4444',
};

const JobMap: React.FC<JobMapProps> = ({ jobs, userLocation, onJobClick, height = '400px' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined') return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const defaultCenter: [number, number] = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [32.0853, 34.7818]; // Tel Aviv default

    const map = L.map(mapContainerRef.current, { attributionControl: true }).setView(defaultCenter, 12);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    if (userLocation) {
      const userIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<strong>המיקום שלך</strong>');
    }

    const bounds: [number, number][] = [];
    if (userLocation) bounds.push([userLocation.lat, userLocation.lng]);

    jobs.forEach(job => {
      if (!job.coordinates) return;

      const color = JOB_TYPE_COLORS[job.type] || '#6B7280';
      const jobIcon = L.divIcon({
        html: `<div style="width:30px;height:30px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:bold;">₪</div>`,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([job.coordinates.lat, job.coordinates.lng], { icon: jobIcon }).addTo(map);

      const popupContent = `
        <div style="text-align:right;direction:rtl;min-width:180px;font-family:Assistant,sans-serif;">
          <strong style="font-size:14px;">${job.title}</strong><br/>
          <span style="color:#6B7280;font-size:12px;">${job.company}</span><br/>
          <span style="color:#6B7280;font-size:12px;">📍 ${job.location}</span><br/>
          <span style="color:${color};font-weight:bold;font-size:13px;">${job.salary} ₪ לשעה</span>
          ${onJobClick ? `<br/><button onclick="window.__teenworkMapJobClick__('${job.id}')" style="margin-top:6px;background:${color};color:white;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-weight:bold;font-size:12px;width:100%;">צפה בפרטים</button>` : ''}
        </div>
      `;
      marker.bindPopup(popupContent);
      bounds.push([job.coordinates.lat, job.coordinates.lng]);
    });

    if (onJobClick) {
      (window as any).__teenworkMapJobClick__ = (jobId: string) => {
        const job = jobs.find(j => j.id === jobId);
        if (job) onJobClick(job);
      };
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if ((window as any).__teenworkMapJobClick__) {
        delete (window as any).__teenworkMapJobClick__;
      }
    };
  }, [jobs, userLocation, onJobClick]);

  if (typeof window !== 'undefined' && typeof L === 'undefined') {
    return (
      <div style={{ height }} className="bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
        טוען מפה...
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      <div className="bg-white p-3 flex flex-wrap gap-3 justify-center border-t">
        {Object.entries(JOB_TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span style={{ background: color, width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }} />
            {type}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobMap;
