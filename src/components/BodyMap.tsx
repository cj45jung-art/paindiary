'use client';

import React, { useState } from 'react';

interface BodyMapProps {
  selectedPart: string;
  onChange: (part: string) => void;
}

interface BodyZone {
  id: string;
  name: string;
  label: string;
  x: number;
  y: number;
  r: number;
  side: 'front' | 'back' | 'both';
}

const BODY_ZONES: BodyZone[] = [
  { id: 'Head', name: 'Head', label: '머리/두통', x: 100, y: 35, r: 18, side: 'front' },
  { id: 'Neck', name: 'Neck', label: '목/거북목', x: 100, y: 65, r: 12, side: 'both' },
  { id: 'Shoulder', name: 'Shoulder', label: '어깨', x: 68, y: 80, r: 14, side: 'front' },
  { id: 'Wrist', name: 'Wrist', label: '손목/터널', x: 42, y: 155, r: 12, side: 'front' },
  { id: 'Back', name: 'Back', label: '허리/척추', x: 100, y: 130, r: 18, side: 'back' },
  { id: 'Knee', name: 'Knee', label: '무릎', x: 75, y: 220, r: 15, side: 'front' },
];

export default function BodyMap({ selectedPart, onChange }: BodyMapProps) {
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');

  const visibleZones = BODY_ZONES.filter(
    (zone) => zone.side === 'both' || zone.side === viewSide
  );

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-2xl shadow-xs border border-slate-100 w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center w-full mb-4">
        <span className="text-sm font-semibold text-slate-700">신체 부위 선택</span>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setViewSide('front')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewSide === 'front'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            앞면 (Front)
          </button>
          <button
            type="button"
            onClick={() => setViewSide('back')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewSide === 'back'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            뒷면 (Back)
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-[4/5] flex items-center justify-center py-2">
        {/* SVG Graphic Body Outline */}
        <svg
          viewBox="0 0 200 320"
          className="w-full h-full max-h-[280px] text-slate-200 select-none"
        >
          {/* Simple Human Outline */}
          <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
            {/* Head */}
            <circle cx="100" cy="35" r="18" fill="#f1f5f9" />
            
            {/* Neck */}
            <path d="M94 53 L94 65 M106 53 L106 65" />
            
            {/* Shoulders & Torso */}
            {viewSide === 'front' ? (
              // Front Torso & Arms
              <>
                <path d="M68 70 Q100 75 132 70" />
                <path d="M68 70 L55 100 L45 140" />
                <path d="M132 70 L145 100 L155 140" />
                <path d="M68 70 L75 160 L125 160 L132 70" fill="#f1f5f9" />
                {/* Chest details */}
                <path d="M85 90 L115 90" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M100 75 L100 160" strokeWidth="1" strokeDasharray="3 3" />
              </>
            ) : (
              // Back Torso & Arms
              <>
                <path d="M68 70 Q100 75 132 70" />
                <path d="M68 70 L55 100 L45 140" />
                <path d="M132 70 L145 100 L155 140" />
                <path d="M68 70 L75 160 L125 160 L132 70" fill="#f1f5f9" />
                {/* Spine representation */}
                <path d="M100 65 L100 160" stroke="#cbd5e1" strokeWidth="3" />
              </>
            )}

            {/* Pelvis & Legs */}
            <path d="M75 160 L65 220 L55 290" />
            <path d="M125 160 L135 220 L145 290" />
          </g>

          {/* Render interactive hotspot nodes */}
          {visibleZones.map((zone) => {
            const isSelected = selectedPart === zone.id;
            return (
              <g
                key={zone.id}
                onClick={() => onChange(zone.id)}
                className="cursor-pointer group"
              >
                {/* Visual pulse for existing selected item */}
                {isSelected && (
                  <circle
                    cx={zone.x}
                    cy={zone.y}
                    r={zone.r * 1.6}
                    fill="#3b82f6"
                    opacity="0.2"
                    className="animate-ping origin-center"
                    style={{ transformOrigin: `${zone.x}px ${zone.y}px` }}
                  />
                )}

                {/* Hotspot Touch Area (at least 44x44px equivalent) */}
                <circle
                  cx={zone.x}
                  cy={zone.y}
                  r={Math.max(zone.r, 22)}
                  fill="transparent"
                  className="pointer-events-all"
                />

                {/* Visible indicator circle */}
                <circle
                  cx={zone.x}
                  cy={zone.y}
                  r={zone.r}
                  fill={isSelected ? '#3b82f6' : '#ffffff'}
                  stroke={isSelected ? '#2563eb' : '#94a3b8'}
                  strokeWidth={isSelected ? '3' : '2'}
                  className="transition-all duration-200 group-hover:scale-110"
                  style={{ transformOrigin: `${zone.x}px ${zone.y}px` }}
                />

                {/* Text Label next to/under target */}
                <rect
                  x={zone.x - 30}
                  y={zone.y + zone.r + 3}
                  width="60"
                  height="16"
                  rx="4"
                  fill={isSelected ? '#eff6ff' : '#ffffff'}
                  stroke={isSelected ? '#bfdbfe' : '#e2e8f0'}
                  strokeWidth="1"
                />
                <text
                  x={zone.x}
                  y={zone.y + zone.r + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fill={isSelected ? '#1d4ed8' : '#475569'}
                  className="select-none font-sans"
                >
                  {zone.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating tooltip/hint */}
        <div className="absolute bottom-1 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-[10px] text-slate-500 text-center select-none shadow-2xs">
          {selectedPart 
            ? <span className="font-medium text-blue-600">선택된 부위: {BODY_ZONES.find(z => z.id === selectedPart)?.label}</span>
            : '동그라미 영역을 터치해 아픈 부위를 표시해 주세요.'
          }
        </div>
      </div>
    </div>
  );
}
