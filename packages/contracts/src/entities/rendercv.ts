/* Auto-generated Zod schemas from RenderCV JSON Schema. */
import { z } from "zod";

export const Alignment: z.ZodTypeAny = z.lazy(() => z.enum(["left", "center", "right"] as const));

export const ArabicLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("arabic")
        .describe("The language for your CV. The default value is `arabic`.")
        .default("arabic")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `آخر تحديث في`.')
        .default("آخر تحديث في")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `شهر`.')
        .default("شهر")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `أشهر`.')
        .default("أشهر")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `سنة`.')
        .default("سنة")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `سنوات`.')
        .default("سنوات")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `الحاضر`.')
        .default("الحاضر")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_1.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["ينا", "فبر", "مار", "أبر", "ماي", "يون", "يول", "أغس", "سبت", "أكت", "نوف", "ديس"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "يناير",
          "فبراير",
          "مارس",
          "أبريل",
          "مايو",
          "يونيو",
          "يوليو",
          "أغسطس",
          "سبتمبر",
          "أكتوبر",
          "نوفمبر",
          "ديسمبر",
        ])
        .optional(),
    })
    .strict()
    .describe("ArabicLocale"),
);

export const ArbitraryDate: z.ZodTypeAny = z.lazy(() => z.union([z.number().int(), z.string()]));

export const BuiltInDesign: z.ZodTypeAny = z.lazy(() =>
  z.union([ClassicTheme, EngineeringclassicTheme, EngineeringresumesTheme, ModerncvTheme, Sb2novTheme]),
);

export const Bullet: z.ZodTypeAny = z.lazy(() => z.enum(["●", "•", "◦", "-", "◆", "★", "■", "—", "○"] as const));

export const BulletEntry: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      bullet: z.string().describe("Bullet"),
    })
    .passthrough()
    .describe("BulletEntry"),
);

export const ClassicTheme: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      theme: z.literal("classic").describe("Theme").default("classic").optional(),
      page: rendercv_schema_models_design_classic_theme_Page_1.optional(),
      colors: rendercv_schema_models_design_classic_theme_Colors_1.optional(),
      typography: rendercv_schema_models_design_classic_theme_Typography_1.optional(),
      links: rendercv_schema_models_design_classic_theme_Links_1.optional(),
      header: rendercv_schema_models_design_classic_theme_Header_1.optional(),
      section_titles: rendercv_schema_models_design_classic_theme_SectionTitles_1.optional(),
      sections: rendercv_schema_models_design_classic_theme_Sections_1.optional(),
      entries: rendercv_schema_models_design_classic_theme_Entries_1.optional(),
      templates: rendercv_schema_models_design_classic_theme_Templates_1.optional(),
    })
    .strict()
    .describe("ClassicTheme"),
);

export const CustomConnection: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      fontawesome_icon: z.string().describe("Fontawesome Icon"),
      placeholder: z.string().describe("Placeholder"),
      url: z.union([z.string().url().min(1).max(2083), z.null()]).describe("Url"),
    })
    .strict()
    .describe("CustomConnection"),
);

export const Cv: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      name: z.union([z.string(), z.null()]).describe("Name").default(null).optional(),
      headline: z.union([z.string(), z.null()]).describe("Headline").default(null).optional(),
      location: z.union([z.string(), z.null()]).describe("Location").default(null).optional(),
      email: z.any().describe("You can provide multiple emails as a list.").default(null).optional(),
      photo: z
        .union([ExistingPathRelativeToInput, z.null()])
        .describe("Photo file path, relative to the YAML file.")
        .default(null)
        .optional(),
      phone: z
        .any()
        .describe(
          "Your phone number with country code in international format (e.g., +1 for USA, +44 for UK). The display format in the output is controlled by `design.header.connections.phone_number_format`. You can provide multiple numbers as a list.",
        )
        .default(null)
        .optional(),
      website: z.any().describe("You can provide multiple URLs as a list.").default(null).optional(),
      social_networks: z
        .union([z.array(SocialNetwork), z.null()])
        .describe("Social Networks")
        .default(null)
        .optional(),
      custom_connections: z
        .union([z.array(CustomConnection), z.null()])
        .describe(
          "Additional header connections you define yourself. Each item has a `placeholder` (the displayed text), an optional `url`, and the Font Awesome icon name to render (from https://fontawesome.com/search).",
        )
        .default(null)
        .optional(),
      sections: z
        .union([z.object({}).catchall(Section), z.null()])
        .describe(
          "The sections of your CV. Keys are section titles (e.g., Experience, Education), and values are lists of entries. Entry types are automatically detected based on their fields.",
        )
        .default(null)
        .optional(),
    })
    .strict()
    .describe("Cv"),
);

export const DanishLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("danish")
        .describe("The language for your CV. The default value is `danish`.")
        .default("danish")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `Senest opdateret`.')
        .default("Senest opdateret")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `måned`.')
        .default("måned")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `måneder`.')
        .default("måneder")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `år`.')
        .default("år")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `år`.')
        .default("år")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `nuværende`.')
        .default("nuværende")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_2.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "Januar",
          "Februar",
          "Marts",
          "April",
          "Maj",
          "Juni",
          "Juli",
          "August",
          "September",
          "Oktober",
          "November",
          "December",
        ])
        .optional(),
    })
    .strict()
    .describe("DanishLocale"),
);

export const DutchLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("dutch")
        .describe("The language for your CV. The default value is `dutch`.")
        .default("dutch")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `Laatst bijgewerkt`.')
        .default("Laatst bijgewerkt")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `maand`.')
        .default("maand")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `maanden`.')
        .default("maanden")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `jaar`.')
        .default("jaar")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `jaren`.')
        .default("jaren")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `heden`.')
        .default("heden")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_3.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "Januari",
          "Februari",
          "Maart",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Augustus",
          "September",
          "Oktober",
          "November",
          "December",
        ])
        .optional(),
    })
    .strict()
    .describe("DutchLocale"),
);

export const EngineeringclassicTheme: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      theme: z.literal("engineeringclassic").describe("Theme").default("engineeringclassic").optional(),
      page: rendercv_schema_models_design_classic_theme_Page_1.optional(),
      colors: rendercv_schema_models_design_classic_theme_Colors_1.optional(),
      typography: rendercv_schema_models_design_classic_theme_Typography_2.optional(),
      links: rendercv_schema_models_design_classic_theme_Links_2.optional(),
      header: rendercv_schema_models_design_classic_theme_Header_2.optional(),
      section_titles: rendercv_schema_models_design_classic_theme_SectionTitles_2.optional(),
      sections: rendercv_schema_models_design_classic_theme_Sections_2.optional(),
      entries: rendercv_schema_models_design_classic_theme_Entries_2.optional(),
      templates: rendercv_schema_models_design_classic_theme_Templates_2.optional(),
    })
    .strict()
    .describe("EngineeringclassicTheme"),
);

export const EngineeringresumesTheme: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      theme: z.literal("engineeringresumes").describe("Theme").default("engineeringresumes").optional(),
      page: rendercv_schema_models_design_classic_theme_Page_2.optional(),
      colors: rendercv_schema_models_design_classic_theme_Colors_2.optional(),
      typography: rendercv_schema_models_design_classic_theme_Typography_3.optional(),
      links: rendercv_schema_models_design_classic_theme_Links_3.optional(),
      header: rendercv_schema_models_design_classic_theme_Header_3.optional(),
      section_titles: rendercv_schema_models_design_classic_theme_SectionTitles_3.optional(),
      sections: rendercv_schema_models_design_classic_theme_Sections_3.optional(),
      entries: rendercv_schema_models_design_classic_theme_Entries_3.optional(),
      templates: rendercv_schema_models_design_classic_theme_Templates_3.optional(),
    })
    .strict()
    .describe("EngineeringresumesTheme"),
);

export const EnglishLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("english")
        .describe("The language for your CV. The default value is `english`.")
        .default("english")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `Last updated in`.')
        .default("Last updated in")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `month`.')
        .default("month")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `months`.')
        .default("months")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `year`.')
        .default("year")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `years`.')
        .default("years")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `present`.')
        .default("present")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_1.optional(),
      month_abbreviations: z
        .array(z.string())
        .min(12)
        .max(12)
        .describe("Month abbreviations (Jan-Dec).")
        .default(["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"])
        .optional(),
      month_names: z
        .array(z.string())
        .min(12)
        .max(12)
        .describe("Full month names (January-December).")
        .default([
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ])
        .optional(),
    })
    .strict()
    .describe("EnglishLocale"),
);

export const ExactDate: z.ZodTypeAny = z.lazy(() => z.union([z.string(), z.number().int()]));

export const ExistingPathRelativeToInput: z.ZodTypeAny = z.lazy(() => z.string().min(1));

export const FrenchLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("french")
        .describe("The language for your CV. The default value is `french`.")
        .default("french")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `Dernière mise à jour`.')
        .default("Dernière mise à jour")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `mois`.')
        .default("mois")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `mois`.')
        .default("mois")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `an`.')
        .default("an")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `ans`.')
        .default("ans")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `présent`.')
        .default("présent")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_4.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "Janvier",
          "Février",
          "Mars",
          "Avril",
          "Mai",
          "Juin",
          "Juillet",
          "Août",
          "Septembre",
          "Octobre",
          "Novembre",
          "Décembre",
        ])
        .optional(),
    })
    .strict()
    .describe("FrenchLocale"),
);

export const GermanLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("german")
        .describe("The language for your CV. The default value is `german`.")
        .default("german")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `Zuletzt aktualisiert`.')
        .default("Zuletzt aktualisiert")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `Monat`.')
        .default("Monat")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `Monate`.')
        .default("Monate")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `Jahr`.')
        .default("Jahr")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `Jahre`.')
        .default("Jahre")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `gegenwärtig`.')
        .default("gegenwärtig")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_5.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "Januar",
          "Februar",
          "März",
          "April",
          "Mai",
          "Juni",
          "Juli",
          "August",
          "September",
          "Oktober",
          "November",
          "Dezember",
        ])
        .optional(),
    })
    .strict()
    .describe("GermanLocale"),
);

export const HebrewLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("hebrew")
        .describe("The language for your CV. The default value is `hebrew`.")
        .default("hebrew")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `עודכן לאחרונה ב`.')
        .default("עודכן לאחרונה ב")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `חודש`.')
        .default("חודש")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `חודשים`.')
        .default("חודשים")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `שנה`.')
        .default("שנה")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `שנים`.')
        .default("שנים")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `הווה`.')
        .default("הווה")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_1.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["ינו'", "פבר'", "מרץ", "אפר'", "מאי", "יוני", "יולי", "אוג'", "ספט'", "אוק'", "נוב'", "דצמ'"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "ינואר",
          "פברואר",
          "מרץ",
          "אפריל",
          "מאי",
          "יוני",
          "יולי",
          "אוגוסט",
          "ספטמבר",
          "אוקטובר",
          "נובמבר",
          "דצמבר",
        ])
        .optional(),
    })
    .strict()
    .describe("HebrewLocale"),
);

export const HindiLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("hindi")
        .describe("The language for your CV. The default value is `hindi`.")
        .default("hindi")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `अंतिम अद्यतन`.')
        .default("अंतिम अद्यतन")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `महीना`.')
        .default("महीना")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `महीने`.')
        .default("महीने")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `वर्ष`.')
        .default("वर्ष")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `वर्ष`.')
        .default("वर्ष")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `वर्तमान`.')
        .default("वर्तमान")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_6.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["जन", "फर", "मार", "अप्र", "मई", "जून", "जुल", "अग", "सित", "अक्ट", "नव", "दिस"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "जनवरी",
          "फरवरी",
          "मार्च",
          "अप्रैल",
          "मई",
          "जून",
          "जुलाई",
          "अगस्त",
          "सितंबर",
          "अक्टूबर",
          "नवंबर",
          "दिसंबर",
        ])
        .optional(),
    })
    .strict()
    .describe("HindiLocale"),
);

export const IndonesianLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("indonesian")
        .describe("The language for your CV. The default value is `indonesian`.")
        .default("indonesian")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `Terakhir diperbarui`.')
        .default("Terakhir diperbarui")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `bulan`.')
        .default("bulan")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `bulan`.')
        .default("bulan")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `tahun`.')
        .default("tahun")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `tahun`.')
        .default("tahun")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `sekarang`.')
        .default("sekarang")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_7.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ])
        .optional(),
    })
    .strict()
    .describe("IndonesianLocale"),
);

