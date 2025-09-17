// Shared tiny alias
export type ID = number | string;

/** -------- Public entities (GET) ---------- */
export interface Chronicle {
  id: ID;
  title: string;
  position: number;
}

export interface ChronicleSection {
  id: ID;
  chronicles_id: ID;
  title: string;
  position: number;
}

export interface ChronicleContent {
  id: ID;
  section_id: ID;
  position: number;
  // Optional fields per Postman
  rank?: string | null;
  name?: string | null;
  number?: string | null;
  year?: string | null;
  appointment?: string | null;
}

export interface SapperGeneral {
  id: ID;
  title: string;
  content: string;
  position: number;
  image_url?: string | null;
}

export interface SapperChronicle {
  id: ID;
  title: string;
  sub_title?: string | null;
  position: number;
}

export interface SapperChronicleContent {
  id: ID;
  chronicles_id: ID;
  position: number;
  pno?: string | null;
  rank?: string | null;
  name?: string | null;
  doc?: string | null;
  noneffdate?: string | null;
  cadetcse?: string | null;
  commtype?: string | null;
  status?: string | null;
  remark?: string | null;
  duration?: string | null;
}

/** -------- Admin inputs (mirror Postman) ---------- */
// chronicles
export interface CreateChroniclesInput { title: string; position: number; }
export interface UpdateChroniclesInput { chronicles_id: ID; title?: string; position?: number; }
export interface DeleteChroniclesInput { chronicles_id: ID; }

// chronicles sections
export interface CreateChroniclesSectionInput { chronicles_id: ID; title: string; position: number; }
export interface UpdateChroniclesSectionInput { section_id: ID; chronicles_id: ID; title?: string; position?: number; }
export interface DeleteChroniclesSectionInput { section_id: ID; }

// chronicles contents
export interface CreateChroniclesContentInput {
  section_id: ID; position: number;
  rank?: string; name?: string; number?: string; year?: string; appointment?: string;
}
export interface UpdateChroniclesContentInput extends CreateChroniclesContentInput {
  content_id: ID;
}
export interface DeleteChroniclesContentInput { content_id: ID; }

// sapper generals (multipart for create/edit-image)
export interface CreateSapperGeneralInput {
  type: 'create';
  title: string;
  content: string;
  position: number;
  image: File;
}
export interface UpdateSapperGeneralInput {
  general_id: ID;
  title?: string;
  content?: string;
  position?: number;
}
export interface EditSapperGeneralImageInput {
  type: 'edit-image';
  general_id: ID;
  image: File;
}
export interface DeleteSapperGeneralInput { general_id: ID; }

// sapper chronicles (json)
export interface CreateSapperChroniclesInput {
  title: string;
  sub_title?: string;
  position: number;
}
export interface UpdateSapperChroniclesInput {
  chronicles_id: ID;
  title?: string;
  sub_title?: string;
  position?: number;
}
export interface DeleteSapperChroniclesInput { chronicles_id: ID; }

// sapper chronicles contents (json)
export interface CreateSapperChroniclesContentInput {
  chronicles_id: ID;
  position: number;
  pno?: string; rank?: string; name?: string; doc?: string; noneffdate?: string;
  cadetcse?: string; commtype?: string; status?: string; remark?: string; duration?: string;
}
export interface UpdateSapperChroniclesContentInput extends CreateSapperChroniclesContentInput {
  content_id: ID;
}
export interface DeleteSapperChroniclesContentInput { content_id: ID; }
