export const preambleContext = {
  cv: {
    _plain_name: "James Choi",
    _footer:
      "context { [#emph[James Choi -- #str(here().page())\\/#str(counter(page).final().first())]] }",
    _top_note: "#emph[Last updated in Mar 2026]",
  },

  settings: {
    pdf_title: "James Choi - CV",
    _resolved_current_date: {
      year: 2026,
      month: 3,
      day: 31,
    },
  },

  locale: {
    language_iso_639_1: "en",
    is_rtl: false,
  },

  design: {
    page: {
      size: "us-letter",
      top_margin: "0.7in",
      bottom_margin: "0.7in",
      left_margin: "0.7in",
      right_margin: "0.7in",
      show_footer: true,
      show_top_note: true,
    },

    colors: {
      body: "#000000",
      name: "#000000",
      headline: "#000000",
      connections: "#000000",
      section_titles: "#000000",
      links: "#000000",
      footer: "#808080",
      top_note: "#808080",
    },

    typography: {
      line_spacing: "0.6em",
      alignment: "justified",
      date_and_location_column_alignment: "right",
      font_family: {
        body: "New Computer Modern",
        name: "New Computer Modern",
        headline: "New Computer Modern",
        connections: "New Computer Modern",
        section_titles: "New Computer Modern",
      },
      font_size: {
        body: "10pt",
        name: "30pt",
        headline: "10pt",
        connections: "10pt",
        section_titles: "1.4em",
      },
      small_caps: {
        name: false,
        headline: false,
        connections: false,
        section_titles: false,
      },
      bold: {
        name: true,
        headline: false,
        connections: false,
        section_titles: true,
      },
    },

    links: {
      underline: true,
      show_external_link_icon: false,
    },

    header: {
      alignment: "center",
      photo_width: "3.5cm",
      space_below_name: "0.7cm",
      space_below_headline: "0.7cm",
      space_below_connections: "0.7cm",
      connections: {
        hyperlink: true,
        show_icons: false,
        display_urls_instead_of_usernames: true,
        separator: "•",
        space_between_connections: "0.5cm",
      },
    },

    section_titles: {
      type: "with_full_line",
      line_thickness: "0.5pt",
      space_above: "0.5cm",
      space_below: "0.3cm",
    },

    sections: {
      allow_page_break: true,
      space_between_text_based_entries: "0.3em",
      space_between_regular_entries: "1.2em",
    },
    templates: {
      education_entry: {
        degree_column: true,
      },
    },

    entries: {
      date_and_location_width: "4.15cm",
      side_space: "0.2cm",
      space_between_columns: "0.1cm",
      allow_page_break: false,
      short_second_row: false,
      degree_width: "1cm",
      summary: {
        space_left: "0cm",
        space_above: "0cm",
      },
      highlights: {
        bullet: "◦",
        nested_bullet: "◦",
        space_left: "0.15cm",
        space_above: "0cm",
        space_between_items: "0cm",
        space_between_bullet_and_text: "0.5em",
      },
    },
  },
};
