export async function startWorker() {
  const { setupWorker } = await import("msw/browser");
  const { handlers } = await import("./mocks/handlers");
  const worker = setupWorker(...handlers);
  await worker.start({ onUnhandledRequest: "bypass" });
  return worker;
}
