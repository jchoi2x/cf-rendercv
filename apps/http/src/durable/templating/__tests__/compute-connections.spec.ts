import { describe, expect, it } from "vitest";

import { computeConnections } from "../compute-connections";

describe("computeConnections", () => {
  const payload = {
    cv: {
      location: "San Francisco, CA",
      email: "john.doe@email.com",
      website: "https://rendercv.com/",
      social_networks: [
        { network: "LinkedIn", username: "rendercv" },
        { network: "GitHub", username: "rendercv" },
      ],
    },
    design: {
      header: {
        connections: {
          show_icons: true,
          hyperlink: true,
          display_urls_instead_of_usernames: false,
        },
      },
    },
  };

  it("routes typst formatting with icons and links", () => {
    const out = computeConnections(payload, "typst");

    expect(out[0]).toBe('#connection-with-icon("location-dot")[San Francisco, CA]');
    expect(out[1]).toBe(
      '#link("mailto:john.doe@email.com", icon: false, if-underline: false, if-color: false)[#connection-with-icon("envelope")[john.doe\\@email.com]]',
    );
    expect(out[2]).toContain('#connection-with-icon("link")[rendercv.com]');
    expect(out[3]).toContain('#connection-with-icon("linkedin")[rendercv]');
    expect(out[4]).toContain('#connection-with-icon("github")[rendercv]');
  });

  it("routes markdown formatting", () => {
    const out = computeConnections(payload, "markdown");
    expect(out[0]).toBe("San Francisco, CA");
    expect(out[1]).toBe("[john.doe@email.com](mailto:john.doe@email.com)");
    expect(out[2]).toBe("[rendercv.com](https://rendercv.com/)");
  });
});