export const ItalianLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("italian")
        .describe("The language for your CV. The default value is `italian`.")
        .default("italian")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `Ultimo aggiornamento`.')
        .default("Ultimo aggiornamento")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `mese`.')
        .default("mese")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `mesi`.')
        .default("mesi")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `anno`.')
        .default("anno")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `anni`.')
        .default("anni")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `presente`.')
        .default("presente")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_8.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "Gennaio",
          "Febbraio",
          "Marzo",
          "Aprile",
          "Maggio",
          "Giugno",
          "Luglio",
          "Agosto",
          "Settembre",
          "Ottobre",
          "Novembre",
          "Dicembre",
        ])
        .optional(),
    })
    .strict()
    .describe("ItalianLocale"),
);

export const JapaneseLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("japanese")
        .describe("The language for your CV. The default value is `japanese`.")
        .default("japanese")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `最終更新`.')
        .default("最終更新")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `月`.')
        .default("月")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `ヶ月`.')
        .default("ヶ月")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `年`.')
        .default("年")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `年`.')
        .default("年")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `現在`.')
        .default("現在")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_9.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default(["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"])
        .optional(),
    })
    .strict()
    .describe("JapaneseLocale"),
);

export const KoreanLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("korean")
        .describe("The language for your CV. The default value is `korean`.")
        .default("korean")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `마지막 업데이트`.')
        .default("마지막 업데이트")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `월`.')
        .default("월")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `개월`.')
        .default("개월")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `년`.')
        .default("년")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `년`.')
        .default("년")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `현재`.')
        .default("현재")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_10.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default(["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"])
        .optional(),
    })
    .strict()
    .describe("KoreanLocale"),
);

export const ListOfEntries: z.ZodTypeAny = z.lazy(() =>
  z.union([
    z.array(z.string()),
    z.array(rendercv_schema_models_cv_entries_one_line_OneLineEntry),
    z.array(rendercv_schema_models_cv_entries_normal_NormalEntry),
    z.array(rendercv_schema_models_cv_entries_experience_ExperienceEntry),
    z.array(rendercv_schema_models_cv_entries_education_EducationEntry),
    z.array(rendercv_schema_models_cv_entries_publication_PublicationEntry),
    z.array(BulletEntry),
    z.array(NumberedEntry),
    z.array(ReversedNumberedEntry),
  ]),
);

export const Locale: z.ZodTypeAny = z.lazy(() =>
  z.union([
    EnglishLocale,
    ArabicLocale,
    DanishLocale,
    DutchLocale,
    FrenchLocale,
    GermanLocale,
    HebrewLocale,
    HindiLocale,
    IndonesianLocale,
    ItalianLocale,
    JapaneseLocale,
    KoreanLocale,
    MandarinChineseLocale,
    NorwegianBokm_lLocale,
    NorwegianNynorskLocale,
    PersianLocale,
    PortugueseLocale,
    RussianLocale,
    SpanishLocale,
    TurkishLocale,
  ]),
);

export const MandarinChineseLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("mandarin_chinese")
        .describe("The language for your CV. The default value is `mandarin_chinese`.")
        .default("mandarin_chinese")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `最后更新于`.')
        .default("最后更新于")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `个月`.')
        .default("个月")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `个月`.')
        .default("个月")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `年`.')
        .default("年")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `年`.')
        .default("年")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `至今`.')
        .default("至今")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_11.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default(["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"])
        .optional(),
    })
    .strict()
    .describe("MandarinChineseLocale"),
);

export const ModerncvTheme: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      theme: z.literal("moderncv").describe("Theme").default("moderncv").optional(),
      page: rendercv_schema_models_design_classic_theme_Page_1.optional(),
      colors: rendercv_schema_models_design_classic_theme_Colors_1.optional(),
      typography: rendercv_schema_models_design_classic_theme_Typography_4.optional(),
      links: rendercv_schema_models_design_classic_theme_Links_4.optional(),
      header: rendercv_schema_models_design_classic_theme_Header_4.optional(),
      section_titles: rendercv_schema_models_design_classic_theme_SectionTitles_4.optional(),
      sections: rendercv_schema_models_design_classic_theme_Sections_4.optional(),
      entries: rendercv_schema_models_design_classic_theme_Entries_4.optional(),
      templates: rendercv_schema_models_design_classic_theme_Templates_4.optional(),
    })
    .strict()
    .describe("ModerncvTheme"),
);

export const NorwegianBokm_lLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("norwegian_bokmål")
        .describe("The language for your CV. The default value is `norwegian_bokmål`.")
        .default("norwegian_bokmål")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `Sist oppdatert`.')
        .default("Sist oppdatert")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `måned`.')
        .default("måned")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `måneder`.')
        .default("måneder")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `år`.')
        .default("år")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `år`.')
        .default("år")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `nåværende`.')
        .default("nåværende")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_12.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "Januar",
          "Februar",
          "Mars",
          "April",
          "Mai",
          "Juni",
          "Juli",
          "August",
          "September",
          "Oktober",
          "November",
          "Desember",
        ])
        .optional(),
    })
    .strict()
    .describe("NorwegianBokmålLocale"),
);

export const NorwegianNynorskLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("norwegian_nynorsk")
        .describe("The language for your CV. The default value is `norwegian_nynorsk`.")
        .default("norwegian_nynorsk")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `Sist oppdatert`.')
        .default("Sist oppdatert")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `månad`.')
        .default("månad")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `månader`.')
        .default("månader")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `år`.')
        .default("år")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `år`.')
        .default("år")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `nåverande`.')
        .default("nåverande")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_13.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "Januar",
          "Februar",
          "Mars",
          "April",
          "Mai",
          "Juni",
          "Juli",
          "August",
          "September",
          "Oktober",
          "November",
          "Desember",
        ])
        .optional(),
    })
    .strict()
    .describe("NorwegianNynorskLocale"),
);

export const NumberedEntry: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      number: z.string().describe("Number"),
    })
    .passthrough()
    .describe("NumberedEntry"),
);

export const PageSize: z.ZodTypeAny = z.lazy(() => z.enum(["a4", "a5", "us-letter", "us-executive"] as const));

export const PersianLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("persian")
        .describe("The language for your CV. The default value is `persian`.")
        .default("persian")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `آخرین به‌روزرسانی در`.')
        .default("آخرین به‌روزرسانی در")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `ماه`.')
        .default("ماه")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `ماه`.')
        .default("ماه")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `سال`.')
        .default("سال")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `سال`.')
        .default("سال")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `حال`.')
        .default("حال")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_1.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["ژان", "فور", "مار", "آور", "مه", "ژون", "ژول", "اوت", "سپت", "اکت", "نوا", "دسا"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "ژانویه",
          "فوریه",
          "مارس",
          "آوریل",
          "مه",
          "ژوئن",
          "ژوئیه",
          "اوت",
          "سپتامبر",
          "اکتبر",
          "نوامبر",
          "دسامبر",
        ])
        .optional(),
    })
    .strict()
    .describe("PersianLocale"),
);

export const PhoneNumberFormatType: z.ZodTypeAny = z.lazy(() => z.enum(["national", "international", "E164"] as const));

export const PlannedPathRelativeToInput: z.ZodTypeAny = z.lazy(() => z.string().min(1));

export const PortugueseLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("portuguese")
        .describe("The language for your CV. The default value is `portuguese`.")
        .default("portuguese")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `Última atualização`.')
        .default("Última atualização")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `mês`.')
        .default("mês")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `meses`.')
        .default("meses")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `ano`.')
        .default("ano")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `anos`.')
        .default("anos")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `presente`.')
        .default("presente")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_14.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "Janeiro",
          "Fevereiro",
          "Março",
          "Abril",
          "Maio",
          "Junho",
          "Julho",
          "Agosto",
          "Setembro",
          "Outubro",
          "Novembro",
          "Dezembro",
        ])
        .optional(),
    })
    .strict()
    .describe("PortugueseLocale"),
);

export const RenderCommand: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      output_folder: PlannedPathRelativeToInput.optional(),
      design: z
        .union([ExistingPathRelativeToInput, z.null()])
        .describe("Path to a YAML file containing the `design` field.")
        .default(null)
        .optional(),
      locale: z
        .union([ExistingPathRelativeToInput, z.null()])
        .describe("Path to a YAML file containing the `locale` field.")
        .default(null)
        .optional(),
      typst_path: PlannedPathRelativeToInput.optional(),
      pdf_path: PlannedPathRelativeToInput.optional(),
      markdown_path: PlannedPathRelativeToInput.optional(),
      html_path: PlannedPathRelativeToInput.optional(),
      png_path: PlannedPathRelativeToInput.optional(),
      dont_generate_markdown: z
        .boolean()
        .describe("Skip Markdown generation. This also disables HTML generation. The default value is `false`.")
        .default(false)
        .optional(),
      dont_generate_html: z
        .boolean()
        .describe("Skip HTML generation. The default value is `false`.")
        .default(false)
        .optional(),
      dont_generate_typst: z
        .boolean()
        .describe("Skip Typst generation. This also disables PDF and PNG generation. The default value is `false`.")
        .default(false)
        .optional(),
      dont_generate_pdf: z
        .boolean()
        .describe("Skip PDF generation. The default value is `false`.")
        .default(false)
        .optional(),
      dont_generate_png: z
        .boolean()
        .describe("Skip PNG generation. The default value is `false`.")
        .default(false)
        .optional(),
    })
    .strict()
    .describe("RenderCommand"),
);

export const ReversedNumberedEntry: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      reversed_number: z
        .string()
        .describe(
          "Reverse-numbered list item. Numbering goes in reverse (5, 4, 3, 2, 1), making recent items have higher numbers.",
        ),
    })
    .passthrough()
    .describe("ReversedNumberedEntry"),
);

export const RussianLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("russian")
        .describe("The language for your CV. The default value is `russian`.")
        .default("russian")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `Последнее обновление`.')
        .default("Последнее обновление")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `месяц`.')
        .default("месяц")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `месяцы`.')
        .default("месяцы")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `год`.')
        .default("год")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `лет`.')
        .default("лет")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `настоящее время`.')
        .default("настоящее время")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_15.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "Январь",
          "Февраль",
          "Март",
          "Апрель",
          "Май",
          "Июнь",
          "Июль",
          "Август",
          "Сентябрь",
          "Октябрь",
          "Ноябрь",
          "Декабрь",
        ])
        .optional(),
    })
    .strict()
    .describe("RussianLocale"),
);

export const Sb2novTheme: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      theme: z.literal("sb2nov").describe("Theme").default("sb2nov").optional(),
      page: rendercv_schema_models_design_classic_theme_Page_1.optional(),
      colors: rendercv_schema_models_design_classic_theme_Colors_3.optional(),
      typography: rendercv_schema_models_design_classic_theme_Typography_5.optional(),
      links: rendercv_schema_models_design_classic_theme_Links_5.optional(),
      header: rendercv_schema_models_design_classic_theme_Header_5.optional(),
      section_titles: rendercv_schema_models_design_classic_theme_SectionTitles_5.optional(),
      sections: rendercv_schema_models_design_classic_theme_Sections_5.optional(),
      entries: rendercv_schema_models_design_classic_theme_Entries_5.optional(),
      templates: rendercv_schema_models_design_classic_theme_Templates_5.optional(),
    })
    .strict()
    .describe("Sb2novTheme"),
);

export const Section: z.ZodTypeAny = z.lazy(() => ListOfEntries);

export const SectionTitleType: z.ZodTypeAny = z.lazy(() =>
  z.enum(["with_partial_line", "with_full_line", "without_line", "moderncv"] as const),
);

export const Settings: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      current_date: z
        .union([z.string(), z.literal("today")])
        .describe(
          'The date to use as "current date" for filenames, the "last updated" label, and time span calculations. Defaults to the actual current date.',
        )
        .default("today")
        .optional(),
      render_command: RenderCommand.optional(),
      bold_keywords: z
        .array(z.string())
        .describe("Keywords to automatically bold in the output.")
        .default([])
        .optional(),
      pdf_title: z
        .string()
        .describe(
          "Title metadata for the PDF document. This appears in browser tabs and PDF readers. Available placeholders:\n- `NAME`: The CV owner's name from `cv.name`\n- `CURRENT_DATE`: Formatted date based on `design.templates.single_date`\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `NAME - CV`.",
        )
        .default("NAME - CV")
        .optional(),
    })
    .strict()
    .describe("Settings"),
);

