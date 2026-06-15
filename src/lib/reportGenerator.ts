import { PainRecord } from './supabase';
import { getBaseCategory, getPartLabel } from './bodyParts';

export interface GeneratedReportData {
  report_type: 'weekly' | 'monthly';
  ai_summary: string;
  recommended_dept: string;
  symptoms_summary: string;
  habits_analysis: string;
  ai_model?: string;
  analysis_type?: 'short' | 'long';
  predicted_condition?: string;
}

const BASE_PART_KOREAN: Record<string, string> = {
  Head: '머리/두통',
  Neck: '목(경추)',
  Shoulder: '어깨',
  Wrist: '손목/손',
  Back: '허리/척추',
  Knee: '무릎/다리'
};

// Local Rule-based engine fallback
export function generateAIReport(records: PainRecord[], type: 'weekly' | 'monthly'): GeneratedReportData {
  if (records.length === 0) {
    return {
      report_type: type,
      ai_summary: '아직 기록된 통증 데이터가 없어 리포트를 작성할 수 없습니다. 대시보드에서 오늘의 신체 상태와 생활 습관을 1회 이상 기록해 주세요!',
      recommended_dept: '통증 발생 부위에 따름',
      symptoms_summary: '기록 없음',
      habits_analysis: '기록 없음',
      ai_model: '로컬 엔진',
      analysis_type: 'short',
      predicted_condition: '판단 보류'
    };
  }

  // 1. Calculate tracking period
  const sorted = [...records].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  const earliest = new Date(sorted[0].recorded_at);
  const latest = new Date(sorted[sorted.length - 1].recorded_at);
  const diffTime = Math.abs(latest.getTime() - earliest.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isShortPeriod = diffDays < 3 || records.length < 3;
  const analysis_type = isShortPeriod ? 'short' : 'long';

  // 2. Aggregate statistics
  const totalRecords = records.length;
  let totalPain = 0;
  let totalSleep = 0;
  let totalPosture = 0;
  
  const baseCounts: Record<string, number> = {};
  const baseLevelSums: Record<string, number> = {};
  const partCounts: Record<string, number> = {};
  const partLevelSums: Record<string, number> = {};

  records.forEach(r => {
    totalPain += r.pain_level;
    totalSleep += r.sleep_hours;
    totalPosture += r.posture_rating;
    
    const base = getBaseCategory(r.body_part);
    baseCounts[base] = (baseCounts[base] || 0) + 1;
    baseLevelSums[base] = (baseLevelSums[base] || 0) + r.pain_level;

    partCounts[r.body_part] = (partCounts[r.body_part] || 0) + 1;
    partLevelSums[r.body_part] = (partLevelSums[r.body_part] || 0) + r.pain_level;
  });

  const avgPain = Number((totalPain / totalRecords).toFixed(1));
  const avgSleep = Number((totalSleep / totalRecords).toFixed(1));
  const avgPosture = Number((totalPosture / totalRecords).toFixed(1));

  // Find primary base category
  let primaryBase = 'Neck';
  let maxBaseCount = -1;
  Object.keys(baseCounts).forEach(base => {
    if (baseCounts[base] > maxBaseCount) {
      maxBaseCount = baseCounts[base];
      primaryBase = base;
    }
  });

  // Find primary detailed part
  let primaryPart = 'Neck_Cervical';
  let maxPartCount = -1;
  Object.keys(partCounts).forEach(part => {
    if (partCounts[part] > maxPartCount) {
      maxPartCount = partCounts[part];
      primaryPart = part;
    }
  });

  const primaryPartLabel = getPartLabel(primaryPart);
  const primaryPartAvgPain = Number((partLevelSums[primaryPart] / partCounts[primaryPart]).toFixed(1));

  // Collect user notes
  const notesList = records.map(r => r.notes).filter(Boolean) as string[];
  const combinedNotes = notesList.length > 0 ? `"${notesList.slice(0, 2).join(' / ')}"` : '';

  // 3. Determine diagnosis and recommended clinic based on tracking period
  let predicted_condition = '';
  let recommended_dept = '';
  let aiSummary = '';

  if (isShortPeriod) {
    // Acute / Short term diagnostics
    recommended_dept = '내과 또는 이비인후과';
    if (primaryBase === 'Head') {
      predicted_condition = '환절기 알레르기 비염 또는 초기 감기 몸살';
      recommended_dept = '이비인후과 또는 내과';
      aiSummary = `최근 짧은 기록 분석 결과, [${primaryPartLabel}] 주변의 통증 및 불편감이 감지되었습니다. \n\n` +
        `기록 수 및 기간이 단기(3일 미만)에 해당하며, 특히 작성하신 메모 ${combinedNotes || '내용'}로 미루어 볼 때 환절기 기온 변화로 인한 알레르기성 비염이나 초기 감기 몸살로 인한 긴장성 두통일 가능성이 큽니다. \n\n` +
        `비타민 C를 충분히 섭취하시고, 실내 습도를 50-60%로 유지하며 충분한 휴식을 취하시기 바랍니다. 증상이 지속된다면 내과 또는 이비인후과 방문을 권장합니다.`;
    } else if (primaryBase === 'Neck' || primaryBase === 'Shoulder') {
      predicted_condition = '급성 근육 경직 (일시적 담 걸림) 및 목 염좌';
      recommended_dept = '정형외과 또는 마취통증의학과';
      aiSummary = `최근 짧은 관찰 결과, 어깨 및 목 부근인 [${primaryPartLabel}]에 급격한 근육 수축이 감지되었습니다. \n\n` +
        `일시적으로 잘못된 취침 자세나 급격한 스트레스, 컴퓨터 모니터 과주시로 인해 흔히 발생하는 '담 걸림' 혹은 초기 목 염좌 증세입니다. \n\n` +
        `무리한 스트레칭보다는 가벼운 온열 찜질로 굳어진 근육을 풀어주시고 소염 진통제 복용이나 정형외과 물리치료를 병행하는 것을 권장합니다.`;
    } else if (primaryBase === 'Wrist') {
      predicted_condition = '일시적 손목 과부하 및 건초염';
      recommended_dept = '정형외과 또는 수부외과';
      aiSummary = `최근 기록 분석 결과, [${primaryPartLabel}] 부근의 일시적인 통증이 증가하고 있습니다. \n\n` +
        `타건 업무 급증으로 인한 일시적인 손목 신전건 과부하로 보입니다. 방치할 경우 만성 건초염으로 발전할 수 있으므로 주의해야 합니다. \n\n` +
        `마우스 사용 시 보호대를 착용하고 1시간 간격으로 손가락을 가볍게 뒤로 젖혀주는 릴랙스 스트레칭을 3일 동안 수행해 주시기 바랍니다.`;
    } else if (primaryBase === 'Back') {
      predicted_condition = '급성 요추 염좌 (일시적 허리 삠)';
      recommended_dept = '정형외과 또는 신경외과';
      aiSummary = `최근 단기 통증 분석 결과, [${primaryPartLabel}] 부근의 급성 요추 염좌 가능성이 보입니다. \n\n` +
        `의자에서 일어나거나 물건을 들 때 허리 근육이나 인대에 일시적인 충격이 가해진 상태입니다. \n\n` +
        `2-3일 동안은 허리를 굽히거나 무리한 동작을 삼가고 평평한 바닥에 누워 냉찜질을 취해 척추 긴장도를 낮추는 것이 매우 중요합니다.`;
    } else {
      predicted_condition = '일시적인 하체 관절 및 건 과부하';
      recommended_dept = '정형외과 또는 재활의학과';
      aiSummary = `최근 하체 관절 [${primaryPartLabel}] 부근에 급성 통증 지표가 나타났습니다. \n\n` +
        `보행량 증가나 계단 오르내리기 등 일시적인 관절 압박으로 인한 경미한 인대 염좌 혹은 근막통증일 가능성이 큽니다. \n\n` +
        `냉찜질과 함께 관절 주변의 충분한 압박/고정을 취하고 당분간 하체 하중이 가해지는 과도한 운동은 피하시기를 적극 권장합니다.`;
    }
  } else {
    // Chronic / Long term diagnostics
    recommended_dept = '정형외과 또는 신경외과';
    if (primaryBase === 'Head') {
      predicted_condition = '만성 긴장성 두통 및 편두통 의심';
      recommended_dept = '신경과 또는 마취통증의학과';
      aiSummary = `장기 정밀 분석(3일 이상 누적 기록) 결과, [${primaryPartLabel}] 주변의 두통 통증이 만성화되는 경향이 관찰됩니다. \n\n` +
        `특히 작성된 메모 ${combinedNotes || '내용'} 및 낮은 수면 효율(${avgSleep}시간)이 신경 자극을 누적시켜 편두통 또는 만성 긴장성 두통을 유발하고 있습니다. \n\n` +
        `두경부 주변의 마사지 및 마그네슘 등의 영양제 보충이 중요하며, 증상 호전이 없을 시 신경과 정밀 검진을 통해 약물 예방 치료를 고려해야 합니다.`;
    } else if (primaryBase === 'Neck') {
      predicted_condition = '초기 목 디스크 (경추 추간판 탈출증) 의심';
      recommended_dept = '정형외과 또는 재활의학과 (MRI 권장)';
      aiSummary = `장기 분석 결과, 목 뒤 중심인 [${primaryPartLabel}] 부위의 통증 강도(평균 ${primaryPartAvgPain}/10)가 지속적으로 높게 측정되었습니다. \n\n` +
        `일시적 피로를 넘어 경추 디스크(추간판)가 눌려 주변 신경을 압박하는 초기 경추 탈출증 가능성이 우려됩니다. \n\n` +
        `모니터 높이를 눈선에 맞춰 바른 자세(${avgPosture}점 개선 필요)를 유지해야 하며, 마비감이나 팔 저림이 동반된다면 병원을 방문해 MRI 등 정밀 진단을 받을 것을 강하게 권장합니다.`;
    } else if (primaryBase === 'Shoulder') {
      predicted_condition = '근막통증증후군 및 초기 회전근개 손상 의심';
      recommended_dept = '정형외과 또는 마취통증의학과';
      aiSummary = `장기 정밀 진단 결과, [${primaryPartLabel}] 부근의 만성 근육 수축 및 인대 부하가 누적되었습니다. \n\n` +
        `어깨 관절 주변의 인대 손상(회전근개 개별 파열) 또는 근육이 돌처럼 굳어지는 만성 근막통증증후군 가능성이 높습니다. \n\n` +
        `정형외과 정밀 체외충격파나 도수치료를 추천하며, 일상 중 으쓱어깨나 웅크리는 습관을 예방하기 위해 상체 스트레칭을 상시화해 주세요.`;
    } else if (primaryBase === 'Wrist') {
      predicted_condition = '수근관 증후군 (손목 터널 증후군) 의심';
      recommended_dept = '정형외과 또는 수부외과 (근전도 검사 권장)';
      aiSummary = `장기 통증 데이터 분석 결과, [${primaryPartLabel}] 부근의 지속적인 찌릿함과 뻐근함이 감지되었습니다. \n\n` +
        `타건 압력이 신경 관로를 계속 좁히면서 정중신경이 압박을 받는 '손목 터널 증후군' 의심 상태입니다. \n\n` +
        `근전도 정밀 검사로 신경 전도 상태를 정밀 체크해야 하며, 버티컬 마우스 교체 및 장시간 코딩 시 손목 꺾임 각도를 방지하는 전용 쿠션을 필수 사용해야 합니다.`;
    } else if (primaryBase === 'Back') {
      predicted_condition = '요추 추간판 탈출증 (허리 디스크) 의심';
      recommended_dept = '정형외과 또는 신경외과 (정밀 MRI 권장)';
      aiSummary = `장기 누적 데이터 분석 결과, [${primaryPartLabel}] 요추와 엉치 주변의 통증이 장기화되고 있습니다. \n\n` +
        `오랜 착석 습관과 무너진 척추 정렬(${avgPosture}점)로 인해 요추 디스크 섬유륜에 압박이 누적된 초기 디스크 의심 상태입니다. \n\n` +
        `골반 정렬 의자와 요추 쿠션을 통한 척추 C자 만곡 보존이 매우 긴급하며, 다리 저림이 동반된다면 MRI 검사를 통해 신경 압박율을 정밀 확인해야 합니다.`;
    } else {
      predicted_condition = '퇴행성 관절염 초기 또는 만성 족저근막염 의심';
      recommended_dept = '정형외과 또는 관절 전문 클리닉';
      aiSummary = `장기 누적 통증 분석 결과, 하체 관절 및 발의 [${primaryPartLabel}] 영역에 통증 인자가 장기 검출되고 있습니다. \n\n` +
        `무릎 연골의 불균형 마모에 따른 초기 관절염 혹은 발바닥 아치 지탱력 소실에 따른 족저근막염 가능성이 의심됩니다. \n\n` +
        `신발에 충격 완화 깔창을 꼭 삽입해 주시고, 족부 전문 병원이나 관절 병원에서 초음파/엑스레이 촬영을 통해 정확한 인대 손상도를 체크하기를 추천합니다.`;
    }
  }

  // 4. Correlation and Symptoms formulation
  let habitsAnalysis = `💡 분석 결과, 주간 평균 수면 시간은 ${avgSleep}시간, 평소 척추/자세 정렬 점수는 ${avgPosture}점(5점 만점)으로 나타났습니다.\n\n`;
  const badPostureRecords = records.filter(r => r.posture_rating <= 3);
  const badPosturePainSum = badPostureRecords.reduce((sum, r) => sum + r.pain_level, 0);
  const avgPainWithBadPosture = badPostureRecords.length > 0 ? Number((badPosturePainSum / badPostureRecords.length).toFixed(1)) : avgPain;

  const lowSleepRecords = records.filter(r => r.sleep_hours < 6);
  const lowSleepPainSum = lowSleepRecords.reduce((sum, r) => sum + r.pain_level, 0);
  const avgPainWithLowSleep = lowSleepRecords.length > 0 ? Number((lowSleepPainSum / lowSleepRecords.length).toFixed(1)) : avgPain;

  if (badPostureRecords.length > 0 && avgPainWithBadPosture > avgPain) {
    habitsAnalysis += `• 척추 불균형 영향: 자세 정렬 점수가 낮았던 날(3점 이하)의 통증 수치는 평소 대비 약 ${Number((avgPainWithBadPosture - avgPain).toFixed(1))}단계 더 가파르게 상승하여 평균 ${avgPainWithBadPosture}점을 기록했습니다. 이는 주로 구부정한 자세나 다리 꼬기 습관이 근골격에 큰 과부하를 가하고 있음을 강력히 시사합니다. 특히 ${primaryPartLabel} 부위의 압박이 누적되고 있습니다.\n`;
  } else {
    habitsAnalysis += `• 자세 패턴: 평소 자세 교정에 신경을 쓰고 계시지만, ${primaryPartLabel} 부위의 반복적 긴장이 누적되고 있을 가능성이 있습니다. 장시간 부동자세를 유지하는 빈도를 낮추고 50분 근무 후 5분 스트레칭을 루틴화하세요.\n`;
  }

  if (lowSleepRecords.length > 0 && avgPainWithLowSleep > avgPain) {
    habitsAnalysis += `• 수면 결핍 영향: 수면이 6시간 미만으로 부족했던 날의 통증 평균은 ${avgPainWithLowSleep}점으로 전체 평균을 크게 상회했습니다. 수면 부족 시 통증 전달 인자가 활성화되고 근육 이완 시간이 결핍되어 신체 통증 민감도가 더욱 예민해지는 전형적인 패턴입니다. 최소 6.5시간의 숙면 확보가 최우선 해결책입니다.`;
  } else {
    habitsAnalysis += `• 수면 패턴: 수면 효율은 비교적 안정적이나 뇌와 척추 근육의 충분한 피로 해소를 위해 숙면 리듬 형성이 요구됩니다.`;
  }

  const symptomsSummary = `📊 분석 기간 동안 총 ${totalRecords}회의 자가 보고 기록이 접수되었습니다. 가장 두드러지게 관찰된 통증 세부 부위는 **${primaryPartLabel}**(으)로, 이 부위의 평균 통증 강도는 **${primaryPartAvgPain}/10** 수준의 높은 불편감을 기록했습니다.\n\n` + 
    `전체 부위 평균 통증 지수는 **${avgPain}/10** 점이며, 대분류별 발생 빈도 비율은 ` +
    Object.entries(baseCounts)
      .map(([base, count]) => `${BASE_PART_KOREAN[base] || base} (${Number((count / totalRecords * 100).toFixed(0))}%)`)
      .join(', ') + ' 순이었습니다.';

  return {
    report_type: type,
    ai_summary: aiSummary,
    recommended_dept: recommended_dept,
    symptoms_summary: symptomsSummary,
    habits_analysis: habitsAnalysis,
    ai_model: '로컬 룰 엔진',
    analysis_type,
    predicted_condition
  };
}

// Asynchronous call to external APIs (OpenAI or Gemini)
export async function generateAIReportAsync(
  records: PainRecord[],
  type: 'weekly' | 'monthly',
  config: { model: string; apiKey: string }
): Promise<GeneratedReportData> {
  if (records.length === 0) {
    return generateAIReport(records, type);
  }

  const sorted = [...records].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  const earliest = new Date(sorted[0].recorded_at);
  const latest = new Date(sorted[sorted.length - 1].recorded_at);
  const diffTime = Math.abs(latest.getTime() - earliest.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isShortPeriod = diffDays < 3 || records.length < 3;
  const analysis_type = isShortPeriod ? 'short' : 'long';

  const systemPrompt = `당신은 헬스케어 AI 전문 분석의입니다. 사용자의 통증 기록 데이터를 바탕으로 종합 헬스 리포트를 작성해야 합니다.
결과는 반드시 다음 JSON 스키마를 따르는 JSON 데이터로만 반환하십시오:
{
  "report_type": "${type}",
  "ai_summary": "AI 전문 소견 및 행동 가이드 (사용자 맞춤형 친근한 어투, 구체적인 원인 분석 및 해결 팁 포함)",
  "recommended_dept": "추천 임상 진료과 (예: 정형외과, 이비인후과, 신경과 등)",
  "symptoms_summary": "통증 발생 및 강도에 대한 요약 분석",
  "habits_analysis": "생활 습관(수면, 자세)과의 상관관계 분석 및 권장 가이드",
  "predicted_condition": "예측된 주요 질환명 (단기 기록 시 알레르기 비염, 감기 몸살 등 / 장기 기록 시 목 디스크, 수근관 증후군 등)"
}

중요:
- 입력 데이터의 기간(최초 기록일과 최종 기록일의 차이)이 3일 미만 또는 기록 수가 3건 미만으로 짧다면, '환절기 비염', '초기 감기 몸살', '급성 담'과 같은 단기성/급성 질환 위주로 예측하십시오.
- 입력 데이터의 기간이 3일 이상이고 기록 수도 3건 이상으로 길다면, '거북목 증후군', '목 디스크 초기', '수근관 증후군(손목 터널 증후군)', '허리 디스크'와 같은 장기적이고 정밀 검사가 필요한 만성 질환 위주로 예측하십시오.
- 사용자의 메모(증상 특이사항)를 중요하게 반영하여 분석하십시오.`;

  const formattedRecords = records.map(r => ({
    date: new Date(r.recorded_at).toLocaleDateString('ko-KR'),
    pain_level: r.pain_level,
    body_part: getPartLabel(r.body_part),
    sleep_hours: r.sleep_hours,
    posture_rating: r.posture_rating,
    notes: r.notes || ''
  }));

  const userPrompt = `
사용자 통증 로그 데이터:
${JSON.stringify(formattedRecords, null, 2)}

진단 기간 유형: ${isShortPeriod ? '단기 관찰 (3일 미만 또는 데이터 부족 - 감기, 비염, 급성 담 등 예측 요망)' : '장기 추적 분석 (3일 이상 데이터 축적 - 목디스크, 수근관증후군, 허리디스크 등 만성 질환 분석 요망)'}

위의 데이터를 활용하여 지정된 JSON 구조로 답변해 주십시오. JSON 마크다운 (\`\`\`json) 기호 없이 순수한 JSON 내용만 반환해 주십시오.`;

  try {
    if (config.model.startsWith('gpt')) {
      // OpenAI API Call via backend proxy
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        let errMsg = `OpenAI Proxy HTTP error: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.error) {
            errMsg += ` - ${errData.error}`;
            if (errData.details) {
              errMsg += ` (${JSON.stringify(errData.details)})`;
            }
          }
        } catch {}
        throw new Error(errMsg);
      }

      const resJson = await response.json();
      const parsed = JSON.parse(resJson.choices[0].message.content.trim());
      return {
        ...parsed,
        ai_model: 'GPT-4o-mini',
        analysis_type
      };
    } else if (config.model.startsWith('gemini')) {
      // Gemini API Call via backend proxy
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt + '\n\n' + userPrompt }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        let errMsg = `Gemini Proxy HTTP error: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.error) {
            errMsg += ` - ${errData.error}`;
            if (errData.details) {
              errMsg += ` (${JSON.stringify(errData.details)})`;
            }
          }
        } catch {}
        throw new Error(errMsg);
      }

      const resJson = await response.json();
      const text = resJson.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(text.trim());
      return {
        ...parsed,
        ai_model: 'Gemini 3.5 Flash',
        analysis_type
      };
    } else {
      throw new Error('지원하지 않는 모델입니다.');
    }
  } catch (error) {
    console.error('External AI API error, falling back to local engine:', error);
    // Graceful fallback to local rule engine
    const local = generateAIReport(records, type);
    return {
      ...local,
      ai_model: `${config.model.toUpperCase()} (로컬 엔진 대체 - API 오류)`,
      ai_summary: `[⚠️ 알림: API 호출 에러 또는 CORS 차단으로 인해 로컬 AI 진단으로 자동 대체되었습니다. 입력하신 API Key 및 네트워크 상태를 다시 한번 확인해 주세요.]\n\n` + local.ai_summary
    };
  }
}
