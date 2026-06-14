'use client';

import React, { useState, useEffect } from 'react';
import db, { Product } from '@/lib/supabase';
import BodyMap from '@/components/BodyMap';
import { getBaseCategory, getPartLabel } from '@/lib/bodyParts';

export default function CommercePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [showBodyMap, setShowBodyMap] = useState<boolean>(false);

  useEffect(() => {
    setProducts(db.getProducts());
  }, []);

  const filterOptions = [
    { key: 'All', label: '전체' },
    { key: 'Neck', label: '목/어깨' },
    { key: 'Back', label: '허리/척추' },
    { key: 'Wrist', label: '손목/터널' },
    { key: 'Head', label: '머리/두통' },
    { key: 'Knee', label: '무릎' },
  ];

  const filteredProducts = selectedFilter === 'All'
    ? products
    : products.filter(p => p.target_symptom.toLowerCase() === selectedFilter.toLowerCase());

  const getPartLabelInKorean = (part: string) => {
    const labels: Record<string, string> = {
      Head: '두통 케어',
      Neck: '경추 케어',
      Shoulder: '어깨 케어',
      Wrist: '손목 케어',
      Back: '요추 케어',
      Knee: '무릎 케어',
      General: '종합 영양'
    };
    return labels[part] || part;
  };

  const handleBodyPartChange = (partId: string) => {
    setSelectedPart(partId);
    let base = getBaseCategory(partId);
    
    // Map categories that don't have direct products to closest category
    if (base === 'Shoulder') {
      base = 'Neck'; // Group Shoulder with Neck/Shoulder (목/어깨)
    }
    
    setSelectedFilter(base);
  };

  const handleResetFilter = () => {
    setSelectedFilter('All');
    setSelectedPart('');
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-800">🛍️ 맞춤 케어 쇼핑관</h2>
        <p className="text-xs text-slate-500">회원님의 통증 부위와 증상에 딱 맞는 최적의 기구 및 영양제 큐레이션</p>
      </div>

      {/* Visual Search Toggle Button */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
            <span>🧍</span> 3D 신체 지도로 맞춤 상품 찾기
          </h3>
          <p className="text-[10px] text-slate-400 font-light">원하는 세부 관절/마디 부위를 직접 터치해 필터링해보세요.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowBodyMap(!showBodyMap)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            showBodyMap
              ? 'bg-blue-50 text-blue-600 border-blue-100'
              : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-sm'
          }`}
        >
          {showBodyMap ? '지도 접기 ✕' : '지도로 검색 ➔'}
        </button>
      </div>

      {/* BodyMap Collapsible Section */}
      {showBodyMap && (
        <div className="p-4 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-3 animate-fadeIn">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">인터랙티브 맵 필터</span>
            {selectedPart && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="text-[10px] text-red-500 hover:underline font-bold"
              >
                필터 초기화 ↺
              </button>
            )}
          </div>
          <BodyMap selectedPart={selectedPart} onChange={handleBodyPartChange} />
        </div>
      )}

      {/* Filter Chips */}
      <div className="space-y-2">
        {selectedPart && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-xs text-blue-700 font-bold flex justify-between items-center animate-fadeIn">
            <span>🎯 선택 부위: {getPartLabel(selectedPart)} ({getPartLabelInKorean(selectedFilter)} 상품 추천 중)</span>
            <button
              type="button"
              onClick={handleResetFilter}
              className="text-blue-500 hover:text-blue-700 text-xs p-1"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex space-x-1.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
          {filterOptions.map((opt) => {
            const isActive = selectedFilter === opt.key && !selectedPart;
            return (
              <button
                key={opt.key}
                onClick={() => {
                  setSelectedFilter(opt.key);
                  setSelectedPart(''); // Reset detailed part when selecting broad filter chip
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : selectedFilter === opt.key && selectedPart
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product List Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 py-12">
          해당 부위의 추천 상품 준비 중입니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map((prod) => (
            <a
              key={prod.id}
              href={prod.affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-start space-x-4 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
            >
              {/* Product Thumbnail / Icon */}
              <div className="text-4xl p-3 bg-slate-50 rounded-xl group-hover:scale-105 transition-transform flex items-center justify-center w-16 h-16 shrink-0 border border-slate-50">
                {prod.image_url}
              </div>

              {/* Product Info */}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className={`text-[9px] font-extrabold border px-2 py-0.5 rounded-md ${
                    prod.target_symptom === 'General'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {getPartLabelInKorean(prod.target_symptom)}
                  </span>
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    최저가 매칭
                  </span>
                </div>
                
                <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
                  {prod.product_name}
                </h3>
                
                <p className="text-xs text-slate-400 leading-normal font-light line-clamp-2">
                  {prod.description}
                </p>
                
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-black text-slate-900">{prod.price}</span>
                  <span className="text-[10px] text-blue-600 font-bold group-hover:translate-x-1 transition-transform flex items-center space-x-0.5">
                    <span>최저가 보러가기</span>
                    <span>➔</span>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Footnote Warning */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-[10px] text-slate-400 leading-relaxed font-light">
        ⚠️ **안내사항**: 본 서비스에서 제공하는 상품 매칭 정보는 자가진단 기록 및 인공지능 분석 가이드에 근거한 보조적인 제안입니다. 질환의 진단 및 치료를 위해서는 반드시 전문의와의 상담을 권장합니다. (네이버 쇼핑 최저가 검색 링크로 연동됩니다.)
      </div>
    </div>
  );
}