export const SmallCaps: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      name: z
        .boolean()
        .describe("Whether to use small caps for the name. The default value is `false`.")
        .default(false)
        .optional(),
      headline: z
        .boolean()
        .describe("Whether to use small caps for the headline. The default value is `false`.")
        .default(false)
        .optional(),
      connections: z
        .boolean()
        .describe("Whether to use small caps for connections. The default value is `false`.")
        .default(false)
        .optional(),
      section_titles: z
        .boolean()
        .describe("Whether to use small caps for section titles. The default value is `false`.")
        .default(false)
        .optional(),
    })
    .strict()
    .describe("SmallCaps"),
);

export const SocialNetwork: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      network: SocialNetworkName,
      username: z.string().describe("Username"),
    })
    .strict()
    .describe("SocialNetwork"),
);

export const SocialNetworkName: z.ZodTypeAny = z.lazy(() =>
  z.enum([
    "LinkedIn",
    "GitHub",
    "GitLab",
    "IMDB",
    "Instagram",
    "ORCID",
    "Mastodon",
    "StackOverflow",
    "ResearchGate",
    "YouTube",
    "Google Scholar",
    "Telegram",
    "WhatsApp",
    "Leetcode",
    "X",
    "Bluesky",
    "Reddit",
  ] as const),
);

export const SpanishLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("spanish")
        .describe("The language for your CV. The default value is `spanish`.")
        .default("spanish")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `Última actualización`.')
        .default("Última actualización")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `mes`.')
        .default("mes")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `meses`.')
        .default("meses")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `año`.')
        .default("año")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `años`.')
        .default("años")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `presente`.')
        .default("presente")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_16.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ])
        .optional(),
    })
    .strict()
    .describe("SpanishLocale"),
);

export const TurkishLocale: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      language: z
        .literal("turkish")
        .describe("The language for your CV. The default value is `turkish`.")
        .default("turkish")
        .optional(),
      last_updated: z
        .string()
        .describe('Translation of "Last updated in". The default value is `Son güncelleme`.')
        .default("Son güncelleme")
        .optional(),
      month: z
        .string()
        .describe('Translation of "month" (singular). The default value is `ay`.')
        .default("ay")
        .optional(),
      months: z
        .string()
        .describe('Translation of "months" (plural). The default value is `ay`.')
        .default("ay")
        .optional(),
      year: z
        .string()
        .describe('Translation of "year" (singular). The default value is `yıl`.')
        .default("yıl")
        .optional(),
      years: z
        .string()
        .describe('Translation of "years" (plural). The default value is `yıl`.')
        .default("yıl")
        .optional(),
      present: z
        .string()
        .describe('Translation of "present" for ongoing dates. The default value is `halen`.')
        .default("halen")
        .optional(),
      phrases: rendercv_schema_models_locale_english_locale_Phrases_17.optional(),
      month_abbreviations: z
        .array(z.string())
        .describe("Month abbreviations (Jan-Dec).")
        .default(["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"])
        .optional(),
      month_names: z
        .array(z.string())
        .describe("Full month names (January-December).")
        .default([
          "Ocak",
          "Şubat",
          "Mart",
          "Nisan",
          "Mayıs",
          "Haziran",
          "Temmuz",
          "Ağustos",
          "Eylül",
          "Ekim",
          "Kasım",
          "Aralık",
        ])
        .optional(),
    })
    .strict()
    .describe("TurkishLocale"),
);

export const TypstDimension: z.ZodTypeAny = z.lazy(() => z.string());

export const rendercv_schema_models_cv_entries_education_EducationEntry: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      institution: z.string().describe("Institution"),
      area: z.string().describe("Field of study or major."),
      degree: z.union([z.string(), z.null()]).describe("Degree").default(null).optional(),
      date: z
        .union([ArbitraryDate, z.null()])
        .describe(
          "The date of this event in YYYY-MM-DD, YYYY-MM, or YYYY format, or any custom text like 'Fall 2023'. Use this for single-day or imprecise dates. For date ranges, use `start_date` and `end_date` instead.",
        )
        .default(null)
        .optional(),
      start_date: z
        .union([ExactDate, z.null()])
        .describe("The start date in YYYY-MM-DD, YYYY-MM, or YYYY format.")
        .default(null)
        .optional(),
      end_date: z
        .union([ExactDate, z.literal("present"), z.null()])
        .describe(
          'The end date in YYYY-MM-DD, YYYY-MM, or YYYY format. Use "present" for ongoing events, or omit it to indicate the event is ongoing.',
        )
        .default(null)
        .optional(),
      location: z.union([z.string(), z.null()]).describe("Location").default(null).optional(),
      summary: z.union([z.string(), z.null()]).describe("Summary").default(null).optional(),
      highlights: z
        .union([z.array(z.string()), z.null()])
        .describe("Bullet points for key achievements, responsibilities, or contributions.")
        .default(null)
        .optional(),
    })
    .passthrough()
    .describe("EducationEntry"),
);

export const rendercv_schema_models_cv_entries_experience_ExperienceEntry: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      company: z.string().describe("Company"),
      position: z.string().describe("Position"),
      date: z
        .union([ArbitraryDate, z.null()])
        .describe(
          "The date of this event in YYYY-MM-DD, YYYY-MM, or YYYY format, or any custom text like 'Fall 2023'. Use this for single-day or imprecise dates. For date ranges, use `start_date` and `end_date` instead.",
        )
        .default(null)
        .optional(),
      start_date: z
        .union([ExactDate, z.null()])
        .describe("The start date in YYYY-MM-DD, YYYY-MM, or YYYY format.")
        .default(null)
        .optional(),
      end_date: z
        .union([ExactDate, z.literal("present"), z.null()])
        .describe(
          'The end date in YYYY-MM-DD, YYYY-MM, or YYYY format. Use "present" for ongoing events, or omit it to indicate the event is ongoing.',
        )
        .default(null)
        .optional(),
      location: z.union([z.string(), z.null()]).describe("Location").default(null).optional(),
      summary: z.union([z.string(), z.null()]).describe("Summary").default(null).optional(),
      highlights: z
        .union([z.array(z.string()), z.null()])
        .describe("Bullet points for key achievements, responsibilities, or contributions.")
        .default(null)
        .optional(),
    })
    .passthrough()
    .describe("ExperienceEntry"),
);

export const rendercv_schema_models_cv_entries_normal_NormalEntry: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      name: z.string().describe("Name"),
      date: z
        .union([ArbitraryDate, z.null()])
        .describe(
          "The date of this event in YYYY-MM-DD, YYYY-MM, or YYYY format, or any custom text like 'Fall 2023'. Use this for single-day or imprecise dates. For date ranges, use `start_date` and `end_date` instead.",
        )
        .default(null)
        .optional(),
      start_date: z
        .union([ExactDate, z.null()])
        .describe("The start date in YYYY-MM-DD, YYYY-MM, or YYYY format.")
        .default(null)
        .optional(),
      end_date: z
        .union([ExactDate, z.literal("present"), z.null()])
        .describe(
          'The end date in YYYY-MM-DD, YYYY-MM, or YYYY format. Use "present" for ongoing events, or omit it to indicate the event is ongoing.',
        )
        .default(null)
        .optional(),
      location: z.union([z.string(), z.null()]).describe("Location").default(null).optional(),
      summary: z.union([z.string(), z.null()]).describe("Summary").default(null).optional(),
      highlights: z
        .union([z.array(z.string()), z.null()])
        .describe("Bullet points for key achievements, responsibilities, or contributions.")
        .default(null)
        .optional(),
    })
    .passthrough()
    .describe("NormalEntry"),
);

export const rendercv_schema_models_cv_entries_one_line_OneLineEntry: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      label: z.string().describe("Label"),
      details: z.string().describe("Details"),
    })
    .passthrough()
    .describe("OneLineEntry"),
);

export const rendercv_schema_models_cv_entries_publication_PublicationEntry: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      title: z.string().describe("Title"),
      authors: z.array(z.string()).describe("You can bold your name with **double asterisks**."),
      summary: z.union([z.string(), z.null()]).describe("Summary").default(null).optional(),
      doi: z
        .union([z.string(), z.null()])
        .describe("The DOI (Digital Object Identifier). If provided, it will be used as the link instead of the URL.")
        .default(null)
        .optional(),
      url: z
        .union([z.string().url().min(1).max(2083), z.null()])
        .describe("A URL link to the publication. Ignored if DOI is provided.")
        .default(null)
        .optional(),
      journal: z
        .union([z.string(), z.null()])
        .describe("The journal, conference, or venue where it was published.")
        .default(null)
        .optional(),
      date: z
        .union([ArbitraryDate, z.null()])
        .describe(
          "The date of this event in YYYY-MM-DD, YYYY-MM, or YYYY format, or any custom text like 'Fall 2023'. Use this for single-day or imprecise dates. For date ranges, use `start_date` and `end_date` instead.",
        )
        .default(null)
        .optional(),
    })
    .passthrough()
    .describe("PublicationEntry"),
);

export const rendercv_schema_models_design_classic_theme_Bold_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      name: z
        .boolean()
        .describe("Whether to make the name bold. The default value is `true`.")
        .default(true)
        .optional(),
      headline: z
        .boolean()
        .describe("Whether to make the headline bold. The default value is `false`.")
        .default(false)
        .optional(),
      connections: z
        .boolean()
        .describe("Whether to make connections bold. The default value is `false`.")
        .default(false)
        .optional(),
      section_titles: z
        .boolean()
        .describe("Whether to make section titles bold. The default value is `true`.")
        .default(true)
        .optional(),
    })
    .strict()
    .describe("Bold"),
);

export const rendercv_schema_models_design_classic_theme_Bold_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      name: z
        .boolean()
        .describe("Whether to make the name bold. The default value is `true`.")
        .default(false)
        .optional(),
      headline: z
        .boolean()
        .describe("Whether to make the headline bold. The default value is `false`.")
        .default(false)
        .optional(),
      connections: z
        .boolean()
        .describe("Whether to make connections bold. The default value is `false`.")
        .default(false)
        .optional(),
      section_titles: z
        .boolean()
        .describe("Whether to make section titles bold. The default value is `true`.")
        .default(false)
        .optional(),
    })
    .strict()
    .describe("Bold"),
);

export const rendercv_schema_models_design_classic_theme_Bold_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      name: z
        .boolean()
        .describe("Whether to make the name bold. The default value is `true`.")
        .default(false)
        .optional(),
      headline: z
        .boolean()
        .describe("Whether to make the headline bold. The default value is `false`.")
        .default(false)
        .optional(),
      connections: z
        .boolean()
        .describe("Whether to make connections bold. The default value is `false`.")
        .default(false)
        .optional(),
      section_titles: z
        .boolean()
        .describe("Whether to make section titles bold. The default value is `true`.")
        .default(true)
        .optional(),
    })
    .strict()
    .describe("Bold"),
);

export const rendercv_schema_models_design_classic_theme_Bold_4: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      name: z
        .boolean()
        .describe("Whether to make the name bold. The default value is `true`.")
        .default(false)
        .optional(),
      headline: z
        .boolean()
        .describe("Whether to make the headline bold. The default value is `false`.")
        .default(false)
        .optional(),
      connections: z
        .boolean()
        .describe("Whether to make connections bold. The default value is `false`.")
        .default(false)
        .optional(),
      section_titles: z
        .boolean()
        .describe("Whether to make section titles bold. The default value is `true`.")
        .default(false)
        .optional(),
    })
    .strict()
    .describe("Bold"),
);

export const rendercv_schema_models_design_classic_theme_Colors_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      body: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0, 0, 0)`.",
        )
        .default("rgb(0, 0, 0)")
        .optional(),
      name: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0, 79, 144)`.",
        )
        .default("rgb(0, 79, 144)")
        .optional(),
      headline: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0, 79, 144)`.",
        )
        .default("rgb(0, 79, 144)")
        .optional(),
      connections: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0, 79, 144)`.",
        )
        .default("rgb(0, 79, 144)")
        .optional(),
      section_titles: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0, 79, 144)`.",
        )
        .default("rgb(0, 79, 144)")
        .optional(),
      links: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0, 79, 144)`.",
        )
        .default("rgb(0, 79, 144)")
        .optional(),
      footer: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(128, 128, 128)`.",
        )
        .default("rgb(128, 128, 128)")
        .optional(),
      top_note: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(128, 128, 128)`.",
        )
        .default("rgb(128, 128, 128)")
        .optional(),
    })
    .strict()
    .describe("Colors"),
);

