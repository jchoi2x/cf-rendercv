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
    fetch(request, env, ctx) {
      return handler.fetch(
        request,
        envWithUserPinnedMcpObject(env, ctx as { props?: unknown }),
        ctx,
      );
    },
  };
}
