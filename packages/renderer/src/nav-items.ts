export const NAV_ITEMS = [
  { id: "index", href: "index.html", label: "Start", icon: "home" },
  { id: "contacts", href: "contacts.html", label: "Kontakte", icon: "contacts" },
  { id: "meeting-points", href: "meeting-points.html", label: "Treffpunkte", icon: "place" },
  { id: "checklists", href: "checklists.html", label: "Checklisten", icon: "checklist" },
  { id: "power-outage", href: "power-outage.html", label: "Stromausfall", icon: "bolt" },
  { id: "pets", href: "pets.html", label: "Haustiere", icon: "pets" },
  { id: "medication", href: "medication.html", label: "Medikamente", icon: "medication" },
  { id: "documents", href: "documents.html", label: "Dokumente", icon: "description" },
] as const;

/** All CrisisKit pages exposed as HA dashboard quick links. */
export const HA_QUICK_LINK_PAGES = [
  ...NAV_ITEMS.map((item) => ({ name: item.label, path: item.href })),
  { name: "Notfallkarte", path: "emergency-card.html" },
  { name: "Offline-Checkliste", path: "offline-checklist.html" },
] as const;
