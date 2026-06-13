'use client';

import React, { useState, useEffect } from 'react';
import BodyMap from '@/components/BodyMap';
import db, { PainRecord, User } from '@/lib/supabase';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<PainRecord[]>([]);
  
  // Form States
  const [selectedPart, setSelectedPart] = useState<string>('Neck');
  const [painLevel, setPainLevel] = useState<number>(5);
  const [sleepHours, setSleepHours] = useState<number>(6.5);
  const [postureRating, setPostureRating] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  
  // UI states
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Load local database data on client mount
    setUser(db.getCurrentUser());
    setRecords(db.getRecords());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const added = db.addRecord({
      pain_level: painLevel,
      body_part: selectedPart,
      sleep_hours: sleepHours,
      posture_rating: postureRating,
      notes: notes.trim() || undefined
    });

    setRecords(db.getRecords());
    
    // Clear dynamic input but retain habit constants as baseline
    setNotes('');
    
    // Trigger notification
    setNotification('통증 기록이 성공적으로 등록되었습니다!');
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm('이 기록을 삭제하시겠습니까?')) {
      db.deleteRecord(id);
      setRecords(db.getRecords());
    }
  };

  const getPainLevelColor = (level: number) => {
    if (level <= 3) return 'bg-emerald-500';
    if (level <= 6) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getPartLabel = (part: string) => {
    const labels: Record<string, string> = {
      Head: '머리(두통)',
      Neck: '목(거북목)',
      Shoulder: '어깨',
      Wrist: '손목(터널)',
      Back: '허리/척추',
      Knee: '무릎'
    };
    return labels[part] || part;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Widget */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-extrabold translate-y-12 translate-x-4 select-none">
          +
        </div>
        <p className="text-xs text-blue-100 font-medium">반갑습니다, 개발자들을 위한 헬스케어</p>
        <h2 className="text-xl font-extrabold mt-1">
          {user ? `${user.nickname}님` : '김직장님'}, 오늘 통증은 어떠신가요?
        </h2>
        <p className="text-xs text-blue-100 mt-2 font-light leading-relaxed">
          아픈 신체 부위를 맵에서 선택하고, 오늘의 생활 습관과 통증 강도를 단 10초 만에 손쉽게 기록해 보세요.
        </p>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-center text-xs font-semibold animate-bounce shadow-xs">
          ✅ {notification}
        </div>
      )}

      {/* Main Logging Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Body Map Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800 pl-1">
            1. 아픈 신체 부위 터치
          </label>
          <BodyMap selectedPart={selectedPart} onChange={setSelectedPart} />
        </div>

        {/* Step 2: Sliders and Habits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-5">
          {/* Pain Level 1-10 Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-800">
                2. 통증 강도
              </label>
              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full text-white ${getPainLevelColor(painLevel)}`}>
                Lv.{painLevel} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={painLevel}
              onChange={(e) => setPainLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
              <span>미세한 뻐근함</span>
              <span>일상 속 거슬림</span>
              <span>극심한 통증</span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Sleep Hours Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-800">
                3. 어제 수면 시간
              </label>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                {sleepHours}시간
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="10"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
              <span>매우 피곤 (4시간 이하)</span>
              <span>권장 수면 (7-8시간)</span>
              <span>충분한 휴식 (10시간)</span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Posture Rating Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-800">
                4. 오늘 자세 & 체형 정렬 점수
              </label>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {postureRating}점 / 5점
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={postureRating}
              onChange={(e) => setPostureRating(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
              <span>계속 구부정함 (1)</span>
              <span>보통 (3)</span>
              <span>의식적으로 바른 자세 (5)</span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Text Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">
              5. 추가 증상 또는 특이사항 (선택)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="예: '하루 종일 듀얼 모니터 코딩을 진행하느라 목뒷덜미가 유난히 뻣뻣하고 뻐근함이 느껴짐.'"
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-md hover:bg-blue-700 transition-colors cursor-pointer active:scale-98 transform duration-100 flex items-center justify-center space-x-2 text-sm"
        >
          <span>✏️</span>
          <span>오늘의 통증 다이어리 등록하기</span>
        </button>
      </form>

      {/* History Timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 pl-1">
          최근 기록 목록 ({records.length}건)
        </h3>
        
        {records.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 text-slate-400 py-10 rounded-2xl text-center text-xs">
            기록된 통증 일기가 없습니다.<br />위의 폼을 통해 첫 통증 기록을 남겨주세요.
          </div>
        ) : (
          <div className="space-y-3">
            {records.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col space-y-2 relative"
              >
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDelete(record.id)}
                  className="absolute right-4 top-4 text-slate-300 hover:text-red-500 text-xs p-1"
                  title="기록 삭제"
                >
                  ✕
                </button>

                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-extrabold text-white px-2 py-0.5 rounded-md ${getPainLevelColor(record.pain_level)}`}>
                    Lv.{record.pain_level}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {getPartLabel(record.body_part)} 통증
                  </span>
                  <span className="text-[10px] text-slate-400 font-light">
                    {new Date(record.recorded_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-50 text-[10px] text-slate-500 font-medium">
                  <div>🌙 수면: <span className="text-slate-800 font-semibold">{record.sleep_hours}시간</span></div>
                  <div>🧘 자세 점수: <span className="text-slate-800 font-semibold">{record.posture_rating} / 5</span></div>
                </div>

                {record.notes && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 italic leading-relaxed">
                    "{record.notes}"
                  </p>
                )}
              </div>
            ))}
            
            {records.length > 5 && (
              <div className="text-center text-[11px] text-slate-400">
                그 외 {records.length - 5}개의 예전 기록이 누적되어 리포트에 자동 연동되어 있습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
