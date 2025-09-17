import { http } from '@/lib/api/client';
import type {
  ID,
  HistoryItem, Organogram, Commander, OverviewChronicle, OverviewChronicleContent,
  CreateHistoryInput, UpdateHistoryInput,
  CreateOrganogramInput, EditOrganogramImageInput, UpdateOrganogramPositionInput, DeleteOrganogramInput,
  CreateCommanderInput, EditCommanderImageInput, UpdateCommanderInput, DeleteCommanderInput,
  CreateOverviewChroniclesInput, UpdateOverviewChroniclesInput, DeleteOverviewChroniclesInput,
  CreateOverviewChroniclesContentInput, UpdateOverviewChroniclesContentInput, DeleteOverviewChroniclesContentInput
} from '../types';

/* ----------------------------- READ ----------------------------- */
export const getHistory = () =>
  http<HistoryItem[]>({ path: '/overview/history/' });

export const getOrganogram = () =>
  http<Organogram[]>({ path: '/overview/organogram/' });

export const getCommanders = () =>
  http<Commander[]>({ path: '/overview/commanders/' });

export const getOverviewChronicles = () =>
  http<OverviewChronicle[]>({ path: '/overview/chronicles/' });

export const getOverviewChroniclesContents = (section_id: ID) =>
  http<OverviewChronicleContent[]>({
    path: '/overview/chronicles/contents/',
    query: { section_id },
  });

/* ----------------------- helpers (multipart) -------------------- */
function toForm<T extends Record<string, any>>(obj: T) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    fd.append(k, v as any);
  });
  return fd;
}

/* ------------------------- ADMIN: HISTORY ----------------------- */
export const createHistory = (payload: CreateHistoryInput) =>
  http<HistoryItem>({ method: 'POST', path: '/overview-actions/history/', body: payload, auth: 'ifAvailable' });

export const updateHistory = (payload: UpdateHistoryInput) =>
  http<HistoryItem>({ method: 'PATCH', path: '/overview-actions/history/', body: payload, auth: 'ifAvailable' });

/* ------------------------ ADMIN: ORGANOGRAM --------------------- */
export const createOrganogram = (input: CreateOrganogramInput) =>
  http<Organogram>({ method: 'POST', path: '/overview-actions/organogram/', body: toForm(input), auth: 'ifAvailable' });

export const editOrganogramImage = (input: EditOrganogramImageInput) =>
  http<Organogram>({ method: 'POST', path: '/overview-actions/organogram/', body: toForm(input), auth: 'ifAvailable' });

export const updateOrganogramPosition = (payload: UpdateOrganogramPositionInput) =>
  http<Organogram>({ method: 'PATCH', path: '/overview-actions/organogram/', body: payload, auth: 'ifAvailable' });

export const deleteOrganogram = (payload: DeleteOrganogramInput) =>
  http<{ success?: boolean }>({ method: 'DELETE', path: '/overview-actions/organogram/', body: payload, auth: 'ifAvailable' });

/* ------------------------ ADMIN: COMMANDERS --------------------- */
export const createCommander = (input: CreateCommanderInput) =>
  http<Commander>({ method: 'POST', path: '/overview-actions/commanders/', body: toForm(input), auth: 'ifAvailable' });

export const editCommanderImage = (input: EditCommanderImageInput) =>
  http<Commander>({ method: 'POST', path: '/overview-actions/commanders/', body: toForm(input), auth: 'ifAvailable' });

export const updateCommander = (payload: UpdateCommanderInput) =>
  http<Commander>({ method: 'PATCH', path: '/overview-actions/commanders/', body: payload, auth: 'ifAvailable' });

export const deleteCommander = (payload: DeleteCommanderInput) =>
  http<{ success?: boolean }>({ method: 'DELETE', path: '/overview-actions/commanders/', body: payload, auth: 'ifAvailable' });

/* --------------------- ADMIN: CHRONICLES (OVERVIEW) ------------- */
export const createOverviewChronicles = (payload: CreateOverviewChroniclesInput) =>
  http<OverviewChronicle>({ method: 'POST', path: '/overview-actions/chronicles/', body: payload, auth: 'ifAvailable' });

export const updateOverviewChronicles = (payload: UpdateOverviewChroniclesInput) =>
  http<OverviewChronicle>({ method: 'PATCH', path: '/overview-actions/chronicles/', body: payload, auth: 'ifAvailable' });

export const deleteOverviewChronicles = (payload: DeleteOverviewChroniclesInput) =>
  http<{ success?: boolean }>({ method: 'DELETE', path: '/overview-actions/chronicles/', body: payload, auth: 'ifAvailable' });

export const createOverviewChroniclesContent = (payload: CreateOverviewChroniclesContentInput) =>
  http<OverviewChronicleContent>({ method: 'POST', path: '/overview-actions/chronicles/contents/', body: payload, auth: 'ifAvailable' });

export const updateOverviewChroniclesContent = (payload: UpdateOverviewChroniclesContentInput) =>
  http<OverviewChronicleContent>({ method: 'PATCH', path: '/overview-actions/chronicles/contents/', body: payload, auth: 'ifAvailable' });

export const deleteOverviewChroniclesContent = (payload: DeleteOverviewChroniclesContentInput) =>
  http<{ success?: boolean }>({ method: 'DELETE', path: '/overview-actions/chronicles/contents/', body: payload, auth: 'ifAvailable' });