export const rendercv_schema_models_design_classic_theme_Colors_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      body: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0, 0, 0)`.",
        )
        .default("rgb(0, 0, 0)")
        .optional(),
      name: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0,0,0)`.",
        )
        .default("rgb(0,0,0)")
        .optional(),
      headline: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0,0,0)`.",
        )
        .default("rgb(0,0,0)")
        .optional(),
      connections: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0,0,0)`.",
        )
        .default("rgb(0,0,0)")
        .optional(),
      section_titles: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0,0,0)`.",
        )
        .default("rgb(0,0,0)")
        .optional(),
      links: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0,0,0)`.",
        )
        .default("rgb(0,0,0)")
        .optional(),
      footer: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(128, 128, 128)`.",
        )
        .default("rgb(128, 128, 128)")
        .optional(),
      top_note: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(128, 128, 128)`.",
        )
        .default("rgb(128, 128, 128)")
        .optional(),
    })
    .strict()
    .describe("Colors"),
);

export const rendercv_schema_models_design_classic_theme_Colors_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      body: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0, 0, 0)`.",
        )
        .default("rgb(0, 0, 0)")
        .optional(),
      name: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0,0,0)`.",
        )
        .default("rgb(0,0,0)")
        .optional(),
      headline: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0,0,0)`.",
        )
        .default("rgb(0,0,0)")
        .optional(),
      connections: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0,0,0)`.",
        )
        .default("rgb(0,0,0)")
        .optional(),
      section_titles: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0,0,0)`.",
        )
        .default("rgb(0,0,0)")
        .optional(),
      links: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(0,0,0)`.",
        )
        .default("rgb(0,0,0)")
        .optional(),
      footer: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(128, 128, 128)`.",
        )
        .default("rgb(128, 128, 128)")
        .optional(),
      top_note: z
        .string()
        .describe(
          "The color can be specified either with their name (https://www.w3.org/TR/SVG11/types.html#ColorKeywords), hexadecimal value, RGB value, or HSL value. The default value is `rgb(128, 128, 128)`.",
        )
        .default("rgb(128, 128, 128)")
        .optional(),
    })
    .strict()
    .describe("Colors"),
);

export const rendercv_schema_models_design_classic_theme_Connections_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      phone_number_format: PhoneNumberFormatType.optional(),
      hyperlink: z
        .boolean()
        .describe("Make contact information clickable in the PDF. The default value is `true`.")
        .default(true)
        .optional(),
      show_icons: z
        .boolean()
        .describe("Show icons next to contact information. The default value is `true`.")
        .default(true)
        .optional(),
      display_urls_instead_of_usernames: z
        .boolean()
        .describe("Display full URLs instead of labels. The default value is `false`.")
        .default(false)
        .optional(),
      separator: z
        .string()
        .describe(
          "Character(s) to separate contact items (e.g., '|' or '•'). Leave empty for no separator. The default value is `''`.",
        )
        .default("")
        .optional(),
      space_between_connections: TypstDimension.optional(),
    })
    .strict()
    .describe("Connections"),
);

export const rendercv_schema_models_design_classic_theme_Connections_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      phone_number_format: PhoneNumberFormatType.optional(),
      hyperlink: z
        .boolean()
        .describe("Make contact information clickable in the PDF. The default value is `true`.")
        .default(true)
        .optional(),
      show_icons: z
        .boolean()
        .describe("Show icons next to contact information. The default value is `true`.")
        .default(false)
        .optional(),
      display_urls_instead_of_usernames: z
        .boolean()
        .describe("Display full URLs instead of labels. The default value is `false`.")
        .default(true)
        .optional(),
      separator: z
        .string()
        .describe(
          "Character(s) to separate contact items (e.g., '|' or '•'). Leave empty for no separator. The default value is `''`.",
        )
        .default("|")
        .optional(),
      space_between_connections: TypstDimension.optional(),
    })
    .strict()
    .describe("Connections"),
);

export const rendercv_schema_models_design_classic_theme_Connections_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      phone_number_format: PhoneNumberFormatType.optional(),
      hyperlink: z
        .boolean()
        .describe("Make contact information clickable in the PDF. The default value is `true`.")
        .default(true)
        .optional(),
      show_icons: z
        .boolean()
        .describe("Show icons next to contact information. The default value is `true`.")
        .default(false)
        .optional(),
      display_urls_instead_of_usernames: z
        .boolean()
        .describe("Display full URLs instead of labels. The default value is `false`.")
        .default(true)
        .optional(),
      separator: z
        .string()
        .describe(
          "Character(s) to separate contact items (e.g., '|' or '•'). Leave empty for no separator. The default value is `''`.",
        )
        .default("•")
        .optional(),
      space_between_connections: TypstDimension.optional(),
    })
    .strict()
    .describe("Connections"),
);

export const rendercv_schema_models_design_classic_theme_EducationEntry_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for education entry main column. Available placeholders:\n- `INSTITUTION`: Institution name\n- `AREA`: Field of study/major\n- `DEGREE`: Degree type (e.g., BS, PhD)\n- `DEGREE_WITH_AREA`: Locale-aware phrase combining degree and area (e.g., 'BS in Computer Science')\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**INSTITUTION**, AREA\\nSUMMARY\\nHIGHLIGHTS`.",
        )
        .default("**INSTITUTION**, AREA\nSUMMARY\nHIGHLIGHTS")
        .optional(),
      degree_column: z
        .union([z.string(), z.null()])
        .describe(
          "Optional degree column template. If provided, displays degree in separate column. If `null`, no degree column is shown. Available placeholders:\n- `INSTITUTION`: Institution name\n- `AREA`: Field of study/major\n- `DEGREE`: Degree type (e.g., BS, PhD)\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**DEGREE**`.",
        )
        .default("**DEGREE**")
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for education entry date/location column. Available placeholders:\n- `INSTITUTION`: Institution name\n- `AREA`: Field of study/major\n- `DEGREE`: Degree type (e.g., BS, PhD)\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `LOCATION\\nDATE`.",
        )
        .default("LOCATION\nDATE")
        .optional(),
    })
    .strict()
    .describe("EducationEntry"),
);

export const rendercv_schema_models_design_classic_theme_EducationEntry_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for education entry main column. Available placeholders:\n- `INSTITUTION`: Institution name\n- `AREA`: Field of study/major\n- `DEGREE`: Degree type (e.g., BS, PhD)\n- `DEGREE_WITH_AREA`: Locale-aware phrase combining degree and area (e.g., 'BS in Computer Science')\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**INSTITUTION**, AREA\\nSUMMARY\\nHIGHLIGHTS`.",
        )
        .default("**INSTITUTION**, DEGREE_WITH_AREA -- LOCATION\nSUMMARY\nHIGHLIGHTS")
        .optional(),
      degree_column: z
        .union([z.string(), z.null()])
        .describe(
          "Optional degree column template. If provided, displays degree in separate column. If `null`, no degree column is shown. Available placeholders:\n- `INSTITUTION`: Institution name\n- `AREA`: Field of study/major\n- `DEGREE`: Degree type (e.g., BS, PhD)\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `None`.",
        )
        .default(null)
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for education entry date/location column. Available placeholders:\n- `INSTITUTION`: Institution name\n- `AREA`: Field of study/major\n- `DEGREE`: Degree type (e.g., BS, PhD)\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `LOCATION\\nDATE`.",
        )
        .default("DATE")
        .optional(),
    })
    .strict()
    .describe("EducationEntry"),
);

export const rendercv_schema_models_design_classic_theme_EducationEntry_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for education entry main column. Available placeholders:\n- `INSTITUTION`: Institution name\n- `AREA`: Field of study/major\n- `DEGREE`: Degree type (e.g., BS, PhD)\n- `DEGREE_WITH_AREA`: Locale-aware phrase combining degree and area (e.g., 'BS in Computer Science')\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**INSTITUTION**, AREA\\nSUMMARY\\nHIGHLIGHTS`.",
        )
        .default("**INSTITUTION**, DEGREE_WITH_AREA -- LOCATION\nSUMMARY\nHIGHLIGHTS")
        .optional(),
      degree_column: z
        .union([z.string(), z.null()])
        .describe(
          "Optional degree column template. If provided, displays degree in separate column. If `null`, no degree column is shown. Available placeholders:\n- `INSTITUTION`: Institution name\n- `AREA`: Field of study/major\n- `DEGREE`: Degree type (e.g., BS, PhD)\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `None`.",
        )
        .default(null)
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for education entry date/location column. Available placeholders:\n- `INSTITUTION`: Institution name\n- `AREA`: Field of study/major\n- `DEGREE`: Degree type (e.g., BS, PhD)\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `LOCATION\\nDATE`.",
        )
        .default("DATE")
        .optional(),
    })
    .strict()
    .describe("EducationEntry"),
);

export const rendercv_schema_models_design_classic_theme_EducationEntry_4: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for education entry main column. Available placeholders:\n- `INSTITUTION`: Institution name\n- `AREA`: Field of study/major\n- `DEGREE`: Degree type (e.g., BS, PhD)\n- `DEGREE_WITH_AREA`: Locale-aware phrase combining degree and area (e.g., 'BS in Computer Science')\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**INSTITUTION**, AREA\\nSUMMARY\\nHIGHLIGHTS`.",
        )
        .default("**INSTITUTION**, DEGREE_WITH_AREA -- LOCATION\nSUMMARY\nHIGHLIGHTS")
        .optional(),
      degree_column: z
        .union([z.string(), z.null()])
        .describe(
          "Optional degree column template. If provided, displays degree in separate column. If `null`, no degree column is shown. Available placeholders:\n- `INSTITUTION`: Institution name\n- `AREA`: Field of study/major\n- `DEGREE`: Degree type (e.g., BS, PhD)\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `None`.",
        )
        .default(null)
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for education entry date/location column. Available placeholders:\n- `INSTITUTION`: Institution name\n- `AREA`: Field of study/major\n- `DEGREE`: Degree type (e.g., BS, PhD)\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `LOCATION\\nDATE`.",
        )
        .default("DATE")
        .optional(),
    })
    .strict()
    .describe("EducationEntry"),
);

export const rendercv_schema_models_design_classic_theme_EducationEntry_5: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for education entry main column. Available placeholders:\n- `INSTITUTION`: Institution name\n- `AREA`: Field of study/major\n- `DEGREE`: Degree type (e.g., BS, PhD)\n- `DEGREE_WITH_AREA`: Locale-aware phrase combining degree and area (e.g., 'BS in Computer Science')\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**INSTITUTION**, AREA\\nSUMMARY\\nHIGHLIGHTS`.",
        )
        .default("**INSTITUTION**\n*DEGREE* *in* *AREA*\nSUMMARY\nHIGHLIGHTS")
        .optional(),
      degree_column: z
        .union([z.string(), z.null()])
        .describe(
          "Optional degree column template. If provided, displays degree in separate column. If `null`, no degree column is shown. Available placeholders:\n- `INSTITUTION`: Institution name\n- `AREA`: Field of study/major\n- `DEGREE`: Degree type (e.g., BS, PhD)\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `None`.",
        )
        .default(null)
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for education entry date/location column. Available placeholders:\n- `INSTITUTION`: Institution name\n- `AREA`: Field of study/major\n- `DEGREE`: Degree type (e.g., BS, PhD)\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `LOCATION\\nDATE`.",
        )
        .default("*LOCATION*\n*DATE*")
        .optional(),
    })
    .strict()
    .describe("EducationEntry"),
);

export const rendercv_schema_models_design_classic_theme_Entries_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      date_and_location_width: TypstDimension.optional(),
      side_space: TypstDimension.optional(),
      space_between_columns: TypstDimension.optional(),
      allow_page_break: z
        .boolean()
        .describe(
          "Allow page breaks within entries. If false, entries that don't fit will move to a new page. The default value is `false`.",
        )
        .default(false)
        .optional(),
      short_second_row: z
        .boolean()
        .describe("Shorten the second row to align with the date/location column. The default value is `true`.")
        .default(true)
        .optional(),
      degree_width: TypstDimension.optional(),
      summary: rendercv_schema_models_design_classic_theme_Summary_1.optional(),
      highlights: rendercv_schema_models_design_classic_theme_Highlights_1.optional(),
    })
    .strict()
    .describe("Entries"),
);

