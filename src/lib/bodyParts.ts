export interface BodyPartDetail {
  id: string;
  label: string;
  baseCategory: 'Head' | 'Neck' | 'Shoulder' | 'Wrist' | 'Back' | 'Knee';
  group: string;
}

export const BODY_PARTS_MAP: Record<string, BodyPartDetail> = {
  // Head & Face
  Head_Forehead: { id: 'Head_Forehead', label: '머리 (이마)', baseCategory: 'Head', group: '머리/얼굴' },
  Head_Crown: { id: 'Head_Crown', label: '머리 (정수리)', baseCategory: 'Head', group: '머리/얼굴' },
  Head_Back: { id: 'Head_Back', label: '머리 (뒷머리)', baseCategory: 'Head', group: '머리/얼굴' },
  Head_Temple_Left: { id: 'Head_Temple_Left', label: '머리 (왼쪽 관자놀이)', baseCategory: 'Head', group: '머리/얼굴' },
  Head_Temple_Right: { id: 'Head_Temple_Right', label: '머리 (오른쪽 관자놀이)', baseCategory: 'Head', group: '머리/얼굴' },
  Head_Face: { id: 'Head_Face', label: '얼굴 (눈/코/안구 주변)', baseCategory: 'Head', group: '머리/얼굴' },
  Head_Jaw: { id: 'Head_Jaw', label: '턱 (교근/턱관절)', baseCategory: 'Head', group: '머리/얼굴' },
  Head_Eye_Left: { id: 'Head_Eye_Left', label: '얼굴 (왼쪽 눈 주변)', baseCategory: 'Head', group: '머리/얼굴' },
  Head_Eye_Right: { id: 'Head_Eye_Right', label: '얼굴 (오른쪽 눈 주변)', baseCategory: 'Head', group: '머리/얼굴' },
  Head_Nose: { id: 'Head_Nose', label: '얼굴 (코)', baseCategory: 'Head', group: '머리/얼굴' },
  Head_Mouth: { id: 'Head_Mouth', label: '얼굴 (입/입술)', baseCategory: 'Head', group: '머리/얼굴' },
  Head_Ear_Left: { id: 'Head_Ear_Left', label: '얼굴 (왼쪽 귀)', baseCategory: 'Head', group: '머리/얼굴' },
  Head_Ear_Right: { id: 'Head_Ear_Right', label: '얼굴 (오른쪽 귀)', baseCategory: 'Head', group: '머리/얼굴' },
  Head_Cheek_Left: { id: 'Head_Cheek_Left', label: '얼굴 (왼쪽 뺨)', baseCategory: 'Head', group: '머리/얼굴' },
  Head_Cheek_Right: { id: 'Head_Cheek_Right', label: '얼굴 (오른쪽 뺨)', baseCategory: 'Head', group: '머리/얼굴' },

  // Neck
  Neck_Cervical: { id: 'Neck_Cervical', label: '목 뒤 중심 (경추)', baseCategory: 'Neck', group: '목' },
  Neck_Left: { id: 'Neck_Left', label: '왼쪽 목덜미', baseCategory: 'Neck', group: '목' },
  Neck_Right: { id: 'Neck_Right', label: '오른쪽 목덜미', baseCategory: 'Neck', group: '목' },
  Neck_Front: { id: 'Neck_Front', label: '목 앞부분 (인두/후두)', baseCategory: 'Neck', group: '목' },

  // Shoulder
  Shoulder_Left: { id: 'Shoulder_Left', label: '왼쪽 승모근/어깨', baseCategory: 'Shoulder', group: '어깨' },
  Shoulder_Right: { id: 'Shoulder_Right', label: '오른쪽 승모근/어깨', baseCategory: 'Shoulder', group: '어깨' },

  // Arm & Elbow
  Arm_Left_Elbow: { id: 'Arm_Left_Elbow', label: '왼쪽 팔꿈치', baseCategory: 'Shoulder', group: '팔/팔꿈치' },
  Arm_Right_Elbow: { id: 'Arm_Right_Elbow', label: '오른쪽 팔꿈치', baseCategory: 'Shoulder', group: '팔/팔꿈치' },
  Arm_Left_Forearm: { id: 'Arm_Left_Forearm', label: '왼쪽 팔뚝/전완근', baseCategory: 'Wrist', group: '팔/팔꿈치' },
  Arm_Right_Forearm: { id: 'Arm_Right_Forearm', label: '오른쪽 팔뚝/전완근', baseCategory: 'Wrist', group: '팔/팔꿈치' },

  // Wrist
  Wrist_Left: { id: 'Wrist_Left', label: '왼쪽 손목', baseCategory: 'Wrist', group: '손목/손' },
  Wrist_Right: { id: 'Wrist_Right', label: '오른쪽 손목', baseCategory: 'Wrist', group: '손목/손' },
  Hand_Left_Palm: { id: 'Hand_Left_Palm', label: '왼손 바닥/등', baseCategory: 'Wrist', group: '손목/손' },
  Hand_Right_Palm: { id: 'Hand_Right_Palm', label: '오른손 바닥/등', baseCategory: 'Wrist', group: '손목/손' },

  // Left Hand Fingers
  Hand_Left_Thumb_Joint1: { id: 'Hand_Left_Thumb_Joint1', label: '왼손 엄지 - 1마디(끝)', baseCategory: 'Wrist', group: '손가락(왼손)' },
  Hand_Left_Thumb_Joint2: { id: 'Hand_Left_Thumb_Joint2', label: '왼손 엄지 - 2마디', baseCategory: 'Wrist', group: '손가락(왼손)' },
  Hand_Left_Index_Joint1: { id: 'Hand_Left_Index_Joint1', label: '왼손 검지 - 1마디(끝)', baseCategory: 'Wrist', group: '손가락(왼손)' },
  Hand_Left_Index_Joint2: { id: 'Hand_Left_Index_Joint2', label: '왼손 검지 - 2마디', baseCategory: 'Wrist', group: '손가락(왼손)' },
  Hand_Left_Index_Joint3: { id: 'Hand_Left_Index_Joint3', label: '왼손 검지 - 3마디(뿌리)', baseCategory: 'Wrist', group: '손가락(왼손)' },
  Hand_Left_Middle_Joint1: { id: 'Hand_Left_Middle_Joint1', label: '왼손 중지 - 1마디(끝)', baseCategory: 'Wrist', group: '손가락(왼손)' },
  Hand_Left_Middle_Joint2: { id: 'Hand_Left_Middle_Joint2', label: '왼손 중지 - 2마디', baseCategory: 'Wrist', group: '손가락(왼손)' },
  Hand_Left_Middle_Joint3: { id: 'Hand_Left_Middle_Joint3', label: '왼손 중지 - 3마디(뿌리)', baseCategory: 'Wrist', group: '손가락(왼손)' },
  Hand_Left_Ring_Joint1: { id: 'Hand_Left_Ring_Joint1', label: '왼손 약지 - 1마디(끝)', baseCategory: 'Wrist', group: '손가락(왼손)' },
  Hand_Left_Ring_Joint2: { id: 'Hand_Left_Ring_Joint2', label: '왼손 약지 - 2마디', baseCategory: 'Wrist', group: '손가락(왼손)' },
  Hand_Left_Ring_Joint3: { id: 'Hand_Left_Ring_Joint3', label: '왼손 약지 - 3마디(뿌리)', baseCategory: 'Wrist', group: '손가락(왼손)' },
  Hand_Left_Pinky_Joint1: { id: 'Hand_Left_Pinky_Joint1', label: '왼손 새끼 - 1마디(끝)', baseCategory: 'Wrist', group: '손가락(왼손)' },
  Hand_Left_Pinky_Joint2: { id: 'Hand_Left_Pinky_Joint2', label: '왼손 새끼 - 2마디', baseCategory: 'Wrist', group: '손가락(왼손)' },
  Hand_Left_Pinky_Joint3: { id: 'Hand_Left_Pinky_Joint3', label: '왼손 새끼 - 3마디(뿌리)', baseCategory: 'Wrist', group: '손가락(왼손)' },

  // Right Hand Fingers
  Hand_Right_Thumb_Joint1: { id: 'Hand_Right_Thumb_Joint1', label: '오른손 엄지 - 1마디(끝)', baseCategory: 'Wrist', group: '손가락(오른손)' },
  Hand_Right_Thumb_Joint2: { id: 'Hand_Right_Thumb_Joint2', label: '오른손 엄지 - 2마디', baseCategory: 'Wrist', group: '손가락(오른손)' },
  Hand_Right_Index_Joint1: { id: 'Hand_Right_Index_Joint1', label: '오른손 검지 - 1마디(끝)', baseCategory: 'Wrist', group: '손가락(오른손)' },
  Hand_Right_Index_Joint2: { id: 'Hand_Right_Index_Joint2', label: '오른손 검지 - 2마디', baseCategory: 'Wrist', group: '손가락(오른손)' },
  Hand_Right_Index_Joint3: { id: 'Hand_Right_Index_Joint3', label: '오른손 검지 - 3마디(뿌리)', baseCategory: 'Wrist', group: '손가락(오른손)' },
  Hand_Right_Middle_Joint1: { id: 'Hand_Right_Middle_Joint1', label: '오른손 중지 - 1마디(끝)', baseCategory: 'Wrist', group: '손가락(오른손)' },
  Hand_Right_Middle_Joint2: { id: 'Hand_Right_Middle_Joint2', label: '오른손 중지 - 2마디', baseCategory: 'Wrist', group: '손가락(오른손)' },
  Hand_Right_Middle_Joint3: { id: 'Hand_Right_Middle_Joint3', label: '오른손 중지 - 3마디(뿌리)', baseCategory: 'Wrist', group: '손가락(오른손)' },
  Hand_Right_Ring_Joint1: { id: 'Hand_Right_Ring_Joint1', label: '오른손 약지 - 1마디(끝)', baseCategory: 'Wrist', group: '손가락(오른손)' },
  Hand_Right_Ring_Joint2: { id: 'Hand_Right_Ring_Joint2', label: '오른손 약지 - 2마디', baseCategory: 'Wrist', group: '손가락(오른손)' },
  Hand_Right_Ring_Joint3: { id: 'Hand_Right_Ring_Joint3', label: '오른손 약지 - 3마디(뿌리)', baseCategory: 'Wrist', group: '손가락(오른손)' },
  Hand_Right_Pinky_Joint1: { id: 'Hand_Right_Pinky_Joint1', label: '오른손 새끼 - 1마디(끝)', baseCategory: 'Wrist', group: '손가락(오른손)' },
  Hand_Right_Pinky_Joint2: { id: 'Hand_Right_Pinky_Joint2', label: '오른손 새끼 - 2마디', baseCategory: 'Wrist', group: '손가락(오른손)' },
  Hand_Right_Pinky_Joint3: { id: 'Hand_Right_Pinky_Joint3', label: '오른손 새끼 - 3마디(뿌리)', baseCategory: 'Wrist', group: '손가락(오른손)' },

  // Spine / Back
  Back_Thoracic: { id: 'Back_Thoracic', label: '등 윗부분 (흉추)', baseCategory: 'Back', group: '허리/척추' },
  Back_Lumbar: { id: 'Back_Lumbar', label: '허리 (요추)', baseCategory: 'Back', group: '허리/척추' },
  Back_Pelvis: { id: 'Back_Pelvis', label: '골반 및 꼬리뼈', baseCategory: 'Back', group: '허리/척추' },

  // Knee & Leg
  Knee_Left: { id: 'Knee_Left', label: '왼쪽 무릎', baseCategory: 'Knee', group: '무릎/다리' },
  Knee_Right: { id: 'Knee_Right', label: '오른쪽 무릎', baseCategory: 'Knee', group: '무릎/다리' },
  Leg_Left_Thigh: { id: 'Leg_Left_Thigh', label: '왼쪽 허벅지', baseCategory: 'Knee', group: '무릎/다리' },
  Leg_Right_Thigh: { id: 'Leg_Right_Thigh', label: '오른쪽 허벅지', baseCategory: 'Knee', group: '무릎/다리' },
  Leg_Left_Calf: { id: 'Leg_Left_Calf', label: '왼쪽 종아리', baseCategory: 'Knee', group: '무릎/다리' },
  Leg_Right_Calf: { id: 'Leg_Right_Calf', label: '오른쪽 종아리', baseCategory: 'Knee', group: '무릎/다리' },

  // Foot & Ankle
  Foot_Left_Ankle: { id: 'Foot_Left_Ankle', label: '왼쪽 발목', baseCategory: 'Knee', group: '발/발목' },
  Foot_Right_Ankle: { id: 'Foot_Right_Ankle', label: '오른쪽 발목', baseCategory: 'Knee', group: '발/발목' },
  Foot_Left_Toes: { id: 'Foot_Left_Toes', label: '왼발 발가락', baseCategory: 'Knee', group: '발/발목' },
  Foot_Right_Toes: { id: 'Foot_Right_Toes', label: '오른발 발가락', baseCategory: 'Knee', group: '발/발목' },
  Foot_Left_Sole: { id: 'Foot_Left_Sole', label: '왼발 바닥 (족저)', baseCategory: 'Knee', group: '발/발목' },
  Foot_Right_Sole: { id: 'Foot_Right_Sole', label: '오른발 바닥 (족저)', baseCategory: 'Knee', group: '발/발목' },
  Foot_Left_Heel: { id: 'Foot_Left_Heel', label: '왼쪽 발뒤꿈치', baseCategory: 'Knee', group: '발/발목' },
  Foot_Right_Heel: { id: 'Foot_Right_Heel', label: '오른쪽 발뒤꿈치', baseCategory: 'Knee', group: '발/발목' },

  // Foot Toes (Left)
  Foot_Left_BigToe: { id: 'Foot_Left_BigToe', label: '왼발 엄지발가락', baseCategory: 'Knee', group: '발가락(왼발)' },
  Foot_Left_IndexToe: { id: 'Foot_Left_IndexToe', label: '왼발 검지발가락', baseCategory: 'Knee', group: '발가락(왼발)' },
  Foot_Left_MiddleToe: { id: 'Foot_Left_MiddleToe', label: '왼발 중지발가락', baseCategory: 'Knee', group: '발가락(왼발)' },
  Foot_Left_RingToe: { id: 'Foot_Left_RingToe', label: '왼발 약지발가락', baseCategory: 'Knee', group: '발가락(왼발)' },
  Foot_Left_PinkyToe: { id: 'Foot_Left_PinkyToe', label: '왼발 새끼발가락', baseCategory: 'Knee', group: '발가락(왼발)' },

  // Foot Toes (Right)
  Foot_Right_BigToe: { id: 'Foot_Right_BigToe', label: '오른발 엄지발가락', baseCategory: 'Knee', group: '발가락(오른발)' },
  Foot_Right_IndexToe: { id: 'Foot_Right_IndexToe', label: '오른발 검지발가락', baseCategory: 'Knee', group: '발가락(오른발)' },
  Foot_Right_MiddleToe: { id: 'Foot_Right_MiddleToe', label: '오른발 중지발가락', baseCategory: 'Knee', group: '발가락(오른발)' },
  Foot_Right_RingToe: { id: 'Foot_Right_RingToe', label: '오른발 약지발가락', baseCategory: 'Knee', group: '발가락(오른발)' },
  Foot_Right_PinkyToe: { id: 'Foot_Right_PinkyToe', label: '오른발 새끼발가락', baseCategory: 'Knee', group: '발가락(오른발)' },

  // Additional Foot Parts
  Foot_Left_Arch: { id: 'Foot_Left_Arch', label: '왼발 아치', baseCategory: 'Knee', group: '발/발목' },
  Foot_Right_Arch: { id: 'Foot_Right_Arch', label: '오른발 아치', baseCategory: 'Knee', group: '발/발목' },
};

