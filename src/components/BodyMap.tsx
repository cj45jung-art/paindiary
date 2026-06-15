'use client';

import React, { useState, useEffect } from 'react';
import {
  BODY_PARTS_MAP,
  BODY_PARTS_LIST,
  getPartLabel,
  getBaseCategory,
  BodyPartDetail
} from '@/lib/bodyParts';

interface BodyMapProps {
  selectedPart: string;
  onChange: (part: string) => void;
}

interface BodyZone {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  side: 'front' | 'back' | 'both';
  group: string;
  defaultSide?: 'Left' | 'Right';
  labelXOffset?: number;
  labelYOffset?: number;
}

const MAIN_ZONES: BodyZone[] = [
  { id: 'Head', label: '머리/얼굴', x: 100, y: 35, r: 10, side: 'both', group: 'Head', labelXOffset: 0, labelYOffset: -28 },
  { id: 'Neck', label: '목/경추', x: 100, y: 65, r: 8, side: 'both', group: 'Neck', labelXOffset: 48, labelYOffset: -12 },
  
  // Left side (Body's Left -> Screen's Left)
  { id: 'Shoulder_Left_Main', label: '왼쪽 어깨', x: 65, y: 80, r: 9, side: 'both', group: 'Shoulder', defaultSide: 'Left', labelXOffset: -31, labelYOffset: -25 },
  { id: 'Wrist_Left_Main', label: '왼손목/손', x: 42, y: 155, r: 8, side: 'both', group: 'Wrist', defaultSide: 'Left', labelXOffset: -8, labelYOffset: -30 },
  { id: 'Knee_Left_Main', label: '왼쪽 무릎', x: 75, y: 220, r: 9, side: 'both', group: 'Knee', defaultSide: 'Left', labelXOffset: -41, labelYOffset: -15 },
  { id: 'Foot_Left_Main', label: '왼발목/발', x: 62, y: 290, r: 8, side: 'both', group: 'Foot', defaultSide: 'Left', labelXOffset: -28, labelYOffset: -20 },

  // Right side (Body's Right -> Screen's Right)
  { id: 'Shoulder_Right_Main', label: '오른쪽 어깨', x: 135, y: 80, r: 9, side: 'both', group: 'Shoulder', defaultSide: 'Right', labelXOffset: 31, labelYOffset: -25 },
  { id: 'Wrist_Right_Main', label: '오른손목/손', x: 158, y: 155, r: 8, side: 'both', group: 'Wrist', defaultSide: 'Right', labelXOffset: 8, labelYOffset: -30 },
  { id: 'Knee_Right_Main', label: '오른쪽 무릎', x: 125, y: 220, r: 9, side: 'both', group: 'Knee', defaultSide: 'Right', labelXOffset: 41, labelYOffset: -15 },
  { id: 'Foot_Right_Main', label: '오른발목/발', x: 138, y: 290, r: 8, side: 'both', group: 'Foot', defaultSide: 'Right', labelXOffset: 28, labelYOffset: -20 },

  { id: 'Back', label: '등/허리', x: 100, y: 130, r: 12, side: 'back', group: 'Back', labelXOffset: -52, labelYOffset: -15 },
];