export const rendercv_schema_models_design_classic_theme_Entries_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      date_and_location_width: TypstDimension.optional(),
      side_space: TypstDimension.optional(),
      space_between_columns: TypstDimension.optional(),
      allow_page_break: z
        .boolean()
        .describe(
          "Allow page breaks within entries. If false, entries that don't fit will move to a new page. The default value is `false`.",
        )
        .default(false)
        .optional(),
      short_second_row: z
        .boolean()
        .describe("Shorten the second row to align with the date/location column. The default value is `true`.")
        .default(false)
        .optional(),
      degree_width: TypstDimension.optional(),
      summary: rendercv_schema_models_design_classic_theme_Summary_2.optional(),
      highlights: rendercv_schema_models_design_classic_theme_Highlights_2.optional(),
    })
    .strict()
    .describe("Entries"),
);

export const rendercv_schema_models_design_classic_theme_Entries_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      date_and_location_width: TypstDimension.optional(),
      side_space: TypstDimension.optional(),
      space_between_columns: TypstDimension.optional(),
      allow_page_break: z
        .boolean()
        .describe(
          "Allow page breaks within entries. If false, entries that don't fit will move to a new page. The default value is `false`.",
        )
        .default(false)
        .optional(),
      short_second_row: z
        .boolean()
        .describe("Shorten the second row to align with the date/location column. The default value is `true`.")
        .default(false)
        .optional(),
      degree_width: TypstDimension.optional(),
      summary: rendercv_schema_models_design_classic_theme_Summary_3.optional(),
      highlights: rendercv_schema_models_design_classic_theme_Highlights_3.optional(),
    })
    .strict()
    .describe("Entries"),
);

export const rendercv_schema_models_design_classic_theme_Entries_4: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      date_and_location_width: TypstDimension.optional(),
      side_space: TypstDimension.optional(),
      space_between_columns: TypstDimension.optional(),
      allow_page_break: z
        .boolean()
        .describe(
          "Allow page breaks within entries. If false, entries that don't fit will move to a new page. The default value is `false`.",
        )
        .default(false)
        .optional(),
      short_second_row: z
        .boolean()
        .describe("Shorten the second row to align with the date/location column. The default value is `true`.")
        .default(false)
        .optional(),
      degree_width: TypstDimension.optional(),
      summary: rendercv_schema_models_design_classic_theme_Summary_4.optional(),
      highlights: rendercv_schema_models_design_classic_theme_Highlights_4.optional(),
    })
    .strict()
    .describe("Entries"),
);

export const rendercv_schema_models_design_classic_theme_Entries_5: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      date_and_location_width: TypstDimension.optional(),
      side_space: TypstDimension.optional(),
      space_between_columns: TypstDimension.optional(),
      allow_page_break: z
        .boolean()
        .describe(
          "Allow page breaks within entries. If false, entries that don't fit will move to a new page. The default value is `false`.",
        )
        .default(false)
        .optional(),
      short_second_row: z
        .boolean()
        .describe("Shorten the second row to align with the date/location column. The default value is `true`.")
        .default(false)
        .optional(),
      degree_width: TypstDimension.optional(),
      summary: rendercv_schema_models_design_classic_theme_Summary_1.optional(),
      highlights: rendercv_schema_models_design_classic_theme_Highlights_5.optional(),
    })
    .strict()
    .describe("Entries"),
);

export const rendercv_schema_models_design_classic_theme_ExperienceEntry_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for experience entry main column. Available placeholders:\n- `COMPANY`: Company name\n- `POSITION`: Job title/position\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**COMPANY**, POSITION\\nSUMMARY\\nHIGHLIGHTS`.",
        )
        .default("**COMPANY**, POSITION\nSUMMARY\nHIGHLIGHTS")
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for experience entry date/location column. Available placeholders:\n- `COMPANY`: Company name\n- `POSITION`: Job title/position\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `LOCATION\\nDATE`.",
        )
        .default("LOCATION\nDATE")
        .optional(),
    })
    .strict()
    .describe("ExperienceEntry"),
);

export const rendercv_schema_models_design_classic_theme_ExperienceEntry_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for experience entry main column. Available placeholders:\n- `COMPANY`: Company name\n- `POSITION`: Job title/position\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**COMPANY**, POSITION\\nSUMMARY\\nHIGHLIGHTS`.",
        )
        .default("**POSITION**, COMPANY -- LOCATION\nSUMMARY\nHIGHLIGHTS")
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for experience entry date/location column. Available placeholders:\n- `COMPANY`: Company name\n- `POSITION`: Job title/position\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `LOCATION\\nDATE`.",
        )
        .default("DATE")
        .optional(),
    })
    .strict()
    .describe("ExperienceEntry"),
);

export const rendercv_schema_models_design_classic_theme_ExperienceEntry_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for experience entry main column. Available placeholders:\n- `COMPANY`: Company name\n- `POSITION`: Job title/position\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**COMPANY**, POSITION\\nSUMMARY\\nHIGHLIGHTS`.",
        )
        .default("**POSITION**, COMPANY -- LOCATION\nSUMMARY\nHIGHLIGHTS")
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for experience entry date/location column. Available placeholders:\n- `COMPANY`: Company name\n- `POSITION`: Job title/position\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `LOCATION\\nDATE`.",
        )
        .default("DATE")
        .optional(),
    })
    .strict()
    .describe("ExperienceEntry"),
);

export const rendercv_schema_models_design_classic_theme_ExperienceEntry_4: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for experience entry main column. Available placeholders:\n- `COMPANY`: Company name\n- `POSITION`: Job title/position\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**COMPANY**, POSITION\\nSUMMARY\\nHIGHLIGHTS`.",
        )
        .default("**POSITION**, COMPANY -- LOCATION\nSUMMARY\nHIGHLIGHTS")
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for experience entry date/location column. Available placeholders:\n- `COMPANY`: Company name\n- `POSITION`: Job title/position\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `LOCATION\\nDATE`.",
        )
        .default("DATE")
        .optional(),
    })
    .strict()
    .describe("ExperienceEntry"),
);

export const rendercv_schema_models_design_classic_theme_ExperienceEntry_5: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for experience entry main column. Available placeholders:\n- `COMPANY`: Company name\n- `POSITION`: Job title/position\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**COMPANY**, POSITION\\nSUMMARY\\nHIGHLIGHTS`.",
        )
        .default("**POSITION**\n*COMPANY*\nSUMMARY\nHIGHLIGHTS")
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for experience entry date/location column. Available placeholders:\n- `COMPANY`: Company name\n- `POSITION`: Job title/position\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `LOCATION\\nDATE`.",
        )
        .default("*LOCATION*\n*DATE*")
        .optional(),
    })
    .strict()
    .describe("ExperienceEntry"),
);

export const rendercv_schema_models_design_classic_theme_FontFamily: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      body: rendercv_schema_models_design_font_family_FontFamily.optional(),
      name: rendercv_schema_models_design_font_family_FontFamily.optional(),
      headline: rendercv_schema_models_design_font_family_FontFamily.optional(),
      connections: rendercv_schema_models_design_font_family_FontFamily.optional(),
      section_titles: rendercv_schema_models_design_font_family_FontFamily.optional(),
    })
    .strict()
    .describe("FontFamily"),
);

export const rendercv_schema_models_design_classic_theme_FontSize_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      body: TypstDimension.optional(),
      name: TypstDimension.optional(),
      headline: TypstDimension.optional(),
      connections: TypstDimension.optional(),
      section_titles: TypstDimension.optional(),
    })
    .strict()
    .describe("FontSize"),
);

export const rendercv_schema_models_design_classic_theme_FontSize_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      body: TypstDimension.optional(),
      name: TypstDimension.optional(),
      headline: TypstDimension.optional(),
      connections: TypstDimension.optional(),
      section_titles: TypstDimension.optional(),
    })
    .strict()
    .describe("FontSize"),
);

export const rendercv_schema_models_design_classic_theme_FontSize_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      body: TypstDimension.optional(),
      name: TypstDimension.optional(),
      headline: TypstDimension.optional(),
      connections: TypstDimension.optional(),
      section_titles: TypstDimension.optional(),
    })
    .strict()
    .describe("FontSize"),
);

export const rendercv_schema_models_design_classic_theme_Header_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      alignment: Alignment.optional(),
      photo_width: TypstDimension.optional(),
      photo_position: z
        .enum(["left", "right"] as const)
        .describe("Photo position (left or right). The default value is `left`.")
        .default("left")
        .optional(),
      photo_space_left: TypstDimension.optional(),
      photo_space_right: TypstDimension.optional(),
      space_below_name: TypstDimension.optional(),
      space_below_headline: TypstDimension.optional(),
      space_below_connections: TypstDimension.optional(),
      connections: rendercv_schema_models_design_classic_theme_Connections_1.optional(),
    })
    .strict()
    .describe("Header"),
);

export const rendercv_schema_models_design_classic_theme_Header_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      alignment: Alignment.optional(),
      photo_width: TypstDimension.optional(),
      photo_position: z
        .enum(["left", "right"] as const)
        .describe("Photo position (left or right). The default value is `left`.")
        .default("left")
        .optional(),
      photo_space_left: TypstDimension.optional(),
      photo_space_right: TypstDimension.optional(),
      space_below_name: TypstDimension.optional(),
      space_below_headline: TypstDimension.optional(),
      space_below_connections: TypstDimension.optional(),
      connections: rendercv_schema_models_design_classic_theme_Connections_1.optional(),
    })
    .strict()
    .describe("Header"),
);

export const rendercv_schema_models_design_classic_theme_Header_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      alignment: Alignment.optional(),
      photo_width: TypstDimension.optional(),
      photo_position: z
        .enum(["left", "right"] as const)
        .describe("Photo position (left or right). The default value is `left`.")
        .default("left")
        .optional(),
      photo_space_left: TypstDimension.optional(),
      photo_space_right: TypstDimension.optional(),
      space_below_name: TypstDimension.optional(),
      space_below_headline: TypstDimension.optional(),
      space_below_connections: TypstDimension.optional(),
      connections: rendercv_schema_models_design_classic_theme_Connections_2.optional(),
    })
    .strict()
    .describe("Header"),
);

export const rendercv_schema_models_design_classic_theme_Header_4: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      alignment: Alignment.optional(),
      photo_width: TypstDimension.optional(),
      photo_position: z
        .enum(["left", "right"] as const)
        .describe("Photo position (left or right). The default value is `left`.")
        .default("left")
        .optional(),
      photo_space_left: TypstDimension.optional(),
      photo_space_right: TypstDimension.optional(),
      space_below_name: TypstDimension.optional(),
      space_below_headline: TypstDimension.optional(),
      space_below_connections: TypstDimension.optional(),
      connections: rendercv_schema_models_design_classic_theme_Connections_1.optional(),
    })
    .strict()
    .describe("Header"),
);

export const rendercv_schema_models_design_classic_theme_Header_5: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      alignment: Alignment.optional(),
      photo_width: TypstDimension.optional(),
      photo_position: z
        .enum(["left", "right"] as const)
        .describe("Photo position (left or right). The default value is `left`.")
        .default("left")
        .optional(),
      photo_space_left: TypstDimension.optional(),
      photo_space_right: TypstDimension.optional(),
      space_below_name: TypstDimension.optional(),
      space_below_headline: TypstDimension.optional(),
      space_below_connections: TypstDimension.optional(),
      connections: rendercv_schema_models_design_classic_theme_Connections_3.optional(),
    })
    .strict()
    .describe("Header"),
);

export const rendercv_schema_models_design_classic_theme_Highlights_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      bullet: Bullet.optional(),
      nested_bullet: Bullet.optional(),
      space_left: TypstDimension.optional(),
      space_above: TypstDimension.optional(),
      space_between_items: TypstDimension.optional(),
      space_between_bullet_and_text: TypstDimension.optional(),
    })
    .strict()
    .describe("Highlights"),
);

export const rendercv_schema_models_design_classic_theme_Highlights_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      bullet: Bullet.optional(),
      nested_bullet: Bullet.optional(),
      space_left: TypstDimension.optional(),
      space_above: TypstDimension.optional(),
      space_between_items: TypstDimension.optional(),
      space_between_bullet_and_text: TypstDimension.optional(),
    })
    .strict()
    .describe("Highlights"),
);

export const rendercv_schema_models_design_classic_theme_Highlights_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      bullet: Bullet.optional(),
      nested_bullet: Bullet.optional(),
      space_left: TypstDimension.optional(),
      space_above: TypstDimension.optional(),
      space_between_items: TypstDimension.optional(),
      space_between_bullet_and_text: TypstDimension.optional(),
    })
    .strict()
    .describe("Highlights"),
);

export const rendercv_schema_models_design_classic_theme_Highlights_4: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      bullet: Bullet.optional(),
      nested_bullet: Bullet.optional(),
      space_left: TypstDimension.optional(),
      space_above: TypstDimension.optional(),
      space_between_items: TypstDimension.optional(),
      space_between_bullet_and_text: TypstDimension.optional(),
    })
    .strict()
    .describe("Highlights"),
);

export const rendercv_schema_models_design_classic_theme_Highlights_5: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      bullet: Bullet.optional(),
      nested_bullet: Bullet.optional(),
      space_left: TypstDimension.optional(),
      space_above: TypstDimension.optional(),
      space_between_items: TypstDimension.optional(),
      space_between_bullet_and_text: TypstDimension.optional(),
    })
    .strict()
    .describe("Highlights"),
);

export const rendercv_schema_models_design_classic_theme_Links_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      underline: z.boolean().describe("Underline hyperlinks. The default value is `false`.").default(false).optional(),
      show_external_link_icon: z
        .boolean()
        .describe("Show an external link icon next to URLs. The default value is `false`.")
        .default(false)
        .optional(),
    })
    .strict()
    .describe("Links"),
);

export const rendercv_schema_models_design_classic_theme_Links_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      underline: z.boolean().describe("Underline hyperlinks. The default value is `false`.").default(false).optional(),
      show_external_link_icon: z
        .boolean()
        .describe("Show an external link icon next to URLs. The default value is `false`.")
        .default(false)
        .optional(),
    })
    .strict()
    .describe("Links"),
);

export const rendercv_schema_models_design_classic_theme_Links_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      underline: z.boolean().describe("Underline hyperlinks. The default value is `false`.").default(true).optional(),
      show_external_link_icon: z
        .boolean()
        .describe("Show an external link icon next to URLs. The default value is `false`.")
        .default(false)
        .optional(),
    })
    .strict()
    .describe("Links"),
);

export const rendercv_schema_models_design_classic_theme_Links_4: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      underline: z.boolean().describe("Underline hyperlinks. The default value is `false`.").default(true).optional(),
      show_external_link_icon: z
        .boolean()
        .describe("Show an external link icon next to URLs. The default value is `false`.")
        .default(false)
        .optional(),
    })
    .strict()
    .describe("Links"),
);

export const rendercv_schema_models_design_classic_theme_Links_5: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      underline: z.boolean().describe("Underline hyperlinks. The default value is `false`.").default(true).optional(),
      show_external_link_icon: z
        .boolean()
        .describe("Show an external link icon next to URLs. The default value is `false`.")
        .default(false)
        .optional(),
    })
    .strict()
    .describe("Links"),
);

export const rendercv_schema_models_design_classic_theme_NormalEntry_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for normal entry main column. Available placeholders:\n- `NAME`: Entry name/title\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**NAME**\\nSUMMARY\\nHIGHLIGHTS`.",
        )
        .default("**NAME**\nSUMMARY\nHIGHLIGHTS")
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for normal entry date/location column. Available placeholders:\n- `NAME`: Entry name/title\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `LOCATION\\nDATE`.",
        )
        .default("LOCATION\nDATE")
        .optional(),
    })
    .strict()
    .describe("NormalEntry"),
);

