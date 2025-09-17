export type ID = number | string;

// History (likely single record served as list with one item)
export interface HistoryItem {
  id?: ID;
  title: string;
  content: string;
}

// Organogram images
export interface Organogram {
  id: ID;
  position: number;
  image_url?: string | null;
}

// Commanders
export interface Commander {
  id: ID;
  title: string;
  content: string;
  position: number;
  image_url?: string | null;
}

// Overview chronicles (list)
export interface OverviewChronicle {
  id: ID;
  title: string;
  position: number;
}

export interface OverviewChronicleContent {
  id: ID;
  chronicles_id: ID;
  position: number;
  rank?: string | null;
  name?: string | null;
  pno?: string | null;
  period?: string | null;
  decoration?: string | null;
}

/** ---- Admin inputs mirror Postman ---- */
export interface CreateHistoryInput { title: string; content: string; }
export interface UpdateHistoryInput { title?: string; content?: string; }

export interface CreateOrganogramInput { type: 'create'; position: number; image: File; }
export interface EditOrganogramImageInput { type: 'edit-image'; organogram_id: ID; image: File; }
export interface UpdateOrganogramPositionInput { organogram_id: ID; position: number; }
export interface DeleteOrganogramInput { organogram_id: ID; }

export interface CreateCommanderInput { type: 'create'; title: string; content: string; position: number; image: File; }
export interface EditCommanderImageInput { type: 'edit-image'; commander_id: ID; image: File; }
export interface UpdateCommanderInput { commander_id: ID; title?: string; content?: string; position?: number; }
export interface DeleteCommanderInput { commander_id: ID; }

export interface CreateOverviewChroniclesInput { title: string; position: number; }
export interface UpdateOverviewChroniclesInput { overview_id: ID; title?: string; position?: number; }
export interface DeleteOverviewChroniclesInput { overview_id: ID; }

export interface CreateOverviewChroniclesContentInput {
  chronicles_id: ID; position: number;
  rank?: string; name?: string; pno?: string; period?: string; decoration?: string;
}
export interface UpdateOverviewChroniclesContentInput extends CreateOverviewChroniclesContentInput {
  content_id: ID;
}
export interface DeleteOverviewChroniclesContentInput { content_id: ID; }
