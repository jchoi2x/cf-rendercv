import { z } from "@hono/zod-openapi";

import { BulletEntry } from "./entries/bullet-entry";
import { EducationEntry } from "./entries/education-entry";
import { ExperienceEntry } from "./entries/experience-entry";
import { NormalEntry } from "./entries/normal-entry";
import { NumberedEntry } from "./entries/numbered-entry";
import { OneLineEntry } from "./entries/oneline-entry";
import { PublicationEntry } from "./entries/publication-entry";
import { ReversedNumberedEntry } from "./entries/reversed-number-entry";

export const ListOfEntries = z.union([
  z.array(z.string()),
  z.array(OneLineEntry),
  z.array(NormalEntry),
  z.array(ExperienceEntry),
  z.array(EducationEntry),
  z.array(PublicationEntry),
  z.array(BulletEntry),
  z.array(NumberedEntry),
  z.array(ReversedNumberedEntry),
]);

export const Section = ListOfEntries;
