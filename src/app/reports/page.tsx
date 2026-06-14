'use client';

import React, { useState, useEffect } from 'react';
import db, { PainRecord, Report, Product } from '@/lib/supabase';
import { generateAIReport } from '@/lib/reportGenerator';
import Link from 'next/link';
import { getBaseCategory, getPartLabel } from '@/lib/bodyParts';

export default function ReportsPage() {
  const [records, setRecords] = useState<PainRecord[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  
  // Recommendations based on the active report's symptom
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadedRecords = db.getRecords();
    const loadedReports = db.getReports();
    setRecords(loadedRecords);
    setReports(loadedReports);
    
    if (loadedReports.length > 0) {
      setActiveReport(loadedReports[0]);
    }
  }, []);

  useEffect(() => {
    if (activeReport) {
      // Determine the primary symptom based on report text or database
      let symptom = 'General';
      if (activeReport.ai_summary.includes('목')) symptom = 'Neck';
      else if (activeReport.ai_summary.includes('허리')) symptom = 'Back';
      else if (activeReport.ai_summary.includes('손목')) symptom = 'Wrist';
      else if (activeReport.ai_summary.includes('두통')) symptom = 'Head';
      else if (activeReport.ai_summary.includes('무릎')) symptom = 'Knee';
      
      setRecommendedProducts(db.getProductsBySymptom(symptom));
    } else {
      setRecommendedProducts(db.getProductsBySymptom('General'));
    }
  }, [activeReport]);

  const handleGenerateReport = () => {
    if (records.length === 0) {
      alert('기록이 최소 1개 이상 존재해야 AI 리포트 생성이 가능합니다! 대시보드에서 기록을 작성해 주세요.');
      return;
    }

    setIsGenerating(true);

    // Simulate high-quality AI analysis background task
    setTimeout(() => {
      const generated = generateAIReport(records, 'weekly');
      const saved = db.saveReport(generated);
      
      setReports(db.getReports());
      setActiveReport(saved);
      setIsGenerating(false);
    }, 2000);
  };

  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 AI 분석 리포트를 삭제하시겠습니까?')) {
      db.deleteReport(id);
      const updated = db.getReports();
      setReports(updated);
      if (activeReport?.id === id) {
        setActiveReport(updated.length > 0 ? updated[0] : null);
      }
    }
  };

  // Generate statistics for charts
  const totalPain = records.reduce((sum, r) => sum + r.pain_level, 0);
  const avgPain = records.length > 0 ? (totalPain / records.length).toFixed(1) : '0';
  
  const totalSleep = records.reduce((sum, r) => sum + r.sleep_hours, 0);
  const avgSleep = records.length > 0 ? (totalSleep / records.length).toFixed(1) : '0';

  const totalPosture = records.reduce((sum, r) => sum + r.posture_rating, 0);
  const avgPosture = records.length > 0 ? (totalPosture / records.length).toFixed(1) : '0';

  // Group by base category and collect details
  const baseCounts: Record<string, number> = {};
  const baseDetails: Record<string, Record<string, number>> = {};
  
  records.forEach(r => {
    const base = getBaseCategory(r.body_part);
    baseCounts[base] = (baseCounts[base] || 0) + 1;
    
    if (!baseDetails[base]) {
      baseDetails[base] = {};
    }
    const label = getPartLabel(r.body_part);
    baseDetails[base][label] = (baseDetails[base][label] || 0) + 1;
  });

  const getPartLabelInKorean = (part: string) => {
    const labels: Record<string, string> = {
      Head: '머리/두통',
      Neck: '목(경추)',
      Shoulder: '어깨',
      Wrist: '손목/손',
      Back: '허리/척추',
      Knee: '무릎/다리'
    };
    return labels[part] || part;
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-800">📊 AI 통증 분석 리포트</h2>
        <p className="text-xs text-slate-500">누적된 건강 데이터를 인공지능이 분석하여 드립니다.</p>
      </div>

      {/* Statistics dashboard */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs text-center">
          <div className="text-[10px] font-semibold text-slate-400">평균 통증 지수</div>
          <div className="text-lg font-black text-rose-500 mt-1">{avgPain}<span className="text-[10px] text-slate-400 font-normal">/10</span></div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs text-center">
          <div className="text-[10px] font-semibold text-slate-400">평균 수면 시간</div>
          <div className="text-lg font-black text-blue-600 mt-1">{avgSleep}<span className="text-[10px] text-slate-400 font-normal">시간</span></div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs text-center">
          <div className="text-[10px] font-semibold text-slate-400">자세 정렬 점수</div>
          <div className="text-lg font-black text-indigo-600 mt-1">{avgPosture}<span className="text-[10px] text-slate-400 font-normal">/5</span></div>
        </div>
      </div>

      {/* Visual Chart Module */}
      {records.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-700">대분류별 통증 빈도 및 세부 부위</h3>
          <div className="space-y-4 pt-1">
            {Object.entries(baseCounts).map(([base, count]) => {
              const percentage = Math.round((count / records.length) * 100);
              const details = baseDetails[base] || {};
              const detailsString = Object.entries(details)
                .map(([lbl, cnt]) => `${lbl} ${cnt}회`)
                .join(', ');

              return (
                <div key={base} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-slate-600">
                    <span className="font-bold text-slate-700">{getPartLabelInKorean(base)} 통증</span>
                    <span className="font-bold text-slate-800">{count}회 ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        base === 'Neck' || base === 'Back' ? 'bg-blue-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-slate-400 font-light pl-1">
                    ↳ 세부 부위: {detailsString}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Generate Action Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs text-center space-y-4">
        <div className="space-y-1.5">
          <div className="text-xl">🤖</div>
          <h3 className="text-sm font-extrabold text-slate-800">통증 패턴 정밀 진단</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
            누적된 기록 {records.length}건을 종합하여 목, 자세 점수, 숙면 지수 등 일상 속 습관 인자를 AI가 연산합니다.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className={`w-full font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-2 ${
            isGenerating
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>AI 데이터 요약 및 연관 분석 중...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>주간/월간 AI 종합 리포트 발행하기</span>
            </>
          )}
        </button>
      </div>

      {/* Report Showcase Card */}
      {activeReport ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border-2 border-indigo-100 shadow-md p-5 space-y-4 relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute right-4 top-4 text-4xl opacity-15">📜</div>
            
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full border border-indigo-100">
                주간 헬스 진단
              </span>
              <h3 className="text-base font-black text-slate-800 mt-2">
                종합 피드백 리포트
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                발행일: {new Date(activeReport.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* AI Summary feedback */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-indigo-900 bg-indigo-50/50 px-2.5 py-1.5 rounded-lg border-l-4 border-indigo-500">
                AI 전문 소견 및 가이드
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3 rounded-xl italic">
                {activeReport.ai_summary}
              </p>
            </div>

            {/* Symptoms statistics detail */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-800">🩺 통증 발현 요약</h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl">
                {activeReport.symptoms_summary}
              </p>
            </div>

            {/* Habits correlation detail */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-800">🧘 생활 습관 상관관계 분석</h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl">
                {activeReport.habits_analysis}
              </p>
            </div>

            {/* Recommended Clinic */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[10px] text-amber-800 font-bold">🏥 추천 임상 진료과</div>
                <div className="text-xs font-extrabold text-amber-950">{activeReport.recommended_dept}</div>
              </div>
              <span className="text-lg">👩‍⚕️</span>
            </div>
          </div>

          {/* Commerce Section integrated into Report as per PRD/TRD */}
          <div className="space-y-3">
            <div className="flex justify-between items-center pl-1">
              <h4 className="text-xs font-bold text-slate-800">🛍️ 증상 해결을 위한 AI 맞춤 추천 상품</h4>
              <Link href="/commerce" className="text-[10px] text-blue-600 hover:underline">더보기 →</Link>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {recommendedProducts.map((prod) => (
                <a
                  key={prod.id}
                  href={prod.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs flex items-start space-x-3 hover:border-blue-200 transition-colors cursor-pointer group"
                >
                  <div className="text-3xl p-2 bg-slate-50 rounded-lg group-hover:scale-105 transition-transform">
                    {prod.image_url}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[8px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-md">
                        {getPartLabelInKorean(prod.target_symptom)} 케어
                      </span>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-md">
                        최저가 큐레이션
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-800 truncate">{prod.product_name}</h5>
                    <p className="text-[10px] text-slate-400 line-clamp-1 leading-normal">{prod.description}</p>
                    <div className="text-[11px] font-black text-slate-900 pt-0.5">{prod.price}</div>
                  </div>
                  <div className="text-slate-300 group-hover:text-blue-500 self-center text-xs pl-1">
                    ➔
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Past Reports List */}
          {reports.length > 1 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 pl-1">이전 발행 리포트 목록</h4>
              <div className="space-y-2">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => setActiveReport(rep)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      activeReport.id === rep.id
                        ? 'bg-indigo-50/50 border-indigo-200'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                        <span>📋 AI 종합 피드백</span>
                        {activeReport.id === rep.id && (
                          <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded-md">
                            현재 조회중
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        발행: {new Date(rep.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => handleDeleteReport(rep.id, e)}
                      className="text-slate-300 hover:text-red-500 text-xs p-1"
                      title="리포트 삭제"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 space-y-2 py-12">
          <p>아직 발행된 건강 진단 리포트가 없습니다.</p>
          <p className="text-[10px]">상단의 [주간/월간 AI 종합 리포트 발행하기] 버튼을 눌러 AI 맞춤 피드백을 실시간으로 확인하고 손쉽게 저장하세요!</p>
        </div>
      )}
    </div>
  );
}
