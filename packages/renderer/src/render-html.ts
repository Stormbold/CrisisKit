import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Eta } from "eta";
import type { ProjectData } from "@crisiskit/core";
import {
  DEFAULT_DISCLAIMER_DE,
  MEDICATION_DISCLAIMER_DE,
} from "@crisiskit/core";
import { copyVendorAssets, getImportMapJson } from "./copy-vendor.js";
import { NAV_ITEMS } from "./nav-items.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const templatesDir = join(packageRoot, "src", "templates");
const assetsDir = join(packageRoot, "src", "assets");

export interface RenderHtmlResult {
  files: string[];
}


interface BaseContext {
  importMapJson: string;
  navItems: typeof NAV_ITEMS;
  projectName: string;
  language: string;
  lastReviewed: string;
  disclaimerEnabled: boolean;
  disclaimerText: string;
  emergencyNumber: string;
  policeNumber?: string;
}

function createEta(): Eta {
  return new Eta({
    views: templatesDir,
    autoTrim: false,
    cache: false,
  });
}

function getBaseContext(data: ProjectData): BaseContext {
  return {
    importMapJson: getImportMapJson(),
    navItems: NAV_ITEMS,
    projectName: data.config.project.name,
    language: data.config.project.language,
    lastReviewed: data.config.project.last_reviewed,
    disclaimerEnabled: data.config.disclaimer.enabled,
    disclaimerText: data.config.disclaimer.text || DEFAULT_DISCLAIMER_DE,
    emergencyNumber: data.config.emergency_numbers.emergency,
    policeNumber: data.config.emergency_numbers.police,
  };
}

function sortContacts(data: ProjectData) {
  return [...data.contacts.contacts].sort((a, b) => a.priority - b.priority);
}

function findPowerOutageChecklist(data: ProjectData) {
  const match = data.checklists.checklists.find((c) =>
    /stromausfall|power.?outage|blackout/i.test(c.title),
  );
  if (match) return match;

  return {
    title: "Stromausfall",
    description: "Kurzcheck für die ersten Minuten",
    items: [
      "Ruhe bewahren",
      "Taschenlampe suchen",
      "Sicherungen prüfen",
      "Handy-Akku sparen",
      "Radio / Powerbank bereitlegen",
    ],
  };
}

function buildEmergencyCardContext(data: ProjectData, base: BaseContext) {
  const contacts = sortContacts(data);
  const topContact = contacts[0];
  const meetingPoint = data.meetingPoints.meeting_points[0];
  const hasPets = data.pets.pets.length > 0;
  const medicalPerson = data.medication.persons.find((p) => p.items.length > 0);
  const docFolder = data.documents.documents[0]?.location ?? "";

  return {
    ...base,
    emergencyContact: topContact
      ? `${topContact.name} — ${topContact.phone}`
      : "Siehe Kontaktliste",
    meetingPoint: meetingPoint
      ? `${meetingPoint.name}: ${meetingPoint.location}`
      : "Siehe Treffpunkte",
    medicalNotes: medicalPerson
      ? `${medicalPerson.name}: ${medicalPerson.items.map((i) => i.name).join(", ")}`
      : "",
    petsSummary: hasPets ? data.pets.pets.map((p) => p.name).join(", ") : "",
    documentsLocation: docFolder,
    disclaimerShort:
      "Nur private Dokumentation. Kein Ersatz für Notruf oder amtliche Warnungen.",
  };
}

export function renderHtml(data: ProjectData, outputDir: string): RenderHtmlResult {
  const eta = createEta();
  const base = getBaseContext(data);
  const contacts = sortContacts(data);
  const powerOutage = findPowerOutageChecklist(data);

  const pages: Array<{ filename: string; template: string; context: Record<string, unknown> }> = [
    {
      filename: "index.html",
      template: "index.eta",
      context: {
        ...base,
        activePage: "index",
        pageTitle: "Start",
        topContacts: contacts.slice(0, 3),
        topMeetingPoints: data.meetingPoints.meeting_points.slice(0, 2),
      },
    },
    {
      filename: "contacts.html",
      template: "contacts.eta",
      context: { ...base, activePage: "contacts", pageTitle: "Kontakte", contacts },
    },
    {
      filename: "meeting-points.html",
      template: "meeting-points.eta",
      context: {
        ...base,
        activePage: "meeting-points",
        pageTitle: "Treffpunkte",
        meetingPoints: data.meetingPoints.meeting_points,
      },
    },
    {
      filename: "checklists.html",
      template: "checklists.eta",
      context: {
        ...base,
        activePage: "checklists",
        pageTitle: "Checklisten",
        checklists: data.checklists.checklists,
      },
    },
    {
      filename: "power-outage.html",
      template: "power-outage.eta",
      context: {
        ...base,
        activePage: "power-outage",
        pageTitle: "Stromausfall",
        checklist: powerOutage,
        preparedItems: [
          "Taschenlampe mit Batterien",
          "Powerbank geladen",
          "Batteriebetriebenes Radio",
          "Liste wichtiger Kontakte (Papier)",
        ],
      },
    },
    {
      filename: "pets.html",
      template: "pets.eta",
      context: { ...base, activePage: "pets", pageTitle: "Haustiere", pets: data.pets.pets },
    },
    {
      filename: "medication.html",
      template: "medication.eta",
      context: {
        ...base,
        activePage: "medication",
        pageTitle: "Medikamente",
        persons: data.medication.persons,
        medicationDisclaimer:
          data.medication.disclaimer?.trim() || MEDICATION_DISCLAIMER_DE,
      },
    },
    {
      filename: "documents.html",
      template: "documents.eta",
      context: {
        ...base,
        activePage: "documents",
        pageTitle: "Dokumente",
        documents: data.documents.documents,
      },
    },
    {
      filename: "emergency-card.html",
      template: "emergency-card.eta",
      context: buildEmergencyCardContext(data, base),
    },
    {
      filename: "offline-checklist.html",
      template: "offline-checklist.eta",
      context: {
        ...base,
        checklists: data.checklists.checklists,
      },
    },
  ];

  mkdirSync(outputDir, { recursive: true });
  mkdirSync(join(outputDir, "assets", "styles"), { recursive: true });
  mkdirSync(join(outputDir, "assets", "scripts"), { recursive: true });

  copyVendorAssets(outputDir);

  const files: string[] = [];

  for (const page of pages) {
    let html: string;
    if (page.template === "emergency-card.eta" || page.template === "offline-checklist.eta") {
      html = eta.render(page.template, page.context) as string;
    } else {
      const body = eta.render(page.template, page.context) as string;
      html = eta.render("base.eta", { ...page.context, body }) as string;
    }
    const outPath = join(outputDir, page.filename);
    writeFileSync(outPath, html, "utf-8");
    files.push(page.filename);
  }

  cpSync(join(assetsDir, "styles"), join(outputDir, "assets", "styles"), {
    recursive: true,
  });
  cpSync(join(assetsDir, "scripts"), join(outputDir, "assets", "scripts"), {
    recursive: true,
  });

  return { files };
}
