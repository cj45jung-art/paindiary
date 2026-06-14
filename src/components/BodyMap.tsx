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
  { id: 'Head', label: '머리/얼굴', x: 100, y: 35, r: 18, side: 'both', group: 'Head' },
  { id: 'Neck', label: '목/경추', x: 100, y: 65, r: 12, side: 'both', group: 'Neck' },
  
  // Left side (Visual Left -> Left side of body)
  { id: 'Shoulder_Left_Main', label: '왼쪽 어깨', x: 65, y: 80, r: 13, side: 'both', group: 'Shoulder', defaultSide: 'Left', labelXOffset: -22, labelYOffset: -2 },
  { id: 'Wrist_Left_Main', label: '왼손목/손', x: 42, y: 155, r: 11, side: 'both', group: 'Wrist', defaultSide: 'Left', labelXOffset: -24, labelYOffset: -2 },
  { id: 'Knee_Left_Main', label: '왼쪽 무릎', x: 75, y: 220, r: 14, side: 'both', group: 'Knee', defaultSide: 'Left', labelXOffset: -24, labelYOffset: -2 },
  { id: 'Foot_Left_Main', label: '왼발목/발', x: 62, y: 290, r: 12, side: 'both', group: 'Foot', defaultSide: 'Left', labelXOffset: -24, labelYOffset: -2 },

  // Right side (Visual Right -> Right side of body)
  { id: 'Shoulder_Right_Main', label: '오른쪽 어깨', x: 135, y: 80, r: 13, side: 'both', group: 'Shoulder', defaultSide: 'Right', labelXOffset: 22, labelYOffset: -2 },
  { id: 'Wrist_Right_Main', label: '오른손목/손', x: 158, y: 155, r: 11, side: 'both', group: 'Wrist', defaultSide: 'Right', labelXOffset: 24, labelYOffset: -2 },
  { id: 'Knee_Right_Main', label: '오른쪽 무릎', x: 125, y: 220, r: 14, side: 'both', group: 'Knee', defaultSide: 'Right', labelXOffset: 24, labelYOffset: -2 },
  { id: 'Foot_Right_Main', label: '오른발목/발', x: 138, y: 290, r: 12, side: 'both', group: 'Foot', defaultSide: 'Right', labelXOffset: 24, labelYOffset: -2 },

  { id: 'Back', label: '등/허리', x: 100, y: 130, r: 18, side: 'back', group: 'Back' },
];

