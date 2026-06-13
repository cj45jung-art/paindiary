// Simple, robust database layer with built-in LocalStorage mockup support
// so that the web app is 100% functional out of the box without active Supabase setup.

export interface User {
  id: string;
  email: string;
  nickname: string;
  created_at: string;
}

export interface PainRecord {
  id: string;
  user_id: string;
  pain_level: number; // 1-10
  body_part: string; // Neck, Shoulder, Back, Wrist, Head, Knee, etc.
  sleep_hours: number;
  posture_rating: number; // 1-5 or 1-10
  recorded_at: string;
  notes?: string;
}

export interface Report {
  id: string;
  user_id: string;
  report_type: 'weekly' | 'monthly';
  ai_summary: string;
  recommended_dept: string;
  created_at: string;
  symptoms_summary: string;
  habits_analysis: string;
}

export interface Product {
  id: string;
  target_symptom: string; // Wrist, Neck, Back, Head, Knee, General
  product_name: string;
  affiliate_url: string;
  image_url: string;
  price: string;
  description: string;
}

// Pre-seeded high quality products based on PRD and TRD
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-wrist-1',
    target_symptom: 'Wrist',
    product_name: '인체공학 버티컬 무선 마우스',
    affiliate_url: 'https://search.shopping.naver.com/search/all?query=버티컬+마우스',
    image_url: '🖱️',
    price: '49,000원',
    description: '수근관 증후군 및 손목 통증 완화를 위한 57도 인체공학적 수직 설계 마우스.'
  },
  {
    id: 'prod-wrist-2',
    target_symptom: 'Wrist',
    product_name: '고밀도 메모리폼 손목 받침대 세트',
    affiliate_url: 'https://search.shopping.naver.com/search/all?query=손목+받침대',
    image_url: '⌨️',
    price: '18,500원',
    description: '키보드와 마우스 타건 시 손목 꺾임을 방지하고 쿠션감을 주는 메모리폼 손목 보호대.'
  },
  {
    id: 'prod-neck-1',
    target_symptom: 'Neck',
    product_name: '경추 C자형 기능성 정형베개',
    affiliate_url: 'https://search.shopping.naver.com/search/all?query=경추베개',
    image_url: '🛏️',
    price: '39,900원',
    description: '거북목과 일자목 교정을 돕고, 수면 중 바른 경추 C자 커브 유지에 도움을 주는 숙면 베개.'
  },
  {
    id: 'prod-neck-2',
    target_symptom: 'Neck',
    product_name: '목 어깨 지압 저주파 마사지기',
    affiliate_url: 'https://search.shopping.naver.com/search/all?query=목+마사지기',
    image_url: '⚡',
    price: '29,000원',
    description: '뭉친 목근육과 어깨 승모근을 TENS 미세전류 자극과 온열 기능으로 풀어주는 휴대용 기기.'
  },
  {
    id: 'prod-back-1',
    target_symptom: 'Back',
    product_name: '메모리폼 인체공학 허리 등받이 쿠션',
    affiliate_url: 'https://search.shopping.naver.com/search/all?query=허리+쿠션',
    image_url: '🪑',
    price: '25,000원',
    description: '의자 장시간 착석 시 무너지는 요추 라인을 C자형 서포트로 올바르게 지탱해 주는 허리 등받이.'
  },
  {
    id: 'prod-back-2',
    target_symptom: 'Back',
    product_name: '골반 및 자세 교정 바른자세 의자',
    affiliate_url: 'https://search.shopping.naver.com/search/all?query=자세교정+의자',
    image_url: '🧘',
    price: '59,000원',
    description: '지렛대 원리로 허리를 세워주어 척추 부담을 감소시키고 꼬리뼈 통증을 완화하는 보조 의자.'
  },
  {
    id: 'prod-head-1',
    target_symptom: 'Head',
    product_name: '고함량 킬레이트 마그네슘 + 비타민B 복합체',
    affiliate_url: 'https://search.shopping.naver.com/search/all?query=마그네슘',
    image_url: '💊',
    price: '22,000원',
    description: '신경 안정과 근육 이완에 필수적인 마그네슘 공급으로 만성 편두통 및 긴장성 두통 케어.'
  },
  {
    id: 'prod-head-2',
    target_symptom: 'Head',
    product_name: '암막 온열 안대 (스마트 타이머 탑재)',
    affiliate_url: 'https://search.shopping.naver.com/search/all?query=온열안대',
    image_url: '👀',
    price: '19,800원',
    description: '수면 부족 및 스트레스로 인한 안구 건조와 긴장성 두통을 따뜻한 온열로 풀어주는 숙면 안대.'
  },
  {
    id: 'prod-knee-1',
    target_symptom: 'Knee',
    product_name: '의료용 3D 네오프렌 무릎 보호대 (양측 지지대형)',
    affiliate_url: 'https://search.shopping.naver.com/search/all?query=무릎+보호대',
    image_url: '🦵',
    price: '27,000원',
    description: '무릎 슬개골 관절을 단단히 고정하고 하중 분산 및 연골 압박을 줄여주는 스포츠 기능성 보호대.'
  },
  {
    id: 'prod-general-1',
    target_symptom: 'General',
    product_name: '고함량 rTG 오메가3 + 비타민D',
    affiliate_url: 'https://search.shopping.naver.com/search/all?query=오메가3',
    image_url: '🐟',
    price: '32,000원',
    description: '체내 염증 물질 생성을 억제하고 관절 및 근육 건강 유지에 기여하는 고순도 흡수율 오메가3.'
  }
];

