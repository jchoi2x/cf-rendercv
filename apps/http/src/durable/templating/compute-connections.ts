import type { RenderCvDocumentPayload } from "./types";

type ConnectionFileType = "typst" | "markdown";

type ComputeConnectionsPayload = {
  cv: Omit<RenderCvDocumentPayload["cv"], "social_networks"> & {
    social_networks?: Array<{ network: string; username: string }>;
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

function cleanUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

function markdownToTypst(value: string): string {
  return value.replaceAll("@", "\\@");
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

function parseConnections(payload: ComputeConnectionsPayload): Connection[] {
  const connections: Connection[] = [];
  const { cv, design } = payload;
  const displayUrlsInsteadOfUsernames = Boolean(
    design?.header?.connections?.display_urls_instead_of_usernames,
  );

  if (cv.location) {
    connections.push({
      fontawesomeIcon: FONT_AWESOME_ICONS.location,
      url: null,
      body: cv.location,
    });
  }

  if (cv.email) {
    connections.push({
      fontawesomeIcon: FONT_AWESOME_ICONS.email,
      url: `mailto:${cv.email}`,
      body: cv.email,
    });
  }

  if (cv.website) {
    connections.push({
      fontawesomeIcon: FONT_AWESOME_ICONS.website,
      url: cv.website,
      body: cleanUrl(cv.website),
    });
  }

  for (const socialNetwork of cv.social_networks ?? []) {
    const icon = FONT_AWESOME_ICONS[socialNetwork.network];
    const url = socialNetworkUrl(socialNetwork.network, socialNetwork.username);
    if (!icon || !url) continue;

    connections.push({
      fontawesomeIcon: icon,
      url,
      body: displayUrlsInsteadOfUsernames
        ? cleanUrl(url)
        : socialNetwork.username,
    });
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

  return connections.map((connection, index) => {
    const placeholder = placeholders[index];
    if (connection.url && hyperlink) {
      return `#link("${connection.url}", icon: false, if-underline: false, if-color: false)[${placeholder}]`;
    }
    return placeholder;
  });
}
