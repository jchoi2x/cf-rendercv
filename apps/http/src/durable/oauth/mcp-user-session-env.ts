/** OAuth props: Auth0 uses `claims.sub`; Google uses top-level `sub`. */
function oauthUserSub(props: unknown): string | undefined {
  if (!props || typeof props !== "object") return undefined;
  const p = props as Record<string, unknown>;
  const claims = p.claims;
  if (claims && typeof claims === "object" && "sub" in claims) {
    const sub = (claims as { sub?: unknown }).sub;
    if (sub !== undefined && sub !== null && sub !== "") {
      return String(sub as string);
    }
  }
  const sub = p.sub;
  if (sub !== undefined && sub !== null && sub !== "")
    return String(sub as string);
  return undefined;
}

function sanitizeMcpSessionKey(sub: string): string {
  return sub.split("|").join("_");
}

/**
 * When the agents MCP transport allocates a new session, it uses
 * `namespace.newUniqueId().toString()` as the session key. Replacing that with a
 * stable key derived from the authenticated user routes all MCP sessions for
 * that user to one Durable Object (same as the prior `agents` patch).
 */
export function envWithUserPinnedMcpObject(
  env: Env,
  ctx: { props?: unknown },
): Env {
  const raw = oauthUserSub(ctx.props);
  if (raw === undefined) return env;

  const sessionKey = sanitizeMcpSessionKey(raw);
  const ns = env.MCP_OBJECT;

  const pinned = new Proxy(ns, {
    get(target, prop, receiver) {
      if (prop === "newUniqueId") {
        console.debug("newUniqueId", sessionKey);
        return () =>
          ({
            toString: () => sessionKey,
          }) as unknown as DurableObjectId;
      }
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return value.bind(target);
      }
      return value;
    },
  });

  return { ...env, MCP_OBJECT: pinned };
}

type McpRouteHandler = {
  fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Response | Promise<Response>;
};

export function wrapMcpAgentHandler(handler: McpRouteHandler): McpRouteHandler {
  return {
    async fetch(request, env, ctx) {
      // MCP JSON-RPC `initialize` must not include `sessionId` in `params`.
      // Some host-side transports/proxies can accidentally forward it.
      // Since we control the Cloudflare endpoint, we defensively strip it.
      let nextRequest = request;
      try {
        const contentType = request.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const cloned = request.clone();
          const body = await cloned.json();

          let changed = false;
          const sanitizeOne = (obj: any) => {
            if (!obj || typeof obj !== "object") return obj;
            if (obj.method !== "initialize") return obj;
            if (obj.params && typeof obj.params === "object") {
              if ("sessionId" in obj.params) {
                delete obj.params.sessionId;
                changed = true;
              }
            }
            return obj;
          };

          const sanitized = Array.isArray(body)
            ? body.map(sanitizeOne)
            : sanitizeOne(body);

          // Only recreate the request body if we actually removed `sessionId`.
          if (changed) {
            nextRequest = new Request(request.url, {
              method: request.method,
              headers: new Headers(request.headers),
              body: JSON.stringify(sanitized),
            });
          }
        }
      } catch {
        // If we can't parse/inspect the request, fall back to forwarding it.
      }

      return handler.fetch(
        nextRequest,
        envWithUserPinnedMcpObject(env, ctx as { props?: unknown }),
        ctx,
      );
    },
  };
}
