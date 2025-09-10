// import { rest } from "msw";

// const API = import.meta.env.VITE_API_BASE_URL;

// export const handlers = [
//   // Examples – we’ll flesh these out next pass to mirror your Postman
//   rest.get(`${API}/health`, (_req, res, ctx) => res(ctx.json({ ok: true })))
// ];
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/health', () => HttpResponse.json({ ok: true })),
  // mirror your GET/POST endpoints here later
]
