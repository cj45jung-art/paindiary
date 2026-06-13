'use client';

import React, { useState, useEffect } from 'react';
import db, { User } from '@/lib/supabase';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  
  // Form input states
  const [nickname, setNickname] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  
  // UI feedback states
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = db.getCurrentUser();
    setUser(currentUser);
    setNickname(currentUser.nickname);
    setEmail(currentUser.email);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg('닉네임을 입력해 주세요.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('유효한 이메일 주소를 입력해 주세요.');
      return;
    }

    setErrorMsg(null);
    const updated = db.updateProfile(nickname.trim(), email.trim());
    setUser(updated);
    
    setNotification('프로필이 성공적으로 업데이트되었습니다.');
    setTimeout(() => {
      setNotification(null);
      // Reload page to refresh header name
      window.location.reload();
    }, 1500);
  };

  const handleResetDB = () => {
    if (confirm('⚠️ 경고: 모든 통증 기록 및 AI 분석 리포트 데이터가 초기화되고 초기 데모 데이터로 복구됩니다. 정말로 초기화하시겠습니까?')) {
      db.resetDatabase();
      setNotification('데이터베이스가 초기 상태로 초기화되었습니다.');
      
      const currentUser = db.getCurrentUser();
      setUser(currentUser);
      setNickname(currentUser.nickname);
      setEmail(currentUser.email);

      setTimeout(() => {
        setNotification(null);
        window.location.href = '/'; // Redirect to dashboard
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-800">⚙️ 사용자 설정 및 관리</h2>
        <p className="text-xs text-slate-500">프로필 관리 및 모바일 다이어리 앱 데이터 제어</p>
      </div>

      {/* Notifications */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 text-center text-xs font-semibold shadow-xs">
          ✅ {notification}
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3.5 text-center text-xs font-semibold shadow-xs">
          ❌ {errorMsg}
        </div>
      )}

      {/* Profile Update Form */}
      <form onSubmit={handleSaveProfile} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-700 pb-1 border-b border-slate-50">👤 내 프로필 카드</h3>
        
        {/* Nickname Input */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-600">
            사용자 닉네임
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예: 김직장"
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 placeholder:text-slate-400"
          />
        </div>

        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-600">
            이메일 주소
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 placeholder:text-slate-400"
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl text-xs hover:bg-blue-700 active:scale-98 transform transition-all cursor-pointer shadow-xs"
        >
          프로필 정보 저장하기
        </button>
      </form>

      {/* App Information Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-700 pb-1 border-b border-slate-50">📱 앱 정보 및 PWA 상태</h3>
        
        <div className="space-y-2 text-xs font-medium text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-400">버전</span>
            <span className="text-slate-800">1.0.0 (MVP)</span>
          </div>
          <hr className="border-slate-50" />
          <div className="flex justify-between">
            <span className="text-slate-400">오프라인 모드 (PWA)</span>
            <span className="text-emerald-600 font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
              <span>작동 중 (sw.js 활성)</span>
            </span>
          </div>
          <hr className="border-slate-50" />
          <div className="flex justify-between">
            <span className="text-slate-400">계정 생성일</span>
            <span className="text-slate-800 font-light">
              {user ? new Date(user.created_at).toLocaleDateString('ko-KR') : '확인 불가'}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 shadow-xs space-y-4">
        <div className="space-y-1">
          <h3 className="text-xs font-black text-rose-900 flex items-center space-x-1">
            <span>🚨 Danger Zone</span>
          </h3>
          <p className="text-[10px] text-rose-700 leading-normal font-light">
            데이터베이스 강제 초기화 시 기존에 작성했던 모든 통증 로그 및 AI 분석 리포트 기록이 즉각 영구 삭제됩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDB}
          className="w-full bg-rose-600 text-white font-bold py-3 px-4 rounded-xl text-xs hover:bg-rose-700 active:scale-98 transform transition-all cursor-pointer shadow-xs"
        >
          전체 데이터 및 캐시 강제 초기화
        </button>
      </div>
    </div>
  );
}