export default function BodyMap({ selectedPart, onChange }: BodyMapProps) {
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Sides for detailed selectors
  const [handSide, setHandSide] = useState<'Left' | 'Right'>('Right');
  const [footSide, setFootSide] = useState<'Left' | 'Right'>('Right');
  const [kneeSide, setKneeSide] = useState<'Left' | 'Right'>('Right');
  const [armSide, setArmSide] = useState<'Left' | 'Right'>('Right');
  const [headSide, setHeadSide] = useState<'Front' | 'Back'>('Front');

  // Auto-open group when selectedPart changes from outside
  useEffect(() => {
    if (selectedPart && BODY_PARTS_MAP[selectedPart]) {
      const part = BODY_PARTS_MAP[selectedPart];
      if (part.baseCategory === 'Head') {
        setActiveGroup('Head');
        if (part.id === 'Head_Back' || part.id === 'Head_Crown') {
          setHeadSide('Back');
        } else {
          setHeadSide('Front');
        }
      }
      else if (part.baseCategory === 'Neck') setActiveGroup('Neck');
      else if (part.baseCategory === 'Shoulder') {
        setActiveGroup('Shoulder');
        if (part.id.includes('Left')) setArmSide('Left');
        else if (part.id.includes('Right')) setArmSide('Right');
      }
      else if (part.baseCategory === 'Wrist') {
        setActiveGroup('Wrist');
        if (part.id.includes('Left')) setHandSide('Left');
        else if (part.id.includes('Right')) setHandSide('Right');
      } else if (part.baseCategory === 'Back') setActiveGroup('Back');
      else if (part.baseCategory === 'Knee') {
        if (part.id.startsWith('Foot')) {
          setActiveGroup('Foot');
          if (part.id.includes('Left')) setFootSide('Left');
          else if (part.id.includes('Right')) setFootSide('Right');
        } else {
          setActiveGroup('Knee');
          if (part.id.includes('Left')) setKneeSide('Left');
          else if (part.id.includes('Right')) setKneeSide('Right');
        }
      }
    }
  }, [selectedPart]);

  const visibleZones = MAIN_ZONES.filter(
    (zone) => zone.side === 'both' || zone.side === viewSide
  );

  const filteredParts = searchTerm.trim() === ''
    ? []
    : BODY_PARTS_LIST.filter(part => 
        part.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.group.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const getActiveGroupLabel = (group: string) => {
    switch (group) {
      case 'Head': return '머리 및 얼굴';
      case 'Neck': return '목 및 경추';
      case 'Shoulder': return '어깨 및 팔';
      case 'Wrist': return '손목 및 손가락 마디';
      case 'Back': return '등, 허리 및 골반';
      case 'Knee': return '무릎 및 다리';
      case 'Foot': return '발목, 발바닥 및 발가락';
      default: return '';
    }
  };

  const handleBackToMain = () => {
    setActiveGroup(null);
    setSearchTerm('');
  };

  const isPartSelectedInGroup = (zone: BodyZone): boolean => {
    if (!selectedPart) return false;
    const detail = BODY_PARTS_MAP[selectedPart];
    if (!detail) return false;
    
    let matchesGroup = false;
    if (zone.group === 'Foot') {
      matchesGroup = detail.id.startsWith('Foot');
    } else if (zone.group === 'Knee') {
      matchesGroup = detail.baseCategory === 'Knee' && !detail.id.startsWith('Foot');
    } else {
      matchesGroup = detail.baseCategory === zone.group;
    }
    
    if (!matchesGroup) return false;
    if (zone.defaultSide) {
      return detail.id.includes(zone.defaultSide);
    }
    return true;
  };

  return (
    <div className="flex flex-col items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md mx-auto transition-all">
      
      {/* 🔍 Search Input */}
      <div className="w-full mb-4 relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 text-xs">
          🔍
        </div>
        <input
          type="text"
          placeholder="아픈 부위를 검색해보세요 (예: 검지, 관자놀이)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs pl-8 pr-8 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 placeholder:text-slate-400"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* 🔍 Search Results Overlay */}
      {searchTerm.trim() !== '' && (
        <div className="w-full max-h-48 overflow-y-auto border border-slate-100 rounded-xl bg-white shadow-lg p-2 z-10 space-y-1 mb-4">
          <div className="text-[10px] text-slate-400 font-bold px-2 pb-1 border-b border-slate-50">
            검색 결과 ({filteredParts.length}건)
          </div>
          {filteredParts.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-4">일치하는 부위가 없습니다.</div>
          ) : (
            filteredParts.map(part => {
              const isSelected = selectedPart === part.id;
              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => {
                    onChange(part.id);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                    isSelected 
                      ? 'bg-blue-50 text-blue-700 font-bold' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{part.label}</span>
                  <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md font-normal">
                    {part.group}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Main View: Whole Body Map */}
      {!activeGroup ? (
        <div className="w-full flex flex-col items-center">
          <div className="flex justify-between items-center w-full mb-3">
            <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <span>🧍</span> 아픈 신체 대분류 터치
            </span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-100">
              <button
                type="button"
                onClick={() => setViewSide('front')}
                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
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
                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                  viewSide === 'back'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                뒷면 (Back)
              </button>
            </div>
          </div>

          <div className="relative w-full aspect-[4/5] flex items-center justify-center py-2 max-h-[300px]">
            {/* SVG Graphic Body Outline */}
            <svg
              viewBox="0 0 200 320"
              className="w-full h-full max-h-[290px] select-none"
            >
              <defs>
                <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
              </defs>

              {/* Realistic stylized body silhouette */}
              {viewSide === 'front' ? (
                <path d="
                  M100,15 
                  C108,15 115,20 115,30 C115,38 108,46 100,46 C92,46 85,38 85,30 C85,20 92,15 100,15 Z
                  M93,46 Q80,52 68,62 Q55,72 50,85 L44,128 C42,136 41,144 44,149 C46,153 51,154 53,151 C55,149 56,144 57,139 L63,94 C64,88 68,82 74,80 C74,80 75,120 75,160 C75,160 68,205 60,285 C59,291 63,294 67,292 C70,290 73,285 76,260 L85,200 C86,192 90,172 95,172 L98,172 L98,80 L102,80 L102,172 L105,172 C110,172 114,192 115,200 L124,260 C127,285 130,290 133,292 C137,294 141,291 140,285 C132,205 125,160 125,160 C125,120 126,80 126,80 C132,82 136,88 137,94 L143,139 C144,144 145,149 147,151 C149,154 154,153 156,149 C159,144 158,136 156,128 L150,85 C145,72 132,72 119,62 Q107,52 107,46 Z
                " fill="url(#bodyGradient)" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <g>
                  {/* Back Silhouette */}
                  <path d="
                    M100,15 
                    C108,15 115,20 115,30 C115,38 108,46 100,46 C92,46 85,38 85,30 C85,20 92,15 100,15 Z
                    M93,46 Q80,52 68,62 Q55,72 50,85 L44,128 C42,136 41,144 44,149 C46,153 51,154 53,151 C55,149 56,144 57,139 L63,94 C64,88 68,82 74,80 C74,80 75,120 75,160 C75,160 68,205 60,285 C59,291 63,294 67,292 C70,290 73,285 76,260 L85,200 C86,192 90,172 95,172 L98,172 L98,80 L102,80 L102,172 L105,172 C110,172 114,192 115,200 L124,260 C127,285 130,290 133,292 C137,294 141,291 140,285 C132,205 125,160 125,160 C125,120 126,80 126,80 C132,82 136,88 137,94 L143,139 C144,144 145,149 147,151 C149,154 154,153 156,149 C159,144 158,136 156,128 L150,85 C145,72 132,72 119,62 Q107,52 107,46 Z
                  " fill="url(#bodyGradient)" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Spine representation */}
                  <path d="M100,46 L100,170" stroke="#b4c6e7" strokeWidth="3.5" strokeDasharray="3 3" />
                  {/* Scapula contours */}
                  <path d="M78,65 C85,70 95,72 100,72 C105,72 115,70 122,65" fill="none" stroke="#b4c6e7" strokeWidth="1.5" />
                  <path d="M75,160 Q100,168 125,160" fill="none" stroke="#b4c6e7" strokeWidth="1.5" />
                </g>
              )}

              {/* Render interactive hotspot nodes and leader lines */}
              {visibleZones.map((zone) => {
                const isSelected = isPartSelectedInGroup(zone);
                const labelX = zone.x + (zone.labelXOffset || 0);
                const labelY = zone.y + (zone.labelYOffset || 0);
                
                return (
                  <g
                    key={zone.id}
                    onClick={() => {
                      setActiveGroup(zone.group);
                      if (zone.defaultSide) {
                        if (zone.group === 'Shoulder') setArmSide(zone.defaultSide);
                        else if (zone.group === 'Wrist') setHandSide(zone.defaultSide);
                        else if (zone.group === 'Knee') setKneeSide(zone.defaultSide);
                        else if (zone.group === 'Foot') setFootSide(zone.defaultSide);
                      }
                    }}
                    className="cursor-pointer group/node"
                  >
                    {/* Leader Line (from label center to node center) */}
                    <path
                      d={`M${zone.x},${zone.y} L${labelX},${labelY}`}
                      stroke={isSelected ? '#3b82f6' : '#cbd5e1'}
                      strokeWidth="1.2"
                      strokeDasharray="2.5 2"
                      opacity={isSelected ? "1" : "0.6"}
                      className="transition-colors duration-150 group-hover/node:stroke-blue-400 group-hover/node:opacity-100"
                    />

                    {/* Visual pulse for selected item */}
                    {isSelected && (
                      <circle
                        cx={zone.x}
                        cy={zone.y}
                        r={zone.r * 1.8}
                        fill="#3b82f6"
                        opacity="0.3"
                        className="animate-ping origin-center"
                        style={{ transformOrigin: `${zone.x}px ${zone.y}px` }}
                      />
                    )}

                    {/* Hotspot Touch Area */}
                    <circle
                      cx={zone.x}
                      cy={zone.y}
                      r={Math.max(zone.r * 1.5, 20)}
                      fill="transparent"
                      className="pointer-events-all"
                    />

                    {/* Visible indicator circle */}
                    <circle
                      cx={zone.x}
                      cy={zone.y}
                      r={zone.r}
                      fill={isSelected ? '#3b82f6' : '#ffffff'}
                      stroke={isSelected ? '#2563eb' : '#64748b'}
                      strokeWidth={isSelected ? '3' : '2'}
                      className="transition-all duration-200 group-hover/node:scale-125 group-hover/node:stroke-blue-500"
                      style={{ transformOrigin: `${zone.x}px ${zone.y}px` }}
                    />

                    {/* Text Label Box centered on labelX, labelY */}
                    <rect
                      x={labelX - 30}
                      y={labelY - 9}
                      width="60"
                      height="18"
                      rx="5"
                      fill={isSelected ? '#eff6ff' : '#ffffff'}
                      stroke={isSelected ? '#3b82f6' : '#cbd5e1'}
                      strokeWidth="1.2"
                      className="transition-all duration-150 group-hover/node:stroke-blue-400 group-hover/node:shadow-2xs"
                    />
                    <text
                      x={labelX}
                      y={labelY + 4}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill={isSelected ? '#1d4ed8' : '#475569'}
                      className="select-none font-sans transition-colors group-hover/node:fill-blue-600"
                    >
                      {zone.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating tooltip/hint */}
            <div className="absolute bottom-1 bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full text-[10px] text-slate-500 text-center select-none shadow-2xs">
              {selectedPart 
                ? <span className="font-bold text-blue-600">현재 선택: {getPartLabel(selectedPart)}</span>
                : '몸에서 아픈 곳을 누르고 상세 부위를 지정하세요.'
              }
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Sub-selector View */
        <div className="w-full flex flex-col items-center animate-fadeIn">
          {/* Header & Back navigation */}
          <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <button
              type="button"
              onClick={handleBackToMain}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>←</span>
              <span>전체 몸 선택</span>
            </button>
            <span className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-full">
              📍 {getActiveGroupLabel(activeGroup)}
            </span>
          </div>

          {/* Render corresponding detailed graphic */}
          <div className="w-full flex flex-col items-center min-h-[260px] justify-center">
            
            {/* 1. HEAD & FACE DETAILED SELECTOR */}
            {activeGroup === 'Head' && (
              <div className="w-full flex flex-col items-center">
                <p className="text-[10px] text-slate-400 mb-3 text-center">두통이나 얼굴 통증이 발생하는 정확한 구역을 선택하세요.</p>
                
                {/* Front/Back toggle */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg mb-3">
                  <button
                    type="button"
                    onClick={() => setHeadSide('Front')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                      headSide === 'Front' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    얼굴/앞쪽 (Face/Front)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeadSide('Back')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                      headSide === 'Back' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    뒷머리/뒤쪽 (Back of Head)
                  </button>
                </div>

                <div className="relative w-full max-w-[240px] aspect-square">
                  {headSide === 'Front' ? (
                    <svg viewBox="0 0 200 200" className="w-full h-full text-slate-200">
                      {/* Neck */}
                      <path d="M84,150 L84,176 L116,176 L116,150" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                      {/* Face Contour */}
                      <path d="M60,60 C 60,20, 140,20, 140,60 C 140,90, 130,130, 100,156 C 70,130, 60,90, 60,60 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                      {/* Left/Right Ears */}
                      <path d="M60,70 C 50,70, 50,50, 60,50" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                      <path d="M140,70 C 150,70, 150,50, 140,50" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                      
                      {/* Eyes outline */}
                      <ellipse cx="80" cy="80" rx="8" ry="4" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                      <ellipse cx="120" cy="80" rx="8" ry="4" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                      {/* Nose outline */}
                      <path d="M100,76 L96,96 L104,96" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                      {/* Mouth outline */}
                      <path d="M86,122 Q100,128 114,122" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

                      {/* Nodes */}
                      {[
                        { id: 'Head_Forehead', label: '이마', cx: 100, cy: 35, r: 10 },
                        { id: 'Head_Temple_Left', label: '왼쪽 관자', cx: 45, cy: 45, r: 9 },
                        { id: 'Head_Temple_Right', label: '오른쪽 관자', cx: 155, cy: 45, r: 9 },
                        { id: 'Head_Eye_Left', label: '왼쪽 눈', cx: 80, cy: 74, r: 8 },
                        { id: 'Head_Eye_Right', label: '오른쪽 눈', cx: 120, cy: 74, r: 8 },
                        { id: 'Head_Nose', label: '코', cx: 100, cy: 90, r: 8 },
                        { id: 'Head_Cheek_Left', label: '왼쪽 볼', cx: 68, cy: 105, r: 9 },
                        { id: 'Head_Cheek_Right', label: '오른쪽 볼', cx: 132, cy: 105, r: 9 },
                        { id: 'Head_Mouth', label: '입/입술', cx: 100, cy: 122, r: 8 },
                        { id: 'Head_Ear_Left', label: '왼쪽 귀', cx: 32, cy: 60, r: 8 },
                        { id: 'Head_Ear_Right', label: '오른쪽 귀', cx: 168, cy: 60, r: 8 },
                        { id: 'Head_Jaw', label: '턱/관절', cx: 100, cy: 152, r: 10 },
                      ].map(node => {
                        const isSelected = selectedPart === node.id;
                        return (
                          <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                            <circle cx={node.cx} cy={node.cy} r={node.r + 8} fill="transparent" />
                            <circle
                              cx={node.cx}
                              cy={node.cy}
                              r={node.r}
                              fill={isSelected ? '#3b82f6' : '#ffffff'}
                              stroke={isSelected ? '#2563eb' : '#94a3b8'}
                              strokeWidth={isSelected ? '3' : '2'}
                              className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-110 origin-center"
                              style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                            />
                            <text
                              x={node.cx}
                              y={node.cy + node.r + 11}
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="bold"
                              fill={isSelected ? '#1d4ed8' : '#475569'}
                              className="pointer-events-none select-none font-sans"
                            >
                              {node.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  ) : (
                    <svg viewBox="0 0 200 200" className="w-full h-full text-slate-200">
                      {/* Neck */}
                      <path d="M84,150 L84,176 L116,176 L116,150" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                      {/* Back of Head Contour */}
                      <path d="M60,60 C 60,20, 140,20, 140,60 C 140,90, 130,130, 100,156 C 70,130, 60,90, 60,60 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                      {/* Left/Right Ears from Back */}
                      <path d="M60,70 C 52,70, 52,50, 60,50" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                      <path d="M140,70 C 148,70, 148,50, 140,50" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                      
                      {/* Back of head hair/structure detail */}
                      <path d="M64,60 C 70,30, 130,30, 136,60 C 140,84, 130,116, 100,132 C 70,116, 60,84, 64,60 Z" fill="#e2e8f0" opacity="0.4" stroke="#cbd5e1" strokeWidth="1" />

                      {/* Nodes */}
                      {[
                        { id: 'Head_Crown', label: '정수리', cx: 100, cy: 32, r: 11 },
                        { id: 'Head_Temple_Left', label: '왼쪽 관자', cx: 45, cy: 55, r: 9 },
                        { id: 'Head_Temple_Right', label: '오른쪽 관자', cx: 155, cy: 55, r: 9 },
                        { id: 'Head_Back', label: '뒷머리 (후두부)', cx: 100, cy: 90, r: 12 },
                      ].map(node => {
                        const isSelected = selectedPart === node.id;
                        return (
                          <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                            <circle cx={node.cx} cy={node.cy} r={node.r + 8} fill="transparent" />
                            <circle
                              cx={node.cx}
                              cy={node.cy}
                              r={node.r}
                              fill={isSelected ? '#3b82f6' : '#ffffff'}
                              stroke={isSelected ? '#2563eb' : '#94a3b8'}
                              strokeWidth={isSelected ? '3' : '2'}
                              className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-110 origin-center"
                              style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                            />
                            <text
                              x={node.cx}
                              y={node.cy + node.r + 12}
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="bold"
                              fill={isSelected ? '#1d4ed8' : '#475569'}
                              className="pointer-events-none select-none font-sans"
                            >
                              {node.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>
              </div>
            )}

            {/* 2. NECK DETAILED SELECTOR */}
            {activeGroup === 'Neck' && (
              <div className="w-full flex flex-col items-center">
                <p className="text-[10px] text-slate-400 mb-4 text-center">경추 디스크나 목덜미 근육이 뻐근한 상세 위치를 짚어주세요.</p>
                <div className="relative w-full max-w-[240px] aspect-square">
                  <svg viewBox="0 0 200 200" className="w-full h-full text-slate-200">
                    {/* Head bottom & Neck outline */}
                    <path d="M 60,30 C 60,30, 60,60, 100,70 C 140,60, 140,30, 140,30" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
                    {/* Shoulders line */}
                    <path d="M 20,140 C 50,100, 80,90, 100,90 C 120,90, 150,100, 180,140" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
                    
                    {/* Cervical spine vertebrae drawing (Vertebra C1 - C7) */}
                    <g fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5">
                      <rect x="91" y="85" width="18" height="8" rx="2" />
                      <rect x="91" y="97" width="18" height="8" rx="2" />
                      <rect x="91" y="109" width="18" height="8" rx="2" />
                      <rect x="91" y="121" width="18" height="8" rx="2" />
                    </g>

                    {/* Nodes */}
                    {[
                      { id: 'Neck_Cervical', label: '경추 중심 (목 뒤)', cx: 100, cy: 115, r: 12 },
                      { id: 'Neck_Left', label: '왼쪽 목덜미', cx: 60, cy: 115, r: 11 },
                      { id: 'Neck_Right', label: '오른쪽 목덜미', cx: 140, cy: 115, r: 11 },
                      { id: 'Neck_Front', label: '목 앞쪽 (인후부)', cx: 100, cy: 55, r: 11 },
                    ].map(node => {
                      const isSelected = selectedPart === node.id;
                      return (
                        <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                          <circle cx={node.cx} cy={node.cy} r={node.r + 8} fill="transparent" />
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={node.r}
                            fill={isSelected ? '#3b82f6' : '#ffffff'}
                            stroke={isSelected ? '#2563eb' : '#94a3b8'}
                            strokeWidth={isSelected ? '3' : '2'}
                            className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-110 origin-center"
                            style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                          />
                          <text
                            x={node.cx}
                            y={node.cy + node.r + 12}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="bold"
                            fill={isSelected ? '#1d4ed8' : '#475569'}
                            className="pointer-events-none select-none font-sans"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

            {/* 3. SHOULDER & ARM DETAILED SELECTOR */}
            {activeGroup === 'Shoulder' && (
              <div className="w-full flex flex-col items-center">
                <p className="text-[10px] text-slate-400 mb-3 text-center">승모근, 어깨관절 또는 팔꿈치 통증을 선택하세요.</p>
                <div className="flex bg-slate-100 p-0.5 rounded-lg mb-3">
                  <button
                    type="button"
                    onClick={() => setArmSide('Left')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                      armSide === 'Left' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    왼쪽 (Left)
                  </button>
                  <button
                    type="button"
                    onClick={() => setArmSide('Right')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                      armSide === 'Right' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    오른쪽 (Right)
                  </button>
                </div>

                <div className="relative w-full max-w-[240px] aspect-square">
                  <svg viewBox="0 0 200 200" className="w-full h-full text-slate-200">
                    {/* Torso & Shoulder outline */}
                    <path d="M 100,30 Q 80,30, 60,50 Q 30,70, 30,130" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                    <path d="M 100,30 Q 120,30, 140,50 Q 170,70, 170,130" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                    
                    {/* Left/Right Arm graphics based on side */}
                    {armSide === 'Left' ? (
                      <path d="M 30,130 L 20,180" fill="none" stroke="#cbd5e1" strokeWidth="5" />
                    ) : (
                      <path d="M 170,130 L 180,180" fill="none" stroke="#cbd5e1" strokeWidth="5" />
                    )}

                    {/* Nodes mapping to Left/Right side */}
                    {[
                      { 
                        id: armSide === 'Left' ? 'Shoulder_Left' : 'Shoulder_Right', 
                        label: armSide === 'Left' ? '왼쪽 승모근/어깨' : '오른쪽 승모근/어깨',
                        cx: armSide === 'Left' ? 50 : 150, cy: 60, r: 12 
                      },
                      { 
                        id: armSide === 'Left' ? 'Arm_Left_Elbow' : 'Arm_Right_Elbow', 
                        label: armSide === 'Left' ? '왼쪽 팔꿈치' : '오른쪽 팔꿈치',
                        cx: armSide === 'Left' ? 32 : 168, cy: 120, r: 11 
                      },
                      { 
                        id: armSide === 'Left' ? 'Arm_Left_Forearm' : 'Arm_Right_Forearm', 
                        label: armSide === 'Left' ? '왼쪽 팔뚝' : '오른쪽 팔뚝',
                        cx: armSide === 'Left' ? 20 : 180, cy: 170, r: 11 
                      },
                    ].map(node => {
                      const isSelected = selectedPart === node.id;
                      return (
                        <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                          <circle cx={node.cx} cy={node.cy} r={node.r + 8} fill="transparent" />
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={node.r}
                            fill={isSelected ? '#3b82f6' : '#ffffff'}
                            stroke={isSelected ? '#2563eb' : '#94a3b8'}
                            strokeWidth={isSelected ? '3' : '2'}
                            className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-110 origin-center"
                            style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                          />
                          <text
                            x={node.cx}
                            y={node.cy + node.r + 12}
                            textAnchor="middle"
                            fontSize="8.5"
                            fontWeight="bold"
                            fill={isSelected ? '#1d4ed8' : '#475569'}
                            className="pointer-events-none select-none font-sans"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

            {/* 4. WRIST & HAND DETAILED SELECTOR */}
            {activeGroup === 'Wrist' && (
              <div className="w-full flex flex-col items-center">
                <p className="text-[10px] text-slate-400 mb-3 text-center">타건이 많은 개발자를 위해 손가락 마디마디까지 정밀 선택이 가능합니다.</p>
                
                {/* Left/Right Hand Tab Toggle */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg mb-3">
                  <button
                    type="button"
                    onClick={() => setHandSide('Left')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                      handSide === 'Left' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    왼손 (Left Hand)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHandSide('Right')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                      handSide === 'Right' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    오른손 (Right Hand)
                  </button>
                </div>

                {/* Hand SVG Diagram with Joints */}
                <div className="relative w-full max-w-[280px] aspect-[4/5] bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-inner">
                  <svg viewBox="0 0 160 200" className="w-full h-full text-slate-200">
                    <path
                      d="M 50 180 C 50 180, 20 150, 20 100 C 20 70, 30 65, 35 65 C 37 90, 42 90, 42 60 C 42 45, 52 45, 52 60 C 52 90, 58 90, 58 52 C 58 35, 68 35, 68 52 C 68 90, 74 90, 74 58 C 74 42, 84 42, 84 58 C 84 90, 90 90, 90 70 C 90 55, 100 55, 100 70 C 100 110, 105 110, 110 100 C 120 80, 130 90, 125 115 C 120 135, 110 180, 110 180"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      transform={handSide === 'Left' ? "translate(160, 0) scale(-1, 1)" : undefined}
                    />
                    
                    {/* Wrist & Palm Nodes */}
                    {[
                      { id: handSide === 'Left' ? 'Wrist_Left' : 'Wrist_Right', label: '손목', cx: 80, cy: 180, r: 8 },
                      { id: handSide === 'Left' ? 'Hand_Left_Palm' : 'Hand_Right_Palm', label: '손바닥/등', cx: 75, cy: 135, r: 8 }
                    ].map(node => {
                      const isSelected = selectedPart === node.id;
                      const cxVal = handSide === 'Left' ? 160 - node.cx : node.cx;
                      return (
                        <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                          <circle cx={cxVal} cy={node.cy} r={node.r + 5} fill="transparent" />
                          <circle
                            cx={cxVal}
                            cy={node.cy}
                            r={node.r}
                            fill={isSelected ? '#3b82f6' : '#ffffff'}
                            stroke={isSelected ? '#2563eb' : '#64748b'}
                            strokeWidth={isSelected ? '2.5' : '1.5'}
                            className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-115"
                            style={{ transformOrigin: `${cxVal}px ${node.cy}px` }}
                          />
                          <text
                            x={cxVal}
                            y={node.cy + node.r + 11}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="bold"
                            fill={isSelected ? '#1d4ed8' : '#475569'}
                            className="pointer-events-none select-none font-sans"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Finger Joints Nodes */}
                    {[
                      // Thumb (엄지)
                      { id: `Hand_${handSide}_Thumb_Joint1`, label: '엄지1', cx: 120, cy: 100, r: 4.5 },
                      { id: `Hand_${handSide}_Thumb_Joint2`, label: '엄지2', cx: 110, cy: 120, r: 4.5 },
                      
                      // Index (검지)
                      { id: `Hand_${handSide}_Index_Joint1`, label: '검지1', cx: 96, cy: 62, r: 4 },
                      { id: `Hand_${handSide}_Index_Joint2`, label: '검지2', cx: 94, cy: 82, r: 4 },
                      { id: `Hand_${handSide}_Index_Joint3`, label: '검지3', cx: 92, cy: 102, r: 4 },
                      
                      // Middle (중지)
                      { id: `Hand_${handSide}_Middle_Joint1`, label: '중지1', cx: 78, cy: 45, r: 4 },
                      { id: `Hand_${handSide}_Middle_Joint2`, label: '중지2', cx: 77, cy: 67, r: 4 },
                      { id: `Hand_${handSide}_Middle_Joint3`, label: '중지3', cx: 76, cy: 92, r: 4 },

                      // Ring (약지)
                      { id: `Hand_${handSide}_Ring_Joint1`, label: '약지1', cx: 58, cy: 49, r: 4 },
                      { id: `Hand_${handSide}_Ring_Joint2`, label: '약지2', cx: 58, cy: 71, r: 4 },
                      { id: `Hand_${handSide}_Ring_Joint3`, label: '약지3', cx: 59, cy: 95, r: 4 },

                      // Pinky (새끼)
                      { id: `Hand_${handSide}_Pinky_Joint1`, label: '새끼1', cx: 37, cy: 64, r: 3.5 },
                      { id: `Hand_${handSide}_Pinky_Joint2`, label: '새끼2', cx: 39, cy: 83, r: 3.5 },
                      { id: `Hand_${handSide}_Pinky_Joint3`, label: '새끼3', cx: 41, cy: 102, r: 3.5 },
                    ].map(node => {
                      const isSelected = selectedPart === node.id;
                      const cxVal = handSide === 'Left' ? 160 - node.cx : node.cx;
                      return (
                        <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                          <circle cx={cxVal} cy={node.cy} r={node.r + 4} fill="transparent" />
                          <circle
                            cx={cxVal}
                            cy={node.cy}
                            r={node.r}
                            fill={isSelected ? '#3b82f6' : '#ffffff'}
                            stroke={isSelected ? '#2563eb' : '#64748b'}
                            strokeWidth={isSelected ? '2' : '1'}
                            className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-120"
                            style={{ transformOrigin: `${cxVal}px ${node.cy}px` }}
                          />
                          <text
                            x={cxVal}
                            y={node.cy - node.r - 2}
                            textAnchor="middle"
                            fontSize="5.5"
                            fontWeight="bold"
                            fill={isSelected ? '#1d4ed8' : '#64748b'}
                            className="pointer-events-none select-none font-sans"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

            {/* 5. BACK & SPINE DETAILED SELECTOR */}
            {activeGroup === 'Back' && (
              <div className="w-full flex flex-col items-center">
                <p className="text-[10px] text-slate-400 mb-4 text-center">등 윗부분(흉추), 허리(요추), 골반까지 척추 라인을 따라 선택 가능합니다.</p>
                <div className="relative w-full max-w-[240px] aspect-[4/5]">
                  <svg viewBox="0 0 200 240" className="w-full h-full text-slate-200">
                    {/* Spine backbone outline */}
                    <rect x="94" y="20" width="12" height="190" rx="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
                    
                    {/* Rib cage outline */}
                    <path d="M 94,60 C 70,50, 50,70, 50,100 C 50,120, 70,130, 94,130" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                    <path d="M 106,60 C 130,50, 150,70, 150,100 C 150,120, 130,130, 106,130" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                    
                    {/* Pelvis bone outline */}
                    <path d="M 70,180 C 70,170, 90,160, 100,160 C 110,160, 130,170, 130,180 C 130,200, 100,210, 70,180" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />

                    {/* Nodes */}
                    {[
                      { id: 'Back_Thoracic', label: '등 윗부분 (흉추)', cx: 100, cy: 76, r: 12 },
                      { id: 'Back_Lumbar', label: '허리 (요추)', cx: 100, cy: 140, r: 12 },
                      { id: 'Back_Pelvis', label: '골반 및 꼬리뼈', cx: 100, cy: 190, r: 12 },
                    ].map(node => {
                      const isSelected = selectedPart === node.id;
                      return (
                        <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                          <circle cx={node.cx} cy={node.cy} r={node.r + 8} fill="transparent" />
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={node.r}
                            fill={isSelected ? '#3b82f6' : '#ffffff'}
                            stroke={isSelected ? '#2563eb' : '#94a3b8'}
                            strokeWidth={isSelected ? '3' : '2'}
                            className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-110 origin-center"
                            style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                          />
                          <text
                            x={node.cx}
                            y={node.cy + node.r + 12}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="bold"
                            fill={isSelected ? '#1d4ed8' : '#475569'}
                            className="pointer-events-none select-none font-sans"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

            {/* 6. KNEE & LEG DETAILED SELECTOR */}
            {activeGroup === 'Knee' && (
              <div className="w-full flex flex-col items-center">
                <p className="text-[10px] text-slate-400 mb-3 text-center">무릎 부근, 허벅지, 종아리 통증 위치를 체크해 주세요.</p>
                <div className="flex bg-slate-100 p-0.5 rounded-lg mb-3">
                  <button
                    type="button"
                    onClick={() => setKneeSide('Left')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                      kneeSide === 'Left' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    왼쪽 다리 (Left)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKneeSide('Right')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                      kneeSide === 'Right' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    오른쪽 다리 (Right)
                  </button>
                </div>

                <div className="relative w-full max-w-[240px] aspect-[4/5]">
                  <svg viewBox="0 0 200 240" className="w-full h-full text-slate-200">
                    {/* Leg outline based on side */}
                    {kneeSide === 'Left' ? (
                      <path d="M 80,20 L 64,90 L 70,160 L 60,220" fill="none" stroke="#cbd5e1" strokeWidth="5" />
                    ) : (
                      <path d="M 120,20 L 136,90 L 130,160 L 140,220" fill="none" stroke="#cbd5e1" strokeWidth="5" />
                    )}

                    {/* Nodes */}
                    {[
                      { 
                        id: kneeSide === 'Left' ? 'Leg_Left_Thigh' : 'Leg_Right_Thigh', 
                        label: kneeSide === 'Left' ? '왼쪽 허벅지' : '오른쪽 허벅지',
                        cx: kneeSide === 'Left' ? 72 : 128, cy: 50, r: 12 
                      },
                      { 
                        id: kneeSide === 'Left' ? 'Knee_Left' : 'Knee_Right', 
                        label: kneeSide === 'Left' ? '왼쪽 무릎' : '오른쪽 무릎',
                        cx: kneeSide === 'Left' ? 66 : 134, cy: 120, r: 13 
                      },
                      { 
                        id: kneeSide === 'Left' ? 'Leg_Left_Calf' : 'Leg_Right_Calf', 
                        label: kneeSide === 'Left' ? '왼쪽 종아리' : '오른쪽 종아리',
                        cx: kneeSide === 'Left' ? 66 : 134, cy: 184, r: 11 
                      },
                    ].map(node => {
                      const isSelected = selectedPart === node.id;
                      return (
                        <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                          <circle cx={node.cx} cy={node.cy} r={node.r + 8} fill="transparent" />
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={node.r}
                            fill={isSelected ? '#3b82f6' : '#ffffff'}
                            stroke={isSelected ? '#2563eb' : '#94a3b8'}
                            strokeWidth={isSelected ? '3' : '2'}
                            className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-110 origin-center"
                            style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                          />
                          <text
                            x={node.cx}
                            y={node.cy + node.r + 12}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="bold"
                            fill={isSelected ? '#1d4ed8' : '#475569'}
                            className="pointer-events-none select-none font-sans"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

            {/* 7. FOOT & ANKLE DETAILED SELECTOR */}
            {activeGroup === 'Foot' && (
              <div className="w-full flex flex-col items-center">
                <p className="text-[10px] text-slate-400 mb-3 text-center">발가락 마디, 발목, 발바닥(족저근막), 아치 등 세부 부위를 지정하세요.</p>
                
                {/* Left/Right Foot Side Toggle */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg mb-3">
                  <button
                    type="button"
                    onClick={() => setFootSide('Left')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                      footSide === 'Left' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    왼발 (Left Foot)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFootSide('Right')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                      footSide === 'Right' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    오른발 (Right Foot)
                  </button>
                </div>

                <div className="relative w-full max-w-[240px] aspect-square">
                  <svg viewBox="0 0 200 200" className="w-full h-full text-slate-200">
                    {/* Foot outline graphic - Mirrored for Left Foot */}
                    <path
                      d="M 90,170 C 70,170, 60,150, 60,120 C 60,90, 70,60, 64,40 C 66,30, 74,30, 76,40 C 80,56, 88,56, 90,40 C 92,32, 98,32, 100,40 C 102,56, 108,56, 110,42 M 110,42 C 112,36, 118,36, 120,44 C 122,56, 128,56, 130,46 C 132,40, 138,40, 140,48 C 142,60, 144,80, 140,110 C 136,140, 130,160, 110,170 Z"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2.5"
                      transform={footSide === 'Left' ? "translate(200, 0) scale(-1, 1)" : undefined}
                    />

                    {/* Nodes */}
                    {[
                      { id: `Foot_${footSide}_Ankle`, label: '발목', cx: 100, cy: 165, r: 12 },
                      { id: `Foot_${footSide}_Sole`, label: '발바닥 (족저)', cx: 100, cy: 76, r: 12 },
                      { id: `Foot_${footSide}_Heel`, label: '발뒤꿈치', cx: 100, cy: 135, r: 12 },
                      { id: `Foot_${footSide}_Toes`, label: '발가락 전체', cx: 100, cy: 54, r: 10 },
                      { id: `Foot_${footSide}_BigToe`, label: '엄지', cx: 70, cy: 30, r: 8 },
                      { id: `Foot_${footSide}_IndexToe`, label: '검지', cx: 88, cy: 28, r: 7 },
                      { id: `Foot_${footSide}_MiddleToe`, label: '중지', cx: 104, cy: 30, r: 7 },
                      { id: `Foot_${footSide}_RingToe`, label: '약지', cx: 120, cy: 34, r: 7 },
                      { id: `Foot_${footSide}_PinkyToe`, label: '새끼', cx: 136, cy: 40, r: 6 },
                      { id: `Foot_${footSide}_Arch`, label: '발아치', cx: 76, cy: 105, r: 9 },
                    ].map(node => {
                      const isSelected = selectedPart === node.id;
                      const cxVal = footSide === 'Left' ? 200 - node.cx : node.cx;
                      return (
                        <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                          <circle cx={cxVal} cy={node.cy} r={node.r + 6} fill="transparent" />
                          <circle
                            cx={cxVal}
                            cy={node.cy}
                            r={node.r}
                            fill={isSelected ? '#3b82f6' : '#ffffff'}
                            stroke={isSelected ? '#2563eb' : '#94a3b8'}
                            strokeWidth={isSelected ? '3' : '2'}
                            className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-110 origin-center"
                            style={{ transformOrigin: `${cxVal}px ${node.cy}px` }}
                          />
                          <text
                            x={cxVal}
                            y={node.cy + node.r + 11}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="bold"
                            fill={isSelected ? '#1d4ed8' : '#475569'}
                            className="pointer-events-none select-none font-sans"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

          </div>

          {/* Quick List for Group */}
          <div className="w-full border-t border-slate-100 pt-3 mt-4 space-y-2">
            <div className="text-[10px] text-slate-400 font-bold px-1 uppercase tracking-wider">
              {getActiveGroupLabel(activeGroup)} 세부 목록
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
              {BODY_PARTS_LIST.filter(part => {
                if (activeGroup === 'Foot') return part.id.startsWith('Foot');
                if (activeGroup === 'Knee') return part.baseCategory === 'Knee' && !part.id.startsWith('Foot');
                return part.baseCategory === activeGroup;
              }).map(part => {
                const isSelected = selectedPart === part.id;
                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => onChange(part.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {part.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
