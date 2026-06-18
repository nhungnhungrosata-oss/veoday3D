export type VoiceType = 'Bắc' | 'Trung' | 'Nam';
export type VideoModelType = 'Veo 3' | 'Gork';
export type SceneCount = 3 | 4 | 5;
export type ContentStyle =
  | 'Vui vẻ'
  | 'Giáo dục'
  | 'Truyền cảm hứng'
  | 'Hài hước'
  | 'Gần gũi'
  | 'Kể chuyện'
  | 'Chuyên nghiệp'
  | 'Dễ hiểu';
export type AudienceType =
  | 'Trẻ em'
  | 'Người trưởng thành'
  | 'Gia đình'
  | 'Người quan tâm sức khỏe'
  | 'Tùy chỉnh';

export interface AppState {
  topic: string;
  sceneCount: SceneCount;
  style: ContentStyle;
  audience: AudienceType;
  customAudience: string;
  voice: VoiceType;
  aspectRatio: '9:16';
  requirements: string;
  videoModel: VideoModelType;
}

export interface CharacterProfile {
  name: string;
  description: string;
  fixedIdentity: string;
}

export interface ScriptScene {
  title: string;
  background: string;
  action: string;
  expression: string;
  camera: string;
  videoPrompt: string;
  voiceScript: string;
}

export interface GeneratedResult {
  id: string;
  timestamp: number;
  summary: string;
  character: CharacterProfile;
  scenes: ScriptScene[];
  inputs: AppState;
}

export const STORAGE_KEY = 'video_3d_scripts_v2';