export const rendercv_schema_models_design_classic_theme_NormalEntry_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for normal entry main column. Available placeholders:\n- `NAME`: Entry name/title\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**NAME**\\nSUMMARY\\nHIGHLIGHTS`.",
        )
        .default("**NAME** -- **LOCATION**\nSUMMARY\nHIGHLIGHTS")
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for normal entry date/location column. Available placeholders:\n- `NAME`: Entry name/title\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `LOCATION\\nDATE`.",
        )
        .default("DATE")
        .optional(),
    })
    .strict()
    .describe("NormalEntry"),
);

export const rendercv_schema_models_design_classic_theme_NormalEntry_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for normal entry main column. Available placeholders:\n- `NAME`: Entry name/title\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**NAME**\\nSUMMARY\\nHIGHLIGHTS`.",
        )
        .default("**NAME** -- **LOCATION**\nSUMMARY\nHIGHLIGHTS")
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for normal entry date/location column. Available placeholders:\n- `NAME`: Entry name/title\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `LOCATION\\nDATE`.",
        )
        .default("DATE")
        .optional(),
    })
    .strict()
    .describe("NormalEntry"),
);

export const rendercv_schema_models_design_classic_theme_NormalEntry_4: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for normal entry main column. Available placeholders:\n- `NAME`: Entry name/title\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**NAME**\\nSUMMARY\\nHIGHLIGHTS`.",
        )
        .default("**NAME** -- **LOCATION**\nSUMMARY\nHIGHLIGHTS")
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for normal entry date/location column. Available placeholders:\n- `NAME`: Entry name/title\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `LOCATION\\nDATE`.",
        )
        .default("DATE")
        .optional(),
    })
    .strict()
    .describe("NormalEntry"),
);

export const rendercv_schema_models_design_classic_theme_NormalEntry_5: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for normal entry main column. Available placeholders:\n- `NAME`: Entry name/title\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**NAME**\\nSUMMARY\\nHIGHLIGHTS`.",
        )
        .default("**NAME**\nSUMMARY\nHIGHLIGHTS")
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for normal entry date/location column. Available placeholders:\n- `NAME`: Entry name/title\n- `SUMMARY`: Summary text\n- `HIGHLIGHTS`: Bullet points list\n- `LOCATION`: Location text\n- `DATE`: Formatted date or date range\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `LOCATION\\nDATE`.",
        )
        .default("*LOCATION*\n*DATE*")
        .optional(),
    })
    .strict()
    .describe("NormalEntry"),
);

export const rendercv_schema_models_design_classic_theme_OneLineEntry: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          'Template for one-line entries. Available placeholders:\n- `LABEL`: The label text (e.g., "Languages", "Citizenship")\n- `DETAILS`: The details text (e.g., "English (native), Spanish (fluent)")\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**LABEL:** DETAILS`.',
        )
        .default("**LABEL:** DETAILS")
        .optional(),
    })
    .strict()
    .describe("OneLineEntry"),
);

export const rendercv_schema_models_design_classic_theme_Page_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      size: PageSize.optional(),
      top_margin: TypstDimension.optional(),
      bottom_margin: TypstDimension.optional(),
      left_margin: TypstDimension.optional(),
      right_margin: TypstDimension.optional(),
      show_footer: z
        .boolean()
        .describe("Show the footer at the bottom of pages. The default value is `true`.")
        .default(true)
        .optional(),
      show_top_note: z
        .boolean()
        .describe("Show the top note at the top of the first page. The default value is `true`.")
        .default(true)
        .optional(),
    })
    .strict()
    .describe("Page"),
);

export const rendercv_schema_models_design_classic_theme_Page_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      size: PageSize.optional(),
      top_margin: TypstDimension.optional(),
      bottom_margin: TypstDimension.optional(),
      left_margin: TypstDimension.optional(),
      right_margin: TypstDimension.optional(),
      show_footer: z
        .boolean()
        .describe("Show the footer at the bottom of pages. The default value is `true`.")
        .default(false)
        .optional(),
      show_top_note: z
        .boolean()
        .describe("Show the top note at the top of the first page. The default value is `true`.")
        .default(true)
        .optional(),
    })
    .strict()
    .describe("Page"),
);

export const rendercv_schema_models_design_classic_theme_PublicationEntry: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      main_column: z
        .string()
        .describe(
          "Template for publication entry main column. Available placeholders:\n- `TITLE`: Publication title\n- `AUTHORS`: List of authors (formatted as comma-separated string)\n- `SUMMARY`: Summary/abstract text\n- `DOI`: Digital Object Identifier\n- `URL`: Publication URL (if DOI not provided)\n- `JOURNAL`: Journal/conference/venue name\n- `DATE`: Formatted date\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `**TITLE**\\nSUMMARY\\nAUTHORS\\nURL (JOURNAL)`.",
        )
        .default("**TITLE**\nSUMMARY\nAUTHORS\nURL (JOURNAL)")
        .optional(),
      date_and_location_column: z
        .string()
        .describe(
          "Template for publication entry date column. Available placeholders:\n- `TITLE`: Publication title\n- `AUTHORS`: List of authors (formatted as comma-separated string)\n- `SUMMARY`: Summary/abstract text\n- `DOI`: Digital Object Identifier\n- `URL`: Publication URL (if DOI not provided)\n- `JOURNAL`: Journal/conference/venue name\n- `DATE`: Formatted date\n\nYou can also add arbitrary keys to entries and use them as UPPERCASE placeholders.\n\nThe default value is `DATE`.",
        )
        .default("DATE")
        .optional(),
    })
    .strict()
    .describe("PublicationEntry"),
);

export const rendercv_schema_models_design_classic_theme_SectionTitles_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      type: SectionTitleType.optional(),
      line_thickness: TypstDimension.optional(),
      space_above: TypstDimension.optional(),
      space_below: TypstDimension.optional(),
    })
    .strict()
    .describe("SectionTitles"),
);

export const rendercv_schema_models_design_classic_theme_SectionTitles_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      type: SectionTitleType.optional(),
      line_thickness: TypstDimension.optional(),
      space_above: TypstDimension.optional(),
      space_below: TypstDimension.optional(),
    })
    .strict()
    .describe("SectionTitles"),
);

export const rendercv_schema_models_design_classic_theme_SectionTitles_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      type: SectionTitleType.optional(),
      line_thickness: TypstDimension.optional(),
      space_above: TypstDimension.optional(),
      space_below: TypstDimension.optional(),
    })
    .strict()
    .describe("SectionTitles"),
);

export const rendercv_schema_models_design_classic_theme_SectionTitles_4: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      type: SectionTitleType.optional(),
      line_thickness: TypstDimension.optional(),
      space_above: TypstDimension.optional(),
      space_below: TypstDimension.optional(),
    })
    .strict()
    .describe("SectionTitles"),
);

export const rendercv_schema_models_design_classic_theme_SectionTitles_5: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      type: SectionTitleType.optional(),
      line_thickness: TypstDimension.optional(),
      space_above: TypstDimension.optional(),
      space_below: TypstDimension.optional(),
    })
    .strict()
    .describe("SectionTitles"),
);

export const rendercv_schema_models_design_classic_theme_Sections_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      allow_page_break: z
        .boolean()
        .describe(
          "Allow page breaks within sections. If false, sections that don't fit will start on a new page. The default value is `true`.",
        )
        .default(true)
        .optional(),
      space_between_regular_entries: TypstDimension.optional(),
      space_between_text_based_entries: TypstDimension.optional(),
      show_time_spans_in: z
        .array(z.string())
        .describe(
          "Section titles where time spans (e.g., '2 years 3 months') should be displayed. The default value is `['experience']`.",
        )
        .default(["experience"])
        .optional(),
    })
    .strict()
    .describe("Sections"),
);

export const rendercv_schema_models_design_classic_theme_Sections_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      allow_page_break: z
        .boolean()
        .describe(
          "Allow page breaks within sections. If false, sections that don't fit will start on a new page. The default value is `true`.",
        )
        .default(true)
        .optional(),
      space_between_regular_entries: TypstDimension.optional(),
      space_between_text_based_entries: TypstDimension.optional(),
      show_time_spans_in: z
        .array(z.string())
        .describe(
          "Section titles where time spans (e.g., '2 years 3 months') should be displayed. The default value is `[]`.",
        )
        .default([])
        .optional(),
    })
    .strict()
    .describe("Sections"),
);

export const rendercv_schema_models_design_classic_theme_Sections_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      allow_page_break: z
        .boolean()
        .describe(
          "Allow page breaks within sections. If false, sections that don't fit will start on a new page. The default value is `true`.",
        )
        .default(true)
        .optional(),
      space_between_regular_entries: TypstDimension.optional(),
      space_between_text_based_entries: TypstDimension.optional(),
      show_time_spans_in: z
        .array(z.string())
        .describe(
          "Section titles where time spans (e.g., '2 years 3 months') should be displayed. The default value is `[]`.",
        )
        .default([])
        .optional(),
    })
    .strict()
    .describe("Sections"),
);

