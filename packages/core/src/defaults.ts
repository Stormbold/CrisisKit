export const DEFAULT_DISCLAIMER_DE =
  "CrisisKit ist ein Werkzeug zur privaten und lokalen Vorbereitung. Es ersetzt keine amtlichen Warnungen, keine Notrufe, keine medizinische Beratung und keine Anweisungen von Behörden oder Einsatzkräften.";

export const DEFAULT_DISCLAIMER_EN =
  "CrisisKit is a private/local preparedness tool. It does not replace official warnings, emergency services, medical advice, or instructions from authorities.";

export const DEFAULT_EMERGENCY_NUMBERS_DE = {
  emergency: "112",
  police: "110",
  poison_control: "",
};

export const MEDICATION_DISCLAIMER_DE =
  "Diese Liste dient nur zur privaten Dokumentation. Dosierung und Einnahme müssen ärztlich oder pharmazeutisch geklärt sein.";

export const REVIEW_WARNING_DAYS = 90;

export const CRISISKIT_REPO_URL = "https://github.com/crisiskit/crisiskit";

export const PROJECT_FILES = [
  "config.yml",
  "contacts.yml",
  "meeting-points.yml",
  "checklists.yml",
  "pets.yml",
  "medication.yml",
  "documents.yml",
] as const;

export type ProjectFile = (typeof PROJECT_FILES)[number];
