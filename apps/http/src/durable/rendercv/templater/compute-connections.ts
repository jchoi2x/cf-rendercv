import type { RenderCvDocumentPayload } from "./types";

type ConnectionFileType = "typst" | "markdown";

type ComputeConnectionsPayload = {
  cv: Omit<RenderCvDocumentPayload["cv"], "social_networks"> & {
    social_networks?: Array<{ network: string; username: string }>;
    _key_order?: string[];
  };
  design: RenderCvDocumentPayload["design"];
};

type Connection = {
  fontawesomeIcon: string;
  url: string | null;
  body: string;
};

const FONT_AWESOME_ICONS: Record<string, string> = {
  LinkedIn: "linkedin",
  GitHub: "github",
  GitLab: "gitlab",
  IMDB: "imdb",
  Instagram: "instagram",
  Mastodon: "mastodon",
  ORCID: "orcid",
  StackOverflow: "stack-overflow",
  ResearchGate: "researchgate",
  YouTube: "youtube",
  "Google Scholar": "graduation-cap",
  Telegram: "telegram",
  WhatsApp: "whatsapp",
  Leetcode: "code",
  X: "x-twitter",
  Bluesky: "bluesky",
  location: "location-dot",
  email: "envelope",
  phone: "phone",
  website: "link",
  Reddit: "reddit",
};

/** Keys that produce header connections, in default order when `_key_order` is absent. */
const CONNECTION_KEYS = new Set([
  "location",
  "email",
  "phone",
  "website",
  "social_networks",
  "custom_connections",
]);

function cleanUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

function markdownToTypst(value: string): string {
  return value.replaceAll("@", "\\@").replaceAll("/", "\\/");
}

function socialNetworkUrl(network: string, username: string): string | null {
  switch (network) {
    case "GitHub":
      return `https://github.com/${username}`;
    case "LinkedIn":
      return `https://linkedin.com/in/${username}`;
    case "StackOverflow":
      return `https://stackoverflow.com/users/${username}`;
    default:
      return null;
  }
}

function formatPhoneConnection(phone: string): { url: string; body: string } {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    const area = digits.slice(1, 4);
    const exchange = digits.slice(4, 7);
    const line = digits.slice(7, 11);
    return {
      url: `tel:+1-${area}-${exchange}-${line}`,
      body: `(${area}) ${exchange}-${line}`,
    };
  }

  const canonical = trimmed.replace(/[()\s]+/g, "-").replace(/-+/g, "-");
  return {
    url: `tel:${canonical}`,
    body: trimmed,
  };
}

function fallbackKeyOrder(cv: ComputeConnectionsPayload["cv"]): string[] {
  const order: string[] = [];
  if (cv.location) order.push("location");
  if (cv.email) order.push("email");
  if (cv.phone) order.push("phone");
  if (cv.website) order.push("website");
  if (cv.social_networks?.length) order.push("social_networks");
  const custom = (cv as { custom_connections?: unknown[] | null })
    .custom_connections;
  if (custom?.length) order.push("custom_connections");
  return order;
}

function parseConnections(payload: ComputeConnectionsPayload): Connection[] {
  const connections: Connection[] = [];
  const { cv, design } = payload;
  const displayUrlsInsteadOfUsernames = Boolean(
    design?.header?.connections?.display_urls_instead_of_usernames,
  );

  const keyOrder =
    cv._key_order?.filter((k) => CONNECTION_KEYS.has(k)) ??
    fallbackKeyOrder(cv);

  for (const key of keyOrder) {
    switch (key) {
      case "location":
        if (cv.location) {
          connections.push({
            fontawesomeIcon: FONT_AWESOME_ICONS.location!,
            url: null,
            body: cv.location as string,
          });
        }
        break;
      case "email": {
        const raw = cv.email;
        if (raw == null) break;
        const emails = Array.isArray(raw) ? raw : [raw];
        for (const email of emails) {
          const e = String(email);
          connections.push({
            fontawesomeIcon: FONT_AWESOME_ICONS.email!,
            url: `mailto:${e}`,
            body: e,
          });
        }
        break;
      }
      case "phone":
        if (cv.phone) {
          const formattedPhone = formatPhoneConnection(cv.phone as string);
          connections.push({
            fontawesomeIcon: FONT_AWESOME_ICONS.phone!,
            url: formattedPhone.url,
            body: formattedPhone.body,
          });
        }
        break;
      case "website":
        if (cv.website) {
          connections.push({
            fontawesomeIcon: FONT_AWESOME_ICONS.website!,
            url: cv.website as string,
            body: cleanUrl(cv.website as string),
          });
        }
        break;
      case "social_networks":
        if (cv.social_networks?.length) {
          for (const socialNetwork of cv.social_networks) {
            const icon = FONT_AWESOME_ICONS[socialNetwork.network];
            const url = socialNetworkUrl(
              socialNetwork.network,
              socialNetwork.username,
            );
            if (!icon || !url) continue;
            connections.push({
              fontawesomeIcon: icon,
              url,
              body: displayUrlsInsteadOfUsernames
                ? cleanUrl(url)
                : socialNetwork.username,
            });
          }
        }
        break;
      case "custom_connections":
        break;
      default:
        break;
    }
  }

  return connections;
}

export function computeConnections(
  payload: ComputeConnectionsPayload,
  fileType: ConnectionFileType,
): string[] {
  const connections = parseConnections(payload);

  if (fileType === "markdown") {
    return connections.map((connection) =>
      connection.url
        ? `[${connection.body}](${connection.url})`
        : connection.body,
    );
  }

  const showIcon = payload.design?.header?.connections?.show_icons ?? true;
  const hyperlink = payload.design?.header?.connections?.hyperlink ?? true;

  const placeholders = connections.map((connection) =>
    showIcon
      ? `#connection-with-icon("${connection.fontawesomeIcon}")[${markdownToTypst(connection.body)}]`
      : markdownToTypst(connection.body),
  );

  return connections
    .map((connection, index) => {
      const placeholder = placeholders[index];
      if (connection.url && hyperlink) {
        return `#link("${connection.url}", icon: false, if-underline: false, if-color: false)[${placeholder}]`;
      }
      return placeholder;
    })
    .filter((placeholder): placeholder is string => placeholder !== undefined);
}
