import type { ID } from '@/features/gallery/types';

export interface Award {
  id: ID;
  title: string;
  position: number;
}

export interface AwardSection {
  id: ID;
  award_id: ID;
  title: string;
  position: number;
}

export interface AwardContent {
  id: ID;
  award_section_id: ID;
  position: number;
  rank?: string;
  name?: string;
  pno?: string;
  courseno?: string;
  unit?: string;
  year?: string;
}
