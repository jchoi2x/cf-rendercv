import { z } from "@hono/zod-openapi";


export interface Header {
  alignment?: "left" | "center" | "right";
  photo_width?: string;
  photo_position?: "left" | "right";
  photo_space_left?: string;
  photo_space_right?: string;
  space_below_name?: string;
  space_below_headline?: string;
  space_below_connections?: string;
  connections?: Connections;
}

export interface Connections {
  phone_number_format?: "national" | "international" | "E164";
  hyperlink?: boolean;
  show_icons?: boolean;
  display_urls_instead_of_usernames?: boolean;
  separator?: string;
  space_between_connections?: string;
}


const getConnections = (defaults: Connections) => {
  return z.object({
    phone_number_format: z.enum(["national", "international", "E164"] as const)
      .default(defaults.phone_number_format ?? 'national')
      .describe("Phone number format. The default value is `national`."),
    hyperlink: z.boolean()
      .default(defaults.hyperlink ?? true)
      .describe("Make contact information clickable in the PDF. The default value is `true`."),
    show_icons: z.boolean()
      .default(defaults.show_icons ?? true)
      .describe("Show icons next to contact information. The default value is `true`."),
    display_urls_instead_of_usernames: z.boolean()
      .default(defaults.display_urls_instead_of_usernames ?? false)
      .describe("Display full URLs instead of labels. The default value is `false`."),
    separator: z.string()
      .default(defaults.separator ?? '')
      .describe("Character(s) to separate contact items (e.g., '|' or '•'). Leave empty for no separator. The default value is `''`."),
    space_between_connections: z.string()
      .default(defaults.space_between_connections ?? '0.5cm')
      .describe("Horizontal space between contact items. The default value is `0.5cm`."),
  });
};

export const getHeader = (defaults: Header) => {
  return z.object({
    alignment: z.enum(["left", "center", "right"] as const)
      .default(defaults.alignment ?? 'center')
      .describe("Header alignment. Options: 'left', 'center', 'right'. The default value is `center`."),
    photo_width: z.string()
      .default(defaults.photo_width ?? '3.5cm')
      .describe("Photo width. The default value is `3.5cm`."),
    photo_position: z.enum(["left", "right"] as const)
      .default(defaults.photo_position ?? 'left')
      .describe("Photo position (left or right). The default value is `left`."),
    photo_space_left: z.string()
      .default(defaults.photo_space_left ?? '0.4cm')
      .describe("Space to the left of the photo. The default value is `0.4cm`."),
    photo_space_right: z.string()
      .default(defaults.photo_space_right ?? '0.4cm')
      .describe("Space to the right of the photo. The default value is `0.4cm`."),
    space_below_name: z.string()
      .default(defaults.space_below_name ?? '0.7cm')
      .describe("Space below your name. The default value is `0.7cm`."),
    space_below_headline: z.string()
      .default(defaults.space_below_headline ?? '0.7cm')
      .describe("Space below the headline. The default value is `0.7cm`."),
    space_below_connections: z.string()
      .default(defaults.space_below_connections ?? '0.7cm')
      .describe("Space below contact information. The default value is `0.7cm`."),
    connections: getConnections(defaults.connections as Connections).optional(),
  });
}