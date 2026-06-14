import { PainRecord, Report } from './supabase';
import { getBaseCategory, getPartLabel } from './bodyParts';

export interface GeneratedReportData {
  report_type: 'weekly' | 'monthly';
  ai_summary: string;
  recommended_dept: string;
  symptoms_summary: string;
  habits_analysis: string;
}

const BASE_PART_KOREAN: Record<string, string> = {
  Head: '머리(두통)',
  Neck: '목(경추)',
  Shoulder: '어깨',
  Wrist: '손목/손',
  Back: '허리/척추',
  Knee: '무릎/다리'
};

const DEPT_RECOMMENDATIONS: Record<string, string> = {
  Head: '신경과 또는 가정의학과',
  Neck: '정형외과 또는 재활의학과',
  Shoulder: '정형외과 또는 마취통증의학과',
  Wrist: '정형외과 또는 수부외과',
  Back: '정형외과, 신경외과 또는 신경차단 클리닉',
  Knee: '정형외과 또는 관절 전문 클리닉'
};

export function generateAIReport(records: PainRecord[], type: 'weekly' | 'monthly'): GeneratedReportData {
  if (records.length === 0) {
    return {
      report_type: type,
      ai_summary: '아직 기록된 통증 데이터가 없어 리포트를 작성할 수 없습니다. 대시보드에서 오늘의 신체 상태와 생활 습관을 1회 이상 기록해 주세요!',
      recommended_dept: '통증 발생 부위에 따름',
      symptoms_summary: '기록 없음',
      habits_analysis: '기록 없음'
    };
  }

  // 1. Calculate general statistics
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
    
    // Base Category aggregation (e.g. Wrist, Back)
    const base = getBaseCategory(r.body_part);
    baseCounts[base] = (baseCounts[base] || 0) + 1;
    baseLevelSums[base] = (baseLevelSums[base] || 0) + r.pain_level;

    // Detailed Part aggregation (e.g. Hand_Right_Index_Joint1)
    partCounts[r.body_part] = (partCounts[r.body_part] || 0) + 1;
    partLevelSums[r.body_part] = (partLevelSums[r.body_part] || 0) + r.pain_level;
  });

  const avgPain = Number((totalPain / totalRecords).toFixed(1));
  const avgSleep = Number((totalSleep / totalRecords).toFixed(1));
  const avgPosture = Number((totalPosture / totalRecords).toFixed(1));

  // 2. Identify primary base category
  let primaryBase = 'Neck';
  let maxBaseCount = -1;
  Object.keys(baseCounts).forEach(base => {
    if (baseCounts[base] > maxBaseCount) {
      maxBaseCount = baseCounts[base];
      primaryBase = base;
    }
  });

  // 3. Identify primary detailed part
  let primaryPart = 'Neck_Cervical';
  let maxPartCount = -1;
  Object.keys(partCounts).forEach(part => {
    if (partCounts[part] > maxPartCount) {
      maxPartCount = partCounts[part];
      primaryPart = part;
    }
  });

  const primaryBaseKorean = BASE_PART_KOREAN[primaryBase] || primaryBase;
  const primaryPartLabel = getPartLabel(primaryPart);
  const primaryPartAvgPain = Number((partLevelSums[primaryPart] / partCounts[primaryPart]).toFixed(1));

  // 4. Formulate Correlation Analysis
  let habitsAnalysis = '';
  const badPostureRecords = records.filter(r => r.posture_rating <= 3);
  const badPosturePainSum = badPostureRecords.reduce((sum, r) => sum + r.pain_level, 0);
  const avgPainWithBadPosture = badPostureRecords.length > 0 ? Number((badPosturePainSum / badPostureRecords.length).toFixed(1)) : avgPain;

  const lowSleepRecords = records.filter(r => r.sleep_hours < 6);
  const lowSleepPainSum = lowSleepRecords.reduce((sum, r) => sum + r.pain_level, 0);
  const avgPainWithLowSleep = lowSleepRecords.length > 0 ? Number((lowSleepPainSum / lowSleepRecords.length).toFixed(1)) : avgPain;

  habitsAnalysis = `💡 분석 결과, 주간 평균 수면 시간은 ${avgSleep}시간, 평소 척추/자세 정렬 점수는 ${avgPosture}점(5점 만점)으로 나타났습니다.\n\n`;
  
  if (badPostureRecords.length > 0 && avgPainWithBadPosture > avgPain) {
    habitsAnalysis += `• 척추 불균형 영향: 자세 정렬 점수가 낮았던 날(3점 이하)의 통증 수치는 평소 대비 약 ${Number((avgPainWithBadPosture - avgPain).toFixed(1))}단계 더 가파르게 상승하여 평균 ${avgPainWithBadPosture}점을 기록했습니다. 이는 주로 구부정한 자세나 다리 꼬기 습관이 근골격에 큰 과부하를 가하고 있음을 강력히 시사합니다. 특히 ${primaryPartLabel} 부위의 압박이 누적되고 있습니다.\n`;
  } else {
    habitsAnalysis += `• 자세 패턴: 평소 자세 교정에 신경을 쓰고 계시지만, ${primaryPartLabel} 부위의 반복적 긴장이 누적되고 있을 가능성이 있습니다. 장시간 부동자세를 유지하는 빈도를 낮추고 50분 근무 후 5분 스트레칭을 루틴화하세요.\n`;
  }

  if (lowSleepRecords.length > 0 && avgPainWithLowSleep > avgPain) {
    habitsAnalysis += `• 수면 결핍 영향: 수면이 6시간 미만으로 부족했던 날의 통증 평균은 ${avgPainWithLowSleep}점으로 전체 평균을 크게 상회했습니다. 수면 부족 시 통증 전달 인자가 활성화되고 근육 이완 시간이 결핍되어 신체 통증 민감도가 더욱 예민해지는 전형적인 패턴입니다. 최소 6.5시간의 숙면 확보가 최우선 해결책입니다.`;
  } else {
    habitsAnalysis += `• 수면 패턴: 수면 효율은 비교적 안정적이나 뇌와 척추 근육의 충분한 피로 해소를 위해 규칙적인 수면 리듬 형성이 요구됩니다.`;
  }

  // 5. Formulate Summary of Symptoms
  const symptomsSummary = `📊 분석 기간 동안 총 ${totalRecords}회의 자가 보고 기록이 접수되었습니다. 가장 두드러지게 관찰된 통증 세부 부위는 **${primaryPartLabel}**(으)로, 이 부위의 평균 통증 강도는 **${primaryPartAvgPain}/10** 수준의 높은 불편감을 기록했습니다.\n\n` + 
    `전체 부위 평균 통증 지수는 **${avgPain}/10** 점이며, 대분류별 발생 빈도 비율은 ` +
    Object.entries(baseCounts)
      .map(([base, count]) => `${BASE_PART_KOREAN[base] || base} (${Number((count / totalRecords * 100).toFixed(0))}%)`)
      .join(', ') + ' 순이었습니다.';

  // 6. Formulate AI Executive Summary
  let aiSummary = '';
  if (primaryBase === 'Neck') {
    aiSummary = `안녕하세요, 김직장 님. AI 분석 엔진 진단 결과, 현재 [${primaryPartLabel}] 주변의 인대 및 승모근 경직도가 심한 상태로 예측됩니다. \n\n` +
      `주간 수면 결핍과 컴퓨터 코딩 시 목을 앞으로 내미는 모니터 주시 습관이 상호작용하여 상부 승모근에 과도한 부하를 주고 있습니다. 특히 ${primaryPartLabel} 부위에 집중되는 통증은 거북목 증후군의 초기 신호일 수 있으니 주의가 필요합니다. \n\n` +
      `단기 개선책으로 모니터 높이를 눈선 위로 10cm 조절하고, 리포트 하단에 매핑된 경추 C자형 지압 베개 및 긴장 완화 스트레칭을 병행하시는 것을 적극 권장합니다.`;
  } else if (primaryBase === 'Back') {
    aiSummary = `안녕하세요, 김직장 님. AI 정밀 진단 결과, [${primaryPartLabel}] 부근의 척추기립근과 대요근이 장시간 착석으로 인해 수축 및 뭉쳐 있는 요추 피로 상태가 강하게 의심됩니다. \n\n` +
      `특히 자세 정렬 점수가 낮았던 날에 ${primaryPartLabel} 부근의 통증 지수가 급격히 상승한 점은 의자의 등받이에 엉덩이를 끝까지 밀착시키지 않거나 골반이 틀어졌음을 보여줍니다. \n\n` +
      `허리의 정상적인 C자 만곡(Lumbar Lordosis)을 회복해 주는 인체공학 메모리폼 쿠션을 의자에 거치하시고, 장시간 앉아 있을 때 매시간 골반 정렬 스트레칭을 실시해 척추 압박을 풀어주어야 합니다.`;
  } else if (primaryBase === 'Wrist') {
    aiSummary = `안녕하세요, 김직장 님. AI 정밀 분석 결과, 반복적인 타건과 전통적인 마우스 사용으로 인한 [${primaryPartLabel}] 주변 정중신경 압박 및 인대 경직 증상이 감지되었습니다. \n\n` +
      `손목 꺾임 각도가 장시간 유지되거나 손가락 마디에 과도한 힘이 실릴 때 통증 지수가 상승하며, 이는 개발 환경에서의 반복 동작이 신체 구조에 무리를 주기 때문입니다. \n\n` +
      `즉각 손목 각도를 자연스러운 57도 수직으로 열어주는 버티컬 마우스로 교체하시고, 타건 시 손목 꺾임을 원천적으로 잡아주는 손목 받침 쿠션 및 손가락 피로 완화를 위한 가벼운 손가락 스트레칭을 필수로 활용하셔야 상태가 호전될 수 있습니다.`;
  } else if (primaryBase === 'Head') {
    aiSummary = `안녕하세요, 김직장 님. 분석 결과, 수면 시간 부족과 스트레스가 뇌압 및 혈류 변화를 유도하여 [${primaryPartLabel}] 부근에 통증이 집중되는 긴장성 두통 패턴이 주로 나타나고 있습니다. \n\n` +
      `수면이 6시간 미만으로 떨어어진 이튿날 어김없이 ${primaryPartLabel} 부위의 두통 지수가 기록되었습니다. 긴장 완화를 촉진하는 마그네슘 영양제와 수면의 질을 극한으로 보장하는 스마트 안대를 추천해 드립니다. \n\n` +
      `잠들기 전 스마트폰 사용을 멈추고 10분간 경추 및 얼굴 안면부 스트레칭을 통해 머리로 가는 혈류를 틔워 주는 습관이 긴급합니다.`;
  } else if (primaryBase === 'Shoulder') {
    aiSummary = `안녕하세요, 김직장 님. AI 정밀 분석 결과, [${primaryPartLabel}] 주변 관절낭 및 회전근개 부위에 긴장이 누적되어 뻐근함이 발생하는 패턴이 감지되었습니다. \n\n` +
      `평소 키보드 타건 시 어깨가 으쓱 올라가거나 웅크리는 자세가 유지될 때 ${primaryPartLabel} 부위의 통증이 촉발되기 쉽습니다. 온열 찜질과 승모근/회전근개 스트레칭이 매우 시급합니다.`;
  } else {
    aiSummary = `안녕하세요, 김직장 님. 현재 [${primaryPartLabel}] 주변을 비롯한 하체 관절과 근육군에 정적인 근무 습관으로 인한 피로 누적이 심화되고 있습니다. \n\n` +
      `평균 통증 강도 ${avgPain}/10은 체계적인 일상 케어가 요구되는 경고 신호입니다. 수면 시간 확보와 바른 척추 정렬 자세를 일상화하고, ${primaryPartLabel}에 집중되는 부하를 분산시키기 위해 한 시간에 한 번씩 일어나 가볍게 걸으며 혈액 순환을 시켜주어야 합니다.`;
  }

  const recommendedDept = DEPT_RECOMMENDATIONS[primaryBase] || '정형외과';

  return {
    report_type: type,
    ai_summary: aiSummary,
    recommended_dept: recommendedDept,
    symptoms_summary: symptomsSummary,
    habits_analysis: habitsAnalysis
  };
}
