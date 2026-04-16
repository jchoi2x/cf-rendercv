import { describe, expect, it } from "vitest";

import { computeConnections } from "../compute-connections";

describe("computeConnections", () => {
  const payload = {
    cv: {
      location: "San Francisco, CA",
      email: "john.doe@email.com",
      phone: "+1 (415) 555-0123",
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
    expect(out[2]).toBe(
      '#link("tel:+1-415-555-0123", icon: false, if-underline: false, if-color: false)[#connection-with-icon("phone")[(415) 555-0123]]',
    );
    expect(out[3]).toContain('#connection-with-icon("link")[rendercv.com]');
    expect(out[4]).toContain('#connection-with-icon("linkedin")[rendercv]');
    expect(out[5]).toContain('#connection-with-icon("github")[rendercv]');
  });

  it("routes markdown formatting", () => {
    const out = computeConnections(payload, "markdown");
    expect(out[0]).toBe("San Francisco, CA");
    expect(out[1]).toBe("[john.doe@email.com](mailto:john.doe@email.com)");
    expect(out[2]).toBe("[(415) 555-0123](tel:+1-415-555-0123)");
    expect(out[3]).toBe("[rendercv.com](https://rendercv.com/)");
  });

  it("escapes slashes in typst link labels when showing full URLs", () => {
    const out = computeConnections(
      {
        cv: {
          social_networks: [{ network: "LinkedIn", username: "rendercv" }],
        },
        design: {
          header: {
            connections: {
              show_icons: false,
              hyperlink: true,
              display_urls_instead_of_usernames: true,
            },
          },
        },
      },
      "typst",
    );
    expect(out[0]).toBe(
      '#link("https://linkedin.com/in/rendercv", icon: false, if-underline: false, if-color: false)[linkedin.com\\/in\\/rendercv]',
    );
  });
});

