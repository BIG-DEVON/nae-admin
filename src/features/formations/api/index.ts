import { http } from '@/lib/api/client';
import type {
  ID,
  Chronicle, ChronicleSection, ChronicleContent,
  SapperGeneral, SapperChronicle, SapperChronicleContent,
  CreateChroniclesInput, UpdateChroniclesInput, DeleteChroniclesInput,
  CreateChroniclesSectionInput, UpdateChroniclesSectionInput, DeleteChroniclesSectionInput,
  CreateChroniclesContentInput, UpdateChroniclesContentInput, DeleteChroniclesContentInput,
  CreateSapperGeneralInput, UpdateSapperGeneralInput, EditSapperGeneralImageInput, DeleteSapperGeneralInput,
  CreateSapperChroniclesInput, UpdateSapperChroniclesInput, DeleteSapperChroniclesInput,
  CreateSapperChroniclesContentInput, UpdateSapperChroniclesContentInput, DeleteSapperChroniclesContentInput
} from '../types';

/* ----------------------------- READ ----------------------------- */
export const getChronicles = () =>
  http<Chronicle[]>({ path: '/formations/chronicles/' });

export const getChroniclesSections = (chronicles_id: ID) =>
  http<ChronicleSection[]>({
    path: '/formations/chronicles/sections/',
    query: { chronicles_id },
  });

export const getChroniclesContents = (section_id: ID) =>
  http<ChronicleContent[]>({
    path: '/formations/chronicles/contents/',
    query: { section_id },
  });

export const getSapperGenerals = () =>
  http<SapperGeneral[]>({ path: '/formations/sapper-generals/' });

export const getSapperChronicles = () =>
  http<SapperChronicle[]>({ path: '/formations/sapper-chronicles/' });

export const getSapperChroniclesContents = (section_id: ID) =>
  http<SapperChronicleContent[]>({
    path: '/formations/sapper-chronicles/contents/',
    query: { section_id },
  });

/* ------------------------- ADMIN: CHRONICLES -------------------- */
export const createChronicles = (payload: CreateChroniclesInput) =>
  http<Chronicle>({ method: 'POST', path: '/formations-actions/chronicles/', body: payload, auth: 'ifAvailable' });

export const updateChronicles = (payload: UpdateChroniclesInput) =>
  http<Chronicle>({ method: 'PATCH', path: '/formations-actions/chronicles/', body: payload, auth: 'ifAvailable' });

export const deleteChronicles = (payload: DeleteChroniclesInput) =>
  http<{ success?: boolean }>({ method: 'DELETE', path: '/formations-actions/chronicles/', body: payload, auth: 'ifAvailable' });

/* --------------------- ADMIN: CHRONICLES SECTIONS --------------- */
export const createChroniclesSection = (payload: CreateChroniclesSectionInput) =>
  http<ChronicleSection>({ method: 'POST', path: '/formations-actions/chronicles/sections/', body: payload, auth: 'ifAvailable' });

export const updateChroniclesSection = (payload: UpdateChroniclesSectionInput) =>
  http<ChronicleSection>({ method: 'PATCH', path: '/formations-actions/chronicles/sections/', body: payload, auth: 'ifAvailable' });

export const deleteChroniclesSection = (payload: DeleteChroniclesSectionInput) =>
  http<{ success?: boolean }>({ method: 'DELETE', path: '/formations-actions/chronicles/sections/', body: payload, auth: 'ifAvailable' });

/* --------------------- ADMIN: CHRONICLES CONTENTS --------------- */
export const createChroniclesContent = (payload: CreateChroniclesContentInput) =>
  http<ChronicleContent>({ method: 'POST', path: '/formations-actions/chronicles/contents/', body: payload, auth: 'ifAvailable' });

export const updateChroniclesContent = (payload: UpdateChroniclesContentInput) =>
  http<ChronicleContent>({ method: 'PATCH', path: '/formations-actions/chronicles/contents/', body: payload, auth: 'ifAvailable' });

export const deleteChroniclesContent = (payload: DeleteChroniclesContentInput) =>
  http<{ success?: boolean }>({ method: 'DELETE', path: '/formations-actions/chronicles/contents/', body: payload, auth: 'ifAvailable' });

/* ----------------------- ADMIN: SAPPER GENERALS ----------------- */
// multipart helpers
function toForm<T extends Record<string, any>>(obj: T) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    fd.append(k, v as any);
  });
  return fd;
}

export const createSapperGeneral = (input: CreateSapperGeneralInput) =>
  http<SapperGeneral>({
    method: 'POST',
    path: '/formations-actions/sapper-generals/',
    body: toForm(input),
    auth: 'ifAvailable',
  });

export const updateSapperGeneral = (payload: UpdateSapperGeneralInput) =>
  http<SapperGeneral>({ method: 'PATCH', path: '/formations-actions/sapper-generals/', body: payload, auth: 'ifAvailable' });

export const editSapperGeneralImage = (input: EditSapperGeneralImageInput) =>
  http<SapperGeneral>({
    method: 'POST',
    path: '/formations-actions/sapper-generals/',
    body: toForm(input), // type=edit-image, general_id, image
    auth: 'ifAvailable',
  });

export const deleteSapperGeneral = (payload: DeleteSapperGeneralInput) =>
  http<{ success?: boolean }>({ method: 'DELETE', path: '/formations-actions/sapper-generals/', body: payload, auth: 'ifAvailable' });

/* ---------------------- ADMIN: SAPPER CHRONICLES ---------------- */
export const createSapperChronicles = (payload: CreateSapperChroniclesInput) =>
  http<SapperChronicle>({ method: 'POST', path: '/formations-actions/sapper-chronicles/', body: payload, auth: 'ifAvailable' });

export const updateSapperChronicles = (payload: UpdateSapperChroniclesInput) =>
  http<SapperChronicle>({ method: 'PATCH', path: '/formations-actions/sapper-chronicles/', body: payload, auth: 'ifAvailable' });

export const deleteSapperChronicles = (payload: DeleteSapperChroniclesInput) =>
  http<{ success?: boolean }>({ method: 'DELETE', path: '/formations-actions/sapper-chronicles/', body: payload, auth: 'ifAvailable' });

export const createSapperChroniclesContent = (payload: CreateSapperChroniclesContentInput) =>
  http<SapperChronicleContent>({ method: 'POST', path: '/formations-actions/sapper-chronicles/contents/', body: payload, auth: 'ifAvailable' });

export const updateSapperChroniclesContent = (payload: UpdateSapperChroniclesContentInput) =>
  http<SapperChronicleContent>({ method: 'PATCH', path: '/formations-actions/sapper-chronicles/contents/', body: payload, auth: 'ifAvailable' });

export const deleteSapperChroniclesContent = (payload: DeleteSapperChroniclesContentInput) =>
  http<{ success?: boolean }>({ method: 'DELETE', path: '/formations-actions/sapper-chronicles/contents/', body: payload, auth: 'ifAvailable' });