export default function BodyMap({ selectedPart, onChange }: BodyMapProps) {
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Hand side state (Left vs Right)
  const [handSide, setHandSide] = useState<'Left' | 'Right'>('Right');
  // Foot side state (Left vs Right)
  const [footSide, setFootSide] = useState<'Left' | 'Right'>('Right');
  // Knee side state (Left vs Right)
  const [kneeSide, setKneeSide] = useState<'Left' | 'Right'>('Right');
  // Shoulder/Arm side state (Left vs Right)
  const [armSide, setArmSide] = useState<'Left' | 'Right'>('Right');
  // Head view side state (Front vs Back)
  const [headSide, setHeadSide] = useState<'Front' | 'Back'>('Front');

  // Auto-open group on mount or when selectedPart changes from outside
  useEffect(() => {
    if (selectedPart && BODY_PARTS_MAP[selectedPart]) {
      const part = BODY_PARTS_MAP[selectedPart];
      // Determine group
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

  // Search filter
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
          className="w-full text-xs pl-8 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 placeholder:text-slate-400"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
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
              className="w-full h-full max-h-[290px] text-slate-200 select-none"
            >
              {/* Simple Human Outline */}
              <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                {/* Head */}
                <circle cx="100" cy="35" r="18" fill="#f8fafc" />
                
                {/* Neck */}
                <path d="M94 53 L94 65 M106 53 L106 65" />
                
                {/* Shoulders & Torso */}
                {viewSide === 'front' ? (
                  <>
                    <path d="M68 70 Q100 75 132 70" />
                    <path d="M68 70 L55 100 L45 140" />
                    <path d="M132 70 L145 100 L155 140" />
                    <path d="M68 70 L75 160 L125 160 L132 70" fill="#f8fafc" />
                    {/* Chest details */}
                    <path d="M85 90 L115 90" strokeWidth="1" strokeDasharray="3 3" />
                    <path d="M100 75 L100 160" strokeWidth="1" strokeDasharray="3 3" />
                  </>
                ) : (
                  <>
                    <path d="M68 70 Q100 75 132 70" />
                    <path d="M68 70 L55 100 L45 140" />
                    <path d="M132 70 L145 100 L155 140" />
                    <path d="M68 70 L75 160 L125 160 L132 70" fill="#f8fafc" />
                    {/* Spine representation */}
                    <path d="M100 65 L100 160" stroke="#cbd5e1" strokeWidth="2.5" />
                  </>
                )}

                {/* Pelvis & Legs */}
                <path d="M75 160 L65 220 L55 290" />
                <path d="M125 160 L135 220 L145 290" />
                
                {/* Feet */}
                <path d="M55 290 L48 296 L58 296 Z" fill="#e2e8f0" />
                <path d="M145 290 L152 296 L142 296 Z" fill="#e2e8f0" />
              </g>

              {/* Render interactive hotspot nodes */}
              {visibleZones.map((zone) => {
                const isSelected = isPartSelectedInGroup(zone);
                const labelX = zone.x + (zone.labelXOffset || 0);
                const labelY = zone.y + zone.r + 3 + (zone.labelYOffset || 0);
                
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
                    {/* Visual pulse for existing selected item */}
                    {isSelected && (
                      <circle
                        cx={zone.x}
                        cy={zone.y}
                        r={zone.r * 1.7}
                        fill="#3b82f6"
                        opacity="0.2"
                        className="animate-ping origin-center"
                        style={{ transformOrigin: `${zone.x}px ${zone.y}px` }}
                      />
                    )}

                    {/* Hotspot Touch Area */}
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
                      className="transition-all duration-200 group-hover/node:scale-110 group-hover/node:stroke-blue-500"
                      style={{ transformOrigin: `${zone.x}px ${zone.y}px` }}
                    />

                    {/* Text Label Box */}
                    <rect
                      x={labelX - 28}
                      y={labelY}
                      width="56"
                      height="16"
                      rx="4"
                      fill={isSelected ? '#eff6ff' : '#ffffff'}
                      stroke={isSelected ? '#bfdbfe' : '#cbd5e1'}
                      strokeWidth="1"
                      className="transition-colors group-hover/node:stroke-blue-300"
                    />
                    <text
                      x={labelX}
                      y={labelY + 11}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill={isSelected ? '#1d4ed8' : '#64748b'}
                      className="select-none font-sans transition-colors group-hover/node:fill-blue-600"
                    >
                      {zone.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating tooltip/hint */}
            <div className="absolute bottom-1 bg-slate-50 border border-slate-100 px-3.5 py-1 rounded-full text-[10px] text-slate-500 text-center select-none shadow-xs">
              {selectedPart 
                ? <span className="font-semibold text-blue-600">현재 선택: {getPartLabel(selectedPart)}</span>
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
            <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full">
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
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-200">
                      {/* Neck */}
                      <path d="M42 75 L42 88 L58 88 L58 75" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                      {/* Face Contour */}
                      <path d="M30 30 C 30 10, 70 10, 70 30 C 70 45, 65 65, 50 78 C 35 65, 30 45, 30 30 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                      {/* Left/Right Ears */}
                      <path d="M30 35 C 25 35, 25 25, 30 25" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                      <path d="M70 35 C 75 35, 75 25, 70 25" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                      
                      {/* Eyes outline */}
                      <ellipse cx="40" cy="40" rx="4" ry="2" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                      <ellipse cx="60" cy="40" rx="4" ry="2" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                      {/* Nose outline */}
                      <path d="M50 38 L48 48 L52 48" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                      {/* Mouth outline */}
                      <path d="M43 61 Q50 64 57 61" fill="none" stroke="#cbd5e1" strokeWidth="1" />

                      {/* Nodes */}
                      {[
                        { id: 'Head_Forehead', label: '이마', cx: 50, cy: 20, r: 5.5 },
                        { id: 'Head_Temple_Left', label: '왼쪽 관자', cx: 24, cy: 24, r: 4.5 },
                        { id: 'Head_Temple_Right', label: '오른쪽 관자', cx: 76, cy: 24, r: 4.5 },
                        { id: 'Head_Eye_Left', label: '왼쪽 눈', cx: 40, cy: 37, r: 4.5 },
                        { id: 'Head_Eye_Right', label: '오른쪽 눈', cx: 60, cy: 37, r: 4.5 },
                        { id: 'Head_Nose', label: '코', cx: 50, cy: 45, r: 4.5 },
                        { id: 'Head_Cheek_Left', label: '왼쪽 볼', cx: 34, cy: 50, r: 4.5 },
                        { id: 'Head_Cheek_Right', label: '오른쪽 볼', cx: 66, cy: 50, r: 4.5 },
                        { id: 'Head_Mouth', label: '입/입술', cx: 50, cy: 61, r: 4.5 },
                        { id: 'Head_Ear_Left', label: '왼쪽 귀', cx: 16, cy: 30, r: 4.5 },
                        { id: 'Head_Ear_Right', label: '오른쪽 귀', cx: 84, cy: 30, r: 4.5 },
                        { id: 'Head_Jaw', label: '턱/관절', cx: 50, cy: 73, r: 5.5 },
                      ].map(node => {
                        const isSelected = selectedPart === node.id;
                        return (
                          <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                            <circle cx={node.cx} cy={node.cy} r={node.r + 5} fill="transparent" />
                            <circle
                              cx={node.cx}
                              cy={node.cy}
                              r={node.r}
                              fill={isSelected ? '#3b82f6' : '#ffffff'}
                              stroke={isSelected ? '#2563eb' : '#94a3b8'}
                              strokeWidth={isSelected ? '2' : '1.5'}
                              className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-110 origin-center"
                              style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                            />
                            <text
                              x={node.cx}
                              y={node.cy + node.r + 9}
                              textAnchor="middle"
                              fontSize="6"
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
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-200">
                      {/* Neck */}
                      <path d="M42 75 L42 88 L58 88 L58 75" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                      {/* Back of Head Contour */}
                      <path d="M30 30 C 30 10, 70 10, 70 30 C 70 45, 65 65, 50 78 C 35 65, 30 45, 30 30 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                      {/* Left/Right Ears from Back */}
                      <path d="M30 35 C 26 35, 26 25, 30 25" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                      <path d="M70 35 C 74 35, 74 25, 70 25" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                      
                      {/* Back of head hair/structure detail */}
                      <path d="M32 30 C 35 15, 65 15, 68 30 C 70 42, 65 58, 50 66 C 35 58, 30 42, 32 30 Z" fill="#e2e8f0" opacity="0.3" stroke="#cbd5e1" strokeWidth="1" />

                      {/* Nodes */}
                      {[
                        { id: 'Head_Crown', label: '정수리', cx: 50, cy: 18, r: 6 },
                        { id: 'Head_Temple_Left', label: '왼쪽 관자', cx: 24, cy: 28, r: 4.5 },
                        { id: 'Head_Temple_Right', label: '오른쪽 관자', cx: 76, cy: 28, r: 4.5 },
                        { id: 'Head_Back', label: '뒷머리 (후두부)', cx: 50, cy: 45, r: 6.5 },
                      ].map(node => {
                        const isSelected = selectedPart === node.id;
                        return (
                          <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                            <circle cx={node.cx} cy={node.cy} r={node.r + 5} fill="transparent" />
                            <circle
                              cx={node.cx}
                              cy={node.cy}
                              r={node.r}
                              fill={isSelected ? '#3b82f6' : '#ffffff'}
                              stroke={isSelected ? '#2563eb' : '#94a3b8'}
                              strokeWidth={isSelected ? '2' : '1.5'}
                              className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-110 origin-center"
                              style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                            />
                            <text
                              x={node.cx}
                              y={node.cy + node.r + 9}
                              textAnchor="middle"
                              fontSize="6"
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
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-200">
                    {/* Head bottom & Neck outline */}
                    <path d="M 30 15 C 30 15, 30 30, 50 35 C 70 30, 70 15, 70 15" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                    {/* Shoulders line */}
                    <path d="M 10 70 C 25 50, 40 45, 50 45 C 60 45, 75 50, 90 70" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                    {/* Spine line representation */}
                    <path d="M 50 35 L 50 85" stroke="#e2e8f0" strokeWidth="4" strokeDasharray="3 2" />

                    {/* Nodes */}
                    {[
                      { id: 'Neck_Cervical', label: '경추 중심 (목 뒤)', cx: 50, cy: 45, r: 7 },
                      { id: 'Neck_Left', label: '왼쪽 목덜미', cx: 38, cy: 50, r: 6 },
                      { id: 'Neck_Right', label: '오른쪽 목덜미', cx: 62, cy: 50, r: 6 },
                      { id: 'Neck_Front', label: '목 앞쪽 (인후부)', cx: 50, cy: 28, r: 6 },
                    ].map(node => {
                      const isSelected = selectedPart === node.id;
                      return (
                        <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                          <circle cx={node.cx} cy={node.cy} r={node.r + 5} fill="transparent" />
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={node.r}
                            fill={isSelected ? '#3b82f6' : '#ffffff'}
                            stroke={isSelected ? '#2563eb' : '#94a3b8'}
                            strokeWidth={isSelected ? '2' : '1.5'}
                            className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-110 origin-center"
                            style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                          />
                          <text
                            x={node.cx}
                            y={node.cy + node.r + 9}
                            textAnchor="middle"
                            fontSize="6.5"
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
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-200">
                    {/* Torso & Shoulder outline */}
                    <path d="M 50 15 Q 40 15, 30 25 Q 15 35, 15 65" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
                    <path d="M 50 15 Q 60 15, 70 25 Q 85 35, 85 65" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
                    
                    {/* Left/Right Arm graphics based on side */}
                    {armSide === 'Left' ? (
                      <path d="M 15 65 L 10 90" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                    ) : (
                      <path d="M 85 65 L 90 90" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                    )}

                    {/* Nodes mapping to Left/Right side */}
                    {[
                      { 
                        id: armSide === 'Left' ? 'Shoulder_Left' : 'Shoulder_Right', 
                        label: armSide === 'Left' ? '왼쪽 승모근/어깨' : '오른쪽 승모근/어깨',
                        cx: armSide === 'Left' ? 25 : 75, cy: 30, r: 7 
                      },
                      { 
                        id: armSide === 'Left' ? 'Arm_Left_Elbow' : 'Arm_Right_Elbow', 
                        label: armSide === 'Left' ? '왼쪽 팔꿈치' : '오른쪽 팔꿈치',
                        cx: armSide === 'Left' ? 18 : 82, cy: 60, r: 6 
                      },
                      { 
                        id: armSide === 'Left' ? 'Arm_Left_Forearm' : 'Arm_Right_Forearm', 
                        label: armSide === 'Left' ? '왼쪽 팔뚝' : '오른쪽 팔뚝',
                        cx: armSide === 'Left' ? 12 : 88, cy: 82, r: 6 
                      },
                    ].map(node => {
                      const isSelected = selectedPart === node.id;
                      return (
                        <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                          <circle cx={node.cx} cy={node.cy} r={node.r + 5} fill="transparent" />
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={node.r}
                            fill={isSelected ? '#3b82f6' : '#ffffff'}
                            stroke={isSelected ? '#2563eb' : '#94a3b8'}
                            strokeWidth={isSelected ? '2' : '1.5'}
                            className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-110 origin-center"
                            style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                          />
                          <text
                            x={node.cx}
                            y={node.cy + node.r + 9}
                            textAnchor="middle"
                            fontSize="6.5"
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

            {/* 4. WRIST & HAND DETAILED SELECTOR (WITH FINGER JOINTS) */}
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
                    {/* Hand Outline Graphic - Mirrored for Left Hand */}
                    <path
                      d="M 50 180 C 50 180, 20 150, 20 100 C 20 70, 30 65, 35 65 C 37 90, 42 90, 42 60 C 42 45, 52 45, 52 60 C 52 90, 58 90, 58 52 C 58 35, 68 35, 68 52 C 68 90, 74 90, 74 58 C 74 42, 84 42, 84 58 C 84 90, 90 90, 90 70 C 90 55, 100 55, 100 70 C 100 110, 105 110, 110 100 C 120 80, 130 90, 125 115 C 120 135, 110 180, 110 180"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      transform={handSide === 'Left' ? "translate(160, 0) scale(-1, 1)" : undefined}
                    />
                    
                    {/* Wrist & Palm Nodes */}
                    {[
                      { id: handSide === 'Left' ? 'Wrist_Left' : 'Wrist_Right', label: '손목', cx: 80, cy: 180, r: 8 },
                      { id: handSide === 'Left' ? 'Hand_Left_Palm' : 'Hand_Right_Palm', label: '손바닥/손등', cx: 75, cy: 130, r: 8 }
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
                            stroke={isSelected ? '#2563eb' : '#94a3b8'}
                            strokeWidth={isSelected ? '2.5' : '1.5'}
                            className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-115"
                            style={{ transformOrigin: `${cxVal}px ${node.cy}px` }}
                          />
                          <text
                            x={cxVal}
                            y={node.cy + node.r + 9}
                            textAnchor="middle"
                            fontSize="6.5"
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
                      { id: `Hand_${handSide}_Thumb_Joint1`, label: '엄지 1(끝)', cx: 120, cy: 100, r: 4.5 },
                      { id: `Hand_${handSide}_Thumb_Joint2`, label: '엄지 2', cx: 110, cy: 120, r: 4.5 },
                      
                      // Index (검지)
                      { id: `Hand_${handSide}_Index_Joint1`, label: '검지 1(끝)', cx: 96, cy: 62, r: 4 },
                      { id: `Hand_${handSide}_Index_Joint2`, label: '검지 2', cx: 94, cy: 82, r: 4 },
                      { id: `Hand_${handSide}_Index_Joint3`, label: '검지 3(뿌리)', cx: 92, cy: 102, r: 4 },
                      
                      // Middle (중지)
                      { id: `Hand_${handSide}_Middle_Joint1`, label: '중지 1(끝)', cx: 78, cy: 45, r: 4 },
                      { id: `Hand_${handSide}_Middle_Joint2`, label: '중지 2', cx: 77, cy: 67, r: 4 },
                      { id: `Hand_${handSide}_Middle_Joint3`, label: '중지 3(뿌리)', cx: 76, cy: 92, r: 4 },

                      // Ring (약지)
                      { id: `Hand_${handSide}_Ring_Joint1`, label: '약지 1(끝)', cx: 58, cy: 49, r: 4 },
                      { id: `Hand_${handSide}_Ring_Joint2`, label: '약지 2', cx: 58, cy: 71, r: 4 },
                      { id: `Hand_${handSide}_Ring_Joint3`, label: '약지 3(뿌리)', cx: 59, cy: 95, r: 4 },

                      // Pinky (새끼)
                      { id: `Hand_${handSide}_Pinky_Joint1`, label: '새끼 1(끝)', cx: 37, cy: 64, r: 3.5 },
                      { id: `Hand_${handSide}_Pinky_Joint2`, label: '새끼 2', cx: 39, cy: 83, r: 3.5 },
                      { id: `Hand_${handSide}_Pinky_Joint3`, label: '새끼 3(뿌리)', cx: 41, cy: 102, r: 3.5 },
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
                            {node.label.replace('손 ', '')}
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
                  <svg viewBox="0 0 100 120" className="w-full h-full text-slate-200">
                    {/* Spine backbone graphic */}
                    <rect x="47" y="10" width="6" height="100" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                    
                    {/* Rib cage outline */}
                    <path d="M 47 30 C 35 25, 25 35, 25 50 C 25 60, 35 65, 47 65" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                    <path d="M 53 30 C 65 25, 75 35, 75 50 C 75 60, 65 65, 53 65" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                    
                    {/* Pelvis bone outline */}
                    <path d="M 35 90 C 35 85, 45 80, 50 80 C 55 80, 65 85, 65 90 C 65 100, 50 105, 35 90" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />

                    {/* Nodes */}
                    {[
                      { id: 'Back_Thoracic', label: '등 윗부분 (흉추)', cx: 50, cy: 38, r: 8 },
                      { id: 'Back_Lumbar', label: '허리 (요추)', cx: 50, cy: 70, r: 8 },
                      { id: 'Back_Pelvis', label: '골반 및 꼬리뼈', cx: 50, cy: 95, r: 8 },
                    ].map(node => {
                      const isSelected = selectedPart === node.id;
                      return (
                        <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                          <circle cx={node.cx} cy={node.cy} r={node.r + 5} fill="transparent" />
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={node.r}
                            fill={isSelected ? '#3b82f6' : '#ffffff'}
                            stroke={isSelected ? '#2563eb' : '#94a3b8'}
                            strokeWidth={isSelected ? '2.5' : '1.5'}
                            className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-110 origin-center"
                            style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                          />
                          <text
                            x={node.cx}
                            y={node.cy + node.r + 9}
                            textAnchor="middle"
                            fontSize="6.5"
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
                  <svg viewBox="0 0 100 120" className="w-full h-full text-slate-200">
                    {/* Leg outline based on side */}
                    {kneeSide === 'Left' ? (
                      <path d="M 40 10 L 32 45 L 35 80 L 30 110" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                    ) : (
                      <path d="M 60 10 L 68 45 L 65 80 L 70 110" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                    )}

                    {/* Nodes */}
                    {[
                      { 
                        id: kneeSide === 'Left' ? 'Leg_Left_Thigh' : 'Leg_Right_Thigh', 
                        label: kneeSide === 'Left' ? '왼쪽 허벅지' : '오른쪽 허벅지',
                        cx: kneeSide === 'Left' ? 36 : 64, cy: 25, r: 7 
                      },
                      { 
                        id: kneeSide === 'Left' ? 'Knee_Left' : 'Knee_Right', 
                        label: kneeSide === 'Left' ? '왼쪽 무릎' : '오른쪽 무릎',
                        cx: kneeSide === 'Left' ? 33 : 67, cy: 60, r: 7.5 
                      },
                      { 
                        id: kneeSide === 'Left' ? 'Leg_Left_Calf' : 'Leg_Right_Calf', 
                        label: kneeSide === 'Left' ? '왼쪽 종아리' : '오른쪽 종아리',
                        cx: kneeSide === 'Left' ? 33 : 67, cy: 92, r: 6 
                      },
                    ].map(node => {
                      const isSelected = selectedPart === node.id;
                      return (
                        <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                          <circle cx={node.cx} cy={node.cy} r={node.r + 5} fill="transparent" />
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={node.r}
                            fill={isSelected ? '#3b82f6' : '#ffffff'}
                            stroke={isSelected ? '#2563eb' : '#94a3b8'}
                            strokeWidth={isSelected ? '2.5' : '1.5'}
                            className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-110 origin-center"
                            style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                          />
                          <text
                            x={node.cx}
                            y={node.cy + node.r + 9}
                            textAnchor="middle"
                            fontSize="6.5"
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
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-200">
                    {/* Foot outline graphic - Mirrored for Left Foot */}
                    <path
                      d="M 45 85 C 35 85, 30 75, 30 60 C 30 45, 35 30, 32 20 C 33 15, 37 15, 38 20 C 40 28, 44 28, 45 20 C 46 16, 49 16, 50 20 C 51 28, 54 28, 55 21 C 56 18, 59 18, 60 22 C 61 28, 64 28, 65 23 C 66 20, 69 20, 70 24 C 71 30, 72 40, 70 55 C 68 70, 65 80, 55 85 Z"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2.5"
                      transform={footSide === 'Left' ? "translate(100, 0) scale(-1, 1)" : undefined}
                    />

                    {/* Nodes */}
                    {[
                      { id: `Foot_${footSide}_Ankle`, label: '발목', cx: 50, cy: 90, r: 6 },
                      { id: `Foot_${footSide}_Sole`, label: '발바닥 (족저)', cx: 50, cy: 38, r: 6 },
                      { id: `Foot_${footSide}_Heel`, label: '발뒤꿈치', cx: 50, cy: 75, r: 6 },
                      { id: `Foot_${footSide}_Toes`, label: '발가락 전체', cx: 50, cy: 27, r: 5 },
                      { id: `Foot_${footSide}_BigToe`, label: '엄지', cx: 35, cy: 15, r: 4 },
                      { id: `Foot_${footSide}_IndexToe`, label: '검지', cx: 44, cy: 14, r: 3.5 },
                      { id: `Foot_${footSide}_MiddleToe`, label: '중지', cx: 52, cy: 15, r: 3.5 },
                      { id: `Foot_${footSide}_RingToe`, label: '약지', cx: 60, cy: 17, r: 3.5 },
                      { id: `Foot_${footSide}_PinkyToe`, label: '새끼', cx: 68, cy: 20, r: 3 },
                      { id: `Foot_${footSide}_Arch`, label: '발아치', cx: 38, cy: 56, r: 5 },
                    ].map(node => {
                      const isSelected = selectedPart === node.id;
                      const cxVal = footSide === 'Left' ? 100 - node.cx : node.cx;
                      return (
                        <g key={node.id} className="cursor-pointer group/sub" onClick={() => onChange(node.id)}>
                          <circle cx={cxVal} cy={node.cy} r={node.r + 5} fill="transparent" />
                          <circle
                            cx={cxVal}
                            cy={node.cy}
                            r={node.r}
                            fill={isSelected ? '#3b82f6' : '#ffffff'}
                            stroke={isSelected ? '#2563eb' : '#94a3b8'}
                            strokeWidth={isSelected ? '2.5' : '1.5'}
                            className="transition-all duration-150 group-hover/sub:stroke-blue-500 group-hover/sub:scale-110 origin-center"
                            style={{ transformOrigin: `${cxVal}px ${node.cy}px` }}
                          />
                          <text
                            x={cxVal}
                            y={node.cy + node.r + 9}
                            textAnchor="middle"
                            fontSize="6"
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