export const rendercv_schema_models_design_classic_theme_Sections_4: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      allow_page_break: z
        .boolean()
        .describe(
          "Allow page breaks within sections. If false, sections that don't fit will start on a new page. The default value is `true`.",
        )
        .default(true)
        .optional(),
      space_between_regular_entries: TypstDimension.optional(),
      space_between_text_based_entries: TypstDimension.optional(),
      show_time_spans_in: z
        .array(z.string())
        .describe(
          "Section titles where time spans (e.g., '2 years 3 months') should be displayed. The default value is `[]`.",
        )
        .default([])
        .optional(),
    })
    .strict()
    .describe("Sections"),
);

export const rendercv_schema_models_design_classic_theme_Sections_5: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      allow_page_break: z
        .boolean()
        .describe(
          "Allow page breaks within sections. If false, sections that don't fit will start on a new page. The default value is `true`.",
        )
        .default(true)
        .optional(),
      space_between_regular_entries: TypstDimension.optional(),
      space_between_text_based_entries: TypstDimension.optional(),
      show_time_spans_in: z
        .array(z.string())
        .describe(
          "Section titles where time spans (e.g., '2 years 3 months') should be displayed. The default value is `[]`.",
        )
        .default([])
        .optional(),
    })
    .strict()
    .describe("Sections"),
);

export const rendercv_schema_models_design_classic_theme_Summary_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      space_above: TypstDimension.optional(),
      space_left: TypstDimension.optional(),
    })
    .strict()
    .describe("Summary"),
);

export const rendercv_schema_models_design_classic_theme_Summary_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      space_above: TypstDimension.optional(),
      space_left: TypstDimension.optional(),
    })
    .strict()
    .describe("Summary"),
);

export const rendercv_schema_models_design_classic_theme_Summary_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      space_above: TypstDimension.optional(),
      space_left: TypstDimension.optional(),
    })
    .strict()
    .describe("Summary"),
);

export const rendercv_schema_models_design_classic_theme_Summary_4: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      space_above: TypstDimension.optional(),
      space_left: TypstDimension.optional(),
    })
    .strict()
    .describe("Summary"),
);

export const rendercv_schema_models_design_classic_theme_Templates_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      footer: z
        .string()
        .describe(
          "Template for the footer. Available placeholders:\n- `NAME`: The CV owner's name from `cv.name`\n- `PAGE_NUMBER`: Current page number\n- `TOTAL_PAGES`: Total number of pages\n- `CURRENT_DATE`: Formatted date based on `design.templates.single_date`\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `*NAME -- PAGE_NUMBER/TOTAL_PAGES*`.",
        )
        .default("*NAME -- PAGE_NUMBER/TOTAL_PAGES*")
        .optional(),
      top_note: z
        .string()
        .describe(
          'Template for the top note. Available placeholders:\n- `LAST_UPDATED`: Localized "last updated" text from `locale.last_updated`\n- `CURRENT_DATE`: Formatted date based on `design.templates.single_date`\n- `NAME`: The CV owner\'s name from `cv.name`\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `*LAST_UPDATED CURRENT_DATE*`.',
        )
        .default("*LAST_UPDATED CURRENT_DATE*")
        .optional(),
      single_date: z
        .string()
        .describe(
          "Template for single dates. Available placeholders:\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `MONTH_ABBREVIATION YEAR`.",
        )
        .default("MONTH_ABBREVIATION YEAR")
        .optional(),
      date_range: z
        .string()
        .describe(
          'Template for date ranges. Available placeholders:\n- `START_DATE`: Formatted start date based on `design.templates.single_date`\n- `END_DATE`: Formatted end date based on `design.templates.single_date` (or "present"/"ongoing" for current positions)\n\nThe default value is `START_DATE – END_DATE`.',
        )
        .default("START_DATE – END_DATE")
        .optional(),
      time_span: z
        .string()
        .describe(
          'Template for time spans (duration calculations). Available placeholders:\n- `HOW_MANY_YEARS`: Number of years (e.g., 2)\n- `YEARS`: Localized word for "years" from `locale.years` (or singular "year")\n- `HOW_MANY_MONTHS`: Number of months (e.g., 3)\n- `MONTHS`: Localized word for "months" from `locale.months` (or singular "month")\n\nThe default value is `HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS`.',
        )
        .default("HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS")
        .optional(),
      one_line_entry: rendercv_schema_models_design_classic_theme_OneLineEntry.optional(),
      education_entry: rendercv_schema_models_design_classic_theme_EducationEntry_1.optional(),
      normal_entry: rendercv_schema_models_design_classic_theme_NormalEntry_1.optional(),
      experience_entry: rendercv_schema_models_design_classic_theme_ExperienceEntry_1.optional(),
      publication_entry: rendercv_schema_models_design_classic_theme_PublicationEntry.optional(),
    })
    .strict()
    .describe("Templates"),
);

export const rendercv_schema_models_design_classic_theme_Templates_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      footer: z
        .string()
        .describe(
          "Template for the footer. Available placeholders:\n- `NAME`: The CV owner's name from `cv.name`\n- `PAGE_NUMBER`: Current page number\n- `TOTAL_PAGES`: Total number of pages\n- `CURRENT_DATE`: Formatted date based on `design.templates.single_date`\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `*NAME -- PAGE_NUMBER/TOTAL_PAGES*`.",
        )
        .default("*NAME -- PAGE_NUMBER/TOTAL_PAGES*")
        .optional(),
      top_note: z
        .string()
        .describe(
          'Template for the top note. Available placeholders:\n- `LAST_UPDATED`: Localized "last updated" text from `locale.last_updated`\n- `CURRENT_DATE`: Formatted date based on `design.templates.single_date`\n- `NAME`: The CV owner\'s name from `cv.name`\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `*LAST_UPDATED CURRENT_DATE*`.',
        )
        .default("*LAST_UPDATED CURRENT_DATE*")
        .optional(),
      single_date: z
        .string()
        .describe(
          "Template for single dates. Available placeholders:\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `MONTH_ABBREVIATION YEAR`.",
        )
        .default("MONTH_ABBREVIATION YEAR")
        .optional(),
      date_range: z
        .string()
        .describe(
          'Template for date ranges. Available placeholders:\n- `START_DATE`: Formatted start date based on `design.templates.single_date`\n- `END_DATE`: Formatted end date based on `design.templates.single_date` (or "present"/"ongoing" for current positions)\n\nThe default value is `START_DATE – END_DATE`.',
        )
        .default("START_DATE – END_DATE")
        .optional(),
      time_span: z
        .string()
        .describe(
          'Template for time spans (duration calculations). Available placeholders:\n- `HOW_MANY_YEARS`: Number of years (e.g., 2)\n- `YEARS`: Localized word for "years" from `locale.years` (or singular "year")\n- `HOW_MANY_MONTHS`: Number of months (e.g., 3)\n- `MONTHS`: Localized word for "months" from `locale.months` (or singular "month")\n\nThe default value is `HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS`.',
        )
        .default("HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS")
        .optional(),
      one_line_entry: rendercv_schema_models_design_classic_theme_OneLineEntry.optional(),
      education_entry: rendercv_schema_models_design_classic_theme_EducationEntry_2.optional(),
      normal_entry: rendercv_schema_models_design_classic_theme_NormalEntry_2.optional(),
      experience_entry: rendercv_schema_models_design_classic_theme_ExperienceEntry_2.optional(),
      publication_entry: rendercv_schema_models_design_classic_theme_PublicationEntry.optional(),
    })
    .strict()
    .describe("Templates"),
);

export const rendercv_schema_models_design_classic_theme_Templates_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      footer: z
        .string()
        .describe(
          "Template for the footer. Available placeholders:\n- `NAME`: The CV owner's name from `cv.name`\n- `PAGE_NUMBER`: Current page number\n- `TOTAL_PAGES`: Total number of pages\n- `CURRENT_DATE`: Formatted date based on `design.templates.single_date`\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `*NAME -- PAGE_NUMBER/TOTAL_PAGES*`.",
        )
        .default("*NAME -- PAGE_NUMBER/TOTAL_PAGES*")
        .optional(),
      top_note: z
        .string()
        .describe(
          'Template for the top note. Available placeholders:\n- `LAST_UPDATED`: Localized "last updated" text from `locale.last_updated`\n- `CURRENT_DATE`: Formatted date based on `design.templates.single_date`\n- `NAME`: The CV owner\'s name from `cv.name`\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `*LAST_UPDATED CURRENT_DATE*`.',
        )
        .default("*LAST_UPDATED CURRENT_DATE*")
        .optional(),
      single_date: z
        .string()
        .describe(
          "Template for single dates. Available placeholders:\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `MONTH_ABBREVIATION YEAR`.",
        )
        .default("MONTH_ABBREVIATION YEAR")
        .optional(),
      date_range: z
        .string()
        .describe(
          'Template for date ranges. Available placeholders:\n- `START_DATE`: Formatted start date based on `design.templates.single_date`\n- `END_DATE`: Formatted end date based on `design.templates.single_date` (or "present"/"ongoing" for current positions)\n\nThe default value is `START_DATE – END_DATE`.',
        )
        .default("START_DATE – END_DATE")
        .optional(),
      time_span: z
        .string()
        .describe(
          'Template for time spans (duration calculations). Available placeholders:\n- `HOW_MANY_YEARS`: Number of years (e.g., 2)\n- `YEARS`: Localized word for "years" from `locale.years` (or singular "year")\n- `HOW_MANY_MONTHS`: Number of months (e.g., 3)\n- `MONTHS`: Localized word for "months" from `locale.months` (or singular "month")\n\nThe default value is `HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS`.',
        )
        .default("HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS")
        .optional(),
      one_line_entry: rendercv_schema_models_design_classic_theme_OneLineEntry.optional(),
      education_entry: rendercv_schema_models_design_classic_theme_EducationEntry_3.optional(),
      normal_entry: rendercv_schema_models_design_classic_theme_NormalEntry_3.optional(),
      experience_entry: rendercv_schema_models_design_classic_theme_ExperienceEntry_3.optional(),
      publication_entry: rendercv_schema_models_design_classic_theme_PublicationEntry.optional(),
    })
    .strict()
    .describe("Templates"),
);

export const rendercv_schema_models_design_classic_theme_Templates_4: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      footer: z
        .string()
        .describe(
          "Template for the footer. Available placeholders:\n- `NAME`: The CV owner's name from `cv.name`\n- `PAGE_NUMBER`: Current page number\n- `TOTAL_PAGES`: Total number of pages\n- `CURRENT_DATE`: Formatted date based on `design.templates.single_date`\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `*NAME -- PAGE_NUMBER/TOTAL_PAGES*`.",
        )
        .default("*NAME -- PAGE_NUMBER/TOTAL_PAGES*")
        .optional(),
      top_note: z
        .string()
        .describe(
          'Template for the top note. Available placeholders:\n- `LAST_UPDATED`: Localized "last updated" text from `locale.last_updated`\n- `CURRENT_DATE`: Formatted date based on `design.templates.single_date`\n- `NAME`: The CV owner\'s name from `cv.name`\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `*LAST_UPDATED CURRENT_DATE*`.',
        )
        .default("*LAST_UPDATED CURRENT_DATE*")
        .optional(),
      single_date: z
        .string()
        .describe(
          "Template for single dates. Available placeholders:\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `MONTH_ABBREVIATION YEAR`.",
        )
        .default("MONTH_ABBREVIATION YEAR")
        .optional(),
      date_range: z
        .string()
        .describe(
          'Template for date ranges. Available placeholders:\n- `START_DATE`: Formatted start date based on `design.templates.single_date`\n- `END_DATE`: Formatted end date based on `design.templates.single_date` (or "present"/"ongoing" for current positions)\n\nThe default value is `START_DATE – END_DATE`.',
        )
        .default("START_DATE – END_DATE")
        .optional(),
      time_span: z
        .string()
        .describe(
          'Template for time spans (duration calculations). Available placeholders:\n- `HOW_MANY_YEARS`: Number of years (e.g., 2)\n- `YEARS`: Localized word for "years" from `locale.years` (or singular "year")\n- `HOW_MANY_MONTHS`: Number of months (e.g., 3)\n- `MONTHS`: Localized word for "months" from `locale.months` (or singular "month")\n\nThe default value is `HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS`.',
        )
        .default("HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS")
        .optional(),
      one_line_entry: rendercv_schema_models_design_classic_theme_OneLineEntry.optional(),
      education_entry: rendercv_schema_models_design_classic_theme_EducationEntry_4.optional(),
      normal_entry: rendercv_schema_models_design_classic_theme_NormalEntry_4.optional(),
      experience_entry: rendercv_schema_models_design_classic_theme_ExperienceEntry_4.optional(),
      publication_entry: rendercv_schema_models_design_classic_theme_PublicationEntry.optional(),
    })
    .strict()
    .describe("Templates"),
);

