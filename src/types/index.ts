export type SkillLevel = 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface SkillAssignment {
  memberId: string;
  skillId: string;
  level: SkillLevel;
}

export const SKILL_LEVELS: SkillLevel[] = ['none', 'beginner', 'intermediate', 'advanced', 'expert'];

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  none: 'None',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert'
};