// Mock user representing "김직장 (Kim Jikjang)"
const DEFAULT_USER: User = {
  id: 'usr-default',
  email: 'kimdeveloper@paindiary.com',
  nickname: '김직장',
  created_at: new Date().toISOString()
};

// Simple Seeding for Demo records
const SEED_RECORDS: PainRecord[] = [
  {
    id: 'rec-1',
    user_id: 'usr-default',
    pain_level: 6,
    body_part: 'Neck',
    sleep_hours: 5.5,
    posture_rating: 3,
    recorded_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    notes: '하루 종일 듀얼 모니터 코딩 진행. 거북목 증상 심해짐.'
  },
  {
    id: 'rec-2',
    user_id: 'usr-default',
    pain_level: 7,
    body_part: 'Back',
    sleep_hours: 6,
    posture_rating: 2,
    recorded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: '다리 꼬고 앉는 습관 때문에 허리 뻐근함.'
  },
  {
    id: 'rec-3',
    user_id: 'usr-default',
    pain_level: 4,
    body_part: 'Wrist',
    sleep_hours: 7,
    posture_rating: 4,
    recorded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: '마우스 조작 시 오른쪽 손목 찌릿함 유발.'
  },
  {
    id: 'rec-4',
    user_id: 'usr-default',
    pain_level: 8,
    body_part: 'Neck',
    sleep_hours: 5,
    posture_rating: 2,
    recorded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: '마감 하루 전 야근. 잠 부족하고 목덜미가 너무 뻣뻣함.'
  }
];

class DatabaseService {
  private isClient = typeof window !== 'undefined';

  private getItem(key: string): string | null {
    if (!this.isClient) return null;
    return localStorage.getItem(key);
  }

  private setItem(key: string, value: string): void {
    if (!this.isClient) return;
    localStorage.setItem(key, value);
  }

  // Auth Operations
  getCurrentUser(): User {
    const userStr = this.getItem('pd_user');
    if (!userStr) {
      this.setItem('pd_user', JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return JSON.parse(userStr);
  }

  updateProfile(nickname: string, email: string): User {
    const currentUser = this.getCurrentUser();
    const updated = { ...currentUser, nickname, email };
    this.setItem('pd_user', JSON.stringify(updated));
    return updated;
  }

  // Pain Records CRUD
  getRecords(): PainRecord[] {
    const recordsStr = this.getItem('pd_records');
    if (!recordsStr) {
      this.setItem('pd_records', JSON.stringify(SEED_RECORDS));
      return SEED_RECORDS;
    }
    return JSON.parse(recordsStr);
  }

  addRecord(record: Omit<PainRecord, 'id' | 'user_id' | 'recorded_at'>): PainRecord {
    const records = this.getRecords();
    const user = this.getCurrentUser();
    
    const newRecord: PainRecord = {
      ...record,
      id: 'rec-' + Date.now(),
      user_id: user.id,
      recorded_at: new Date().toISOString()
    };
    
    records.unshift(newRecord); // Place latest at top
    this.setItem('pd_records', JSON.stringify(records));
    return newRecord;
  }

  deleteRecord(id: string): void {
    const records = this.getRecords();
    const filtered = records.filter(r => r.id !== id);
    this.setItem('pd_records', JSON.stringify(filtered));
  }

  // Reports CRUD
  getReports(): Report[] {
    const reportsStr = this.getItem('pd_reports');
    if (!reportsStr) return [];
    return JSON.parse(reportsStr);
  }

  saveReport(report: Omit<Report, 'id' | 'user_id' | 'created_at'>): Report {
    const reports = this.getReports();
    const user = this.getCurrentUser();
    
    const newReport: Report = {
      ...report,
      id: 'rep-' + Date.now(),
      user_id: user.id,
      created_at: new Date().toISOString()
    };
    
    reports.unshift(newReport);
    this.setItem('pd_reports', JSON.stringify(reports));
    return newReport;
  }

  deleteReport(id: string): void {
    const reports = this.getReports();
    const filtered = reports.filter(r => r.id !== id);
    this.setItem('pd_reports', JSON.stringify(filtered));
  }

  // Commerce Products Fetching
  getProducts(): Product[] {
    return DEFAULT_PRODUCTS;
  }

  getProductsBySymptom(symptom: string): Product[] {
    const matches = DEFAULT_PRODUCTS.filter(p => p.target_symptom.toLowerCase() === symptom.toLowerCase());
    const general = DEFAULT_PRODUCTS.filter(p => p.target_symptom.toLowerCase() === 'general');
    return [...matches, ...general].slice(0, 3); // top 3 recommendations
  }

  // Reset entire database to default seeds
  resetDatabase(): void {
    if (!this.isClient) return;
    localStorage.removeItem('pd_records');
    localStorage.removeItem('pd_reports');
    localStorage.removeItem('pd_user');
    this.getCurrentUser();
    this.getRecords();
  }
}

export const db = new DatabaseService();
export default db;