export const rendercv_schema_models_design_classic_theme_Templates_5: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      footer: z
        .string()
        .describe(
          "Template for the footer. Available placeholders:\n- `NAME`: The CV owner's name from `cv.name`\n- `PAGE_NUMBER`: Current page number\n- `TOTAL_PAGES`: Total number of pages\n- `CURRENT_DATE`: Formatted date based on `design.templates.single_date`\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `*NAME -- PAGE_NUMBER/TOTAL_PAGES*`.",
        )
        .default("*NAME -- PAGE_NUMBER/TOTAL_PAGES*")
        .optional(),
      top_note: z
        .string()
        .describe(
          'Template for the top note. Available placeholders:\n- `LAST_UPDATED`: Localized "last updated" text from `locale.last_updated`\n- `CURRENT_DATE`: Formatted date based on `design.templates.single_date`\n- `NAME`: The CV owner\'s name from `cv.name`\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `*LAST_UPDATED CURRENT_DATE*`.',
        )
        .default("*LAST_UPDATED CURRENT_DATE*")
        .optional(),
      single_date: z
        .string()
        .describe(
          "Template for single dates. Available placeholders:\n- `MONTH_NAME`: Full month name (e.g., January)\n- `MONTH_ABBREVIATION`: Abbreviated month name (e.g., Jan)\n- `MONTH`: Month number (e.g., 1)\n- `MONTH_IN_TWO_DIGITS`: Zero-padded month (e.g., 01)\n- `DAY`: Day of the month (e.g., 5)\n- `DAY_IN_TWO_DIGITS`: Zero-padded day (e.g., 05)\n- `YEAR`: Full year (e.g., 2025)\n- `YEAR_IN_TWO_DIGITS`: Two-digit year (e.g., 25)\n\nThe default value is `MONTH_ABBREVIATION YEAR`.",
        )
        .default("MONTH_ABBREVIATION YEAR")
        .optional(),
      date_range: z
        .string()
        .describe(
          'Template for date ranges. Available placeholders:\n- `START_DATE`: Formatted start date based on `design.templates.single_date`\n- `END_DATE`: Formatted end date based on `design.templates.single_date` (or "present"/"ongoing" for current positions)\n\nThe default value is `START_DATE – END_DATE`.',
        )
        .default("START_DATE – END_DATE")
        .optional(),
      time_span: z
        .string()
        .describe(
          'Template for time spans (duration calculations). Available placeholders:\n- `HOW_MANY_YEARS`: Number of years (e.g., 2)\n- `YEARS`: Localized word for "years" from `locale.years` (or singular "year")\n- `HOW_MANY_MONTHS`: Number of months (e.g., 3)\n- `MONTHS`: Localized word for "months" from `locale.months` (or singular "month")\n\nThe default value is `HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS`.',
        )
        .default("HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS")
        .optional(),
      one_line_entry: rendercv_schema_models_design_classic_theme_OneLineEntry.optional(),
      education_entry: rendercv_schema_models_design_classic_theme_EducationEntry_5.optional(),
      normal_entry: rendercv_schema_models_design_classic_theme_NormalEntry_5.optional(),
      experience_entry: rendercv_schema_models_design_classic_theme_ExperienceEntry_5.optional(),
      publication_entry: rendercv_schema_models_design_classic_theme_PublicationEntry.optional(),
    })
    .strict()
    .describe("Templates"),
);

export const rendercv_schema_models_design_classic_theme_Typography_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      line_spacing: TypstDimension.optional(),
      alignment: z
        .enum(["left", "justified", "justified-with-no-hyphenation"] as const)
        .describe(
          "Text alignment. Options: 'left', 'justified' (spreads text across full width), 'justified-with-no-hyphenation' (justified without word breaks). The default value is `justified`.",
        )
        .default("justified")
        .optional(),
      date_and_location_column_alignment: Alignment.optional(),
      font_family: z
        .union([
          rendercv_schema_models_design_classic_theme_FontFamily,
          rendercv_schema_models_design_font_family_FontFamily,
        ])
        .describe(
          "The font family. You can provide a single font name as a string (applies to all elements), or a dictionary with keys 'body', 'name', 'headline', 'connections', and 'section_titles' to customize each element. Any system font can be used.",
        )
        .optional(),
      font_size: rendercv_schema_models_design_classic_theme_FontSize_1.optional(),
      small_caps: SmallCaps.optional(),
      bold: rendercv_schema_models_design_classic_theme_Bold_1.optional(),
    })
    .strict()
    .describe("Typography"),
);

export const rendercv_schema_models_design_classic_theme_Typography_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      line_spacing: TypstDimension.optional(),
      alignment: z
        .enum(["left", "justified", "justified-with-no-hyphenation"] as const)
        .describe(
          "Text alignment. Options: 'left', 'justified' (spreads text across full width), 'justified-with-no-hyphenation' (justified without word breaks). The default value is `justified`.",
        )
        .default("justified")
        .optional(),
      date_and_location_column_alignment: Alignment.optional(),
      font_family: z
        .union([
          rendercv_schema_models_design_classic_theme_FontFamily,
          rendercv_schema_models_design_font_family_FontFamily,
        ])
        .describe(
          "The font family. You can provide a single font name as a string (applies to all elements), or a dictionary with keys 'body', 'name', 'headline', 'connections', and 'section_titles' to customize each element. Any system font can be used.",
        )
        .optional(),
      font_size: rendercv_schema_models_design_classic_theme_FontSize_1.optional(),
      small_caps: SmallCaps.optional(),
      bold: rendercv_schema_models_design_classic_theme_Bold_2.optional(),
    })
    .strict()
    .describe("Typography"),
);

export const rendercv_schema_models_design_classic_theme_Typography_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      line_spacing: TypstDimension.optional(),
      alignment: z
        .enum(["left", "justified", "justified-with-no-hyphenation"] as const)
        .describe(
          "Text alignment. Options: 'left', 'justified' (spreads text across full width), 'justified-with-no-hyphenation' (justified without word breaks). The default value is `justified`.",
        )
        .default("justified")
        .optional(),
      date_and_location_column_alignment: Alignment.optional(),
      font_family: z
        .union([
          rendercv_schema_models_design_classic_theme_FontFamily,
          rendercv_schema_models_design_font_family_FontFamily,
        ])
        .describe(
          "The font family. You can provide a single font name as a string (applies to all elements), or a dictionary with keys 'body', 'name', 'headline', 'connections', and 'section_titles' to customize each element. Any system font can be used.",
        )
        .optional(),
      font_size: rendercv_schema_models_design_classic_theme_FontSize_2.optional(),
      small_caps: SmallCaps.optional(),
      bold: rendercv_schema_models_design_classic_theme_Bold_3.optional(),
    })
    .strict()
    .describe("Typography"),
);

export const rendercv_schema_models_design_classic_theme_Typography_4: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      line_spacing: TypstDimension.optional(),
      alignment: z
        .enum(["left", "justified", "justified-with-no-hyphenation"] as const)
        .describe(
          "Text alignment. Options: 'left', 'justified' (spreads text across full width), 'justified-with-no-hyphenation' (justified without word breaks). The default value is `justified`.",
        )
        .default("justified")
        .optional(),
      date_and_location_column_alignment: Alignment.optional(),
      font_family: z
        .union([
          rendercv_schema_models_design_classic_theme_FontFamily,
          rendercv_schema_models_design_font_family_FontFamily,
        ])
        .describe(
          "The font family. You can provide a single font name as a string (applies to all elements), or a dictionary with keys 'body', 'name', 'headline', 'connections', and 'section_titles' to customize each element. Any system font can be used.",
        )
        .optional(),
      font_size: rendercv_schema_models_design_classic_theme_FontSize_3.optional(),
      small_caps: SmallCaps.optional(),
      bold: rendercv_schema_models_design_classic_theme_Bold_4.optional(),
    })
    .strict()
    .describe("Typography"),
);

export const rendercv_schema_models_design_classic_theme_Typography_5: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      line_spacing: TypstDimension.optional(),
      alignment: z
        .enum(["left", "justified", "justified-with-no-hyphenation"] as const)
        .describe(
          "Text alignment. Options: 'left', 'justified' (spreads text across full width), 'justified-with-no-hyphenation' (justified without word breaks). The default value is `justified`.",
        )
        .default("justified")
        .optional(),
      date_and_location_column_alignment: Alignment.optional(),
      font_family: z
        .union([
          rendercv_schema_models_design_classic_theme_FontFamily,
          rendercv_schema_models_design_font_family_FontFamily,
        ])
        .describe(
          "The font family. You can provide a single font name as a string (applies to all elements), or a dictionary with keys 'body', 'name', 'headline', 'connections', and 'section_titles' to customize each element. Any system font can be used.",
        )
        .optional(),
      font_size: rendercv_schema_models_design_classic_theme_FontSize_1.optional(),
      small_caps: SmallCaps.optional(),
      bold: rendercv_schema_models_design_classic_theme_Bold_1.optional(),
    })
    .strict()
    .describe("Typography"),
);

export const rendercv_schema_models_design_font_family_FontFamily: z.ZodTypeAny = z.lazy(() =>
  z.enum([
    "Aptos",
    "Arial",
    "Arial Rounded MT",
    "Arial Unicode MS",
    "Comic Sans MS",
    "Courier New",
    "DejaVu Sans Mono",
    "Didot",
    "EB Garamond",
    "Fontin",
    "Garamond",
    "Gentium Book Plus",
    "Georgia",
    "Gill Sans",
    "Helvetica",
    "Impact",
    "Inter",
    "Lato",
    "Libertinus Serif",
    "Lucida Sans Unicode",
    "Mukta",
    "New Computer Modern",
    "Noto Sans",
    "Open Sans",
    "Open Sauce Sans",
    "Poppins",
    "Raleway",
    "Roboto",
    "Source Sans 3",
    "Tahoma",
    "Times New Roman",
    "Trebuchet MS",
    "Ubuntu",
    "Verdana",
    "XCharter",
  ] as const),
);

export const rendercv_schema_models_locale_english_locale_Phrases_1: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `DEGREE in AREA`.",
        )
        .default("DEGREE in AREA")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_10: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `AREA DEGREE`.",
        )
        .default("AREA DEGREE")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_11: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `AREA DEGREE`.",
        )
        .default("AREA DEGREE")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_12: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `DEGREE i AREA`.",
        )
        .default("DEGREE i AREA")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_13: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `DEGREE i AREA`.",
        )
        .default("DEGREE i AREA")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_14: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `DEGREE em AREA`.",
        )
        .default("DEGREE em AREA")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_15: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `DEGREE в AREA`.",
        )
        .default("DEGREE в AREA")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_16: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `DEGREE en AREA`.",
        )
        .default("DEGREE en AREA")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_17: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `AREA, DEGREE`.",
        )
        .default("AREA, DEGREE")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_2: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `DEGREE i AREA`.",
        )
        .default("DEGREE i AREA")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_3: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `DEGREE in AREA`.",
        )
        .default("DEGREE in AREA")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_4: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `DEGREE en AREA`.",
        )
        .default("DEGREE en AREA")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_5: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `DEGREE in AREA`.",
        )
        .default("DEGREE in AREA")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_6: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `AREA में DEGREE`.",
        )
        .default("AREA में DEGREE")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_7: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `DEGREE di AREA`.",
        )
        .default("DEGREE di AREA")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_8: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `DEGREE in AREA`.",
        )
        .default("DEGREE in AREA")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const rendercv_schema_models_locale_english_locale_Phrases_9: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      degree_with_area: z
        .string()
        .describe(
          "Template for combining degree and area in education entries. Available placeholders: DEGREE, AREA. The default value is `AREA DEGREE`.",
        )
        .default("AREA DEGREE")
        .optional(),
    })
    .strict()
    .describe("Phrases"),
);

export const TRenderCvDocument = z
  .object({
    cv: Cv.optional(),
    design: BuiltInDesign.optional(),
    locale: Locale.optional(),
    settings: Settings.optional(),
  })
  .strict()
  .describe("Typst-based CV/resume generator for academics and engineers.");

export type TRenderCvDocument = z.infer<typeof TRenderCvDocument>;
