// eslint-disable-next-line @typescript-eslint/no-implied-eval
const dynamicImport = new Function("u", "return import(u)") as (
  u: string,
) => Promise<any>;

export const env = await (async () => {
  try {
    return (await dynamicImport("cloudflare:workers")).env;
  } catch {
    return (await import("../__tests__/cloudflare-workers.stub")).env as any;
  }
})();