export const BODY_PARTS_LIST = Object.values(BODY_PARTS_MAP);

// Fallback mappings for legacy categories
export const LEGACY_PARTS_MAP: Record<string, string> = {
  Head: '머리(두통)',
  Neck: '목(거북목)',
  Shoulder: '어깨',
  Wrist: '손목(터널)',
  Back: '허리/척추',
  Knee: '무릎',
};

export function getPartLabel(id: string): string {
  if (BODY_PARTS_MAP[id]) {
    return BODY_PARTS_MAP[id].label;
  }
  return LEGACY_PARTS_MAP[id] || id;
}

export function getBaseCategory(id: string): 'Head' | 'Neck' | 'Shoulder' | 'Wrist' | 'Back' | 'Knee' {
  if (BODY_PARTS_MAP[id]) {
    return BODY_PARTS_MAP[id].baseCategory;
  }
  // Safe cast or fallback for legacy IDs
  const lower = id.toLowerCase();
  if (lower.includes('head')) return 'Head';
  if (lower.includes('neck')) return 'Neck';
  if (lower.includes('shoulder')) return 'Shoulder';
  if (lower.includes('wrist') || lower.includes('hand') || lower.includes('palm')) return 'Wrist';
  if (lower.includes('back') || lower.includes('spine')) return 'Back';
  if (lower.includes('knee') || lower.includes('leg') || lower.includes('foot') || lower.includes('ankle')) return 'Knee';
  return 'Neck'; // default fallback
}
