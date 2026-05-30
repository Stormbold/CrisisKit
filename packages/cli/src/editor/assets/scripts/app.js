/** @typedef {{ id: string, label: string, icon: string }} Section */

let project = null;
let currentSection = "contacts";
let pendingDelete = null;

const projectNameEl = document.getElementById("project-name");
const saveStatusEl = document.getElementById("save-status");
const sectionNav = document.getElementById("section-nav");
const sectionContent = document.getElementById("section-content");
const editDialog = document.getElementById("edit-dialog");
const dialogTitle = document.getElementById("dialog-title");
const dialogForm = document.getElementById("dialog-form");
const confirmDialog = document.getElementById("confirm-dialog");
const confirmText = document.getElementById("confirm-text");

/** @type {Section[]} */
const SECTIONS = [
  { id: "config", label: "Projekt", icon: "settings" },
  { id: "contacts", label: "Kontakte", icon: "contacts" },
  { id: "meeting-points", label: "Treffpunkte", icon: "place" },
  { id: "checklists", label: "Checklisten", icon: "checklist" },
  { id: "pets", label: "Haustiere", icon: "pets" },
  { id: "medication", label: "Medikamente", icon: "medication" },
  { id: "documents", label: "Dokumente", icon: "description" },
  { id: "home-assistant", label: "Home Assistant", icon: "home_iot_device" },
];

async function init() {
  await loadProject();
  renderNav();
  renderSection();
  document.getElementById("btn-build").addEventListener("click", runBuild);
  document.getElementById("confirm-cancel").addEventListener("click", () => confirmDialog.close());
  document.getElementById("confirm-ok").addEventListener("click", () => {
    if (pendingDelete) pendingDelete();
    confirmDialog.close();
  });
}

async function loadProject() {
  const res = await fetch("/api/project");
  project = await res.json();
  projectNameEl.textContent = project.config.project.name;
}

function setStatus(msg, type = "") {
  saveStatusEl.textContent = msg;
  saveStatusEl.className = `save-status ${type}`;
}

async function saveApiFile(apiName, data) {
  const res = await fetch(`/api/files/${apiName}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Speichern fehlgeschlagen");
  setStatus("Gespeichert", "ok");
  if (body.validation?.issues?.length) {
    console.warn("Validation warnings:", body.validation.issues);
  }
  await loadProject();
  renderSection();
}

async function runBuild() {
  setStatus("Build läuft…");
  try {
    const res = await fetch("/api/build", { method: "POST" });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "Build fehlgeschlagen");
    setStatus(`Build OK → ${body.output}`, "ok");
    window.open("/preview/index.html", "_blank");
  } catch (e) {
    setStatus(e.message, "err");
  }
}

function renderNav() {
  sectionNav.innerHTML = SECTIONS.map(
    (s) => `
    <md-list-item type="button" data-section="${s.id}" ${s.id === currentSection ? "activated" : ""}>
      <md-icon slot="start">${s.icon}</md-icon>
      <div slot="headline">${s.label}</div>
    </md-list-item>`,
  ).join("");

  sectionNav.querySelectorAll("[data-section]").forEach((el) => {
    el.addEventListener("click", () => {
      currentSection = el.dataset.section;
      renderNav();
      renderSection();
    });
  });
}

function renderSection() {
  switch (currentSection) {
    case "config":
      renderConfig();
      break;
    case "contacts":
      renderContacts();
      break;
    case "meeting-points":
      renderMeetingPoints();
      break;
    case "checklists":
      renderChecklists();
      break;
    case "pets":
      renderPets();
      break;
    case "medication":
      renderMedication();
      break;
    case "documents":
      renderDocuments();
      break;
    case "home-assistant":
      renderHomeAssistant();
      break;
    default:
      sectionContent.innerHTML = "";
  }
}

function sectionShell(title, addLabel, onAdd, listHtml) {
  return `
    <div class="section-header">
      <h2>${title}</h2>
      <md-filled-tonal-button id="btn-add"><md-icon slot="icon">add</md-icon>${addLabel}</md-filled-tonal-button>
    </div>
    ${listHtml || '<p class="empty">Noch keine Einträge.</p>'}
  `;
}

function bindAddButton(onAdd) {
  document.getElementById("btn-add")?.addEventListener("click", onAdd);
}

function confirmRemove(text, onOk) {
  confirmText.textContent = text;
  pendingDelete = onOk;
  confirmDialog.show();
}

function openFormDialog(title, fields, values, onSave) {
  dialogTitle.textContent = title;
  dialogForm.innerHTML = fields
    .map((f) => {
      if (f.type === "checkbox") {
        return `<label class="checkbox-row"><input type="checkbox" name="${f.name}" ${values[f.name] ? "checked" : ""}> ${f.label}</label>`;
      }
      if (f.type === "textarea") {
        return `<label class="field-label">${f.label}<textarea name="${f.name}" rows="${f.rows || 4}">${escapeText(values[f.name] ?? "")}</textarea></label>`;
      }
      return `<md-outlined-text-field label="${f.label}" name="${f.name}" type="${f.inputType || "text"}" value="${escapeAttr(String(values[f.name] ?? ""))}"></md-outlined-text-field>`;
    })
    .join("");

  editDialog.show();

  dialogForm.onsubmit = async (e) => {
    e.preventDefault();
    const submitter = e.submitter;
    if (submitter?.value === "cancel") {
      editDialog.close();
      return;
    }

    const result = {};
    for (const f of fields) {
      const el = dialogForm.querySelector(`[name="${f.name}"]`);
      if (f.type === "checkbox") {
        result[f.name] = el?.checked ?? false;
      } else if (f.type === "textarea" && f.splitLines) {
        result[f.name] = String(el?.value || "")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
      } else if (f.type === "number") {
        result[f.name] = Number(el?.value || 0);
      } else {
        const value = el?.value ?? "";
        result[f.name] = String(value);
      }
    }
    try {
      await onSave(result);
      editDialog.close();
    } catch (err) {
      setStatus(err.message, "err");
    }
  };
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeText(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function renderListItems(items, renderItem, onEdit, onDelete) {
  if (!items.length) return "";
  return `<md-elevated-card><div class="card-body"><md-list>${items
    .map(
      (item, index) => `
      <md-list-item>
        <div slot="headline">${renderItem(item)}</div>
        <div slot="end" class="item-actions">
          <md-icon-button data-edit="${index}"><md-icon>edit</md-icon></md-icon-button>
          <md-icon-button data-del="${index}"><md-icon>delete</md-icon></md-icon-button>
        </div>
      </md-list-item>
      ${index < items.length - 1 ? "<md-divider inset></md-divider>" : ""}`,
    )
    .join("")}</md-list></div></md-elevated-card>`;
}

function bindListActions(items, onEdit, onDelete, root = sectionContent) {
  root.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => onEdit(Number(btn.dataset.edit)));
  });
  root.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.del);
      confirmRemove(`„${items[index].name || items[index].title || items[index].alias || "Eintrag"}“ wirklich entfernen?`, () =>
        onDelete(index),
      );
    });
  });
}

function renderConfig() {
  const c = project.config;
  sectionContent.innerHTML = `
    <div class="section-header"><h2>Projekt</h2>
      <md-filled-tonal-button id="btn-edit-config"><md-icon slot="icon">edit</md-icon>Bearbeiten</md-filled-tonal-button>
    </div>
    <md-elevated-card><div class="card-body form-grid">
      <div><strong>Name</strong><br>${c.project.name}</div>
      <div><strong>Typ</strong><br>${c.project.type}</div>
      <div><strong>Letzter Prüfstand</strong><br>${c.project.last_reviewed}</div>
      <div><strong>Notruf</strong><br>${c.emergency_numbers.emergency}</div>
    </div></md-elevated-card>`;

  document.getElementById("btn-edit-config").addEventListener("click", () => {
    openFormDialog(
      "Projekt bearbeiten",
      [
        { name: "name", label: "Projektname" },
        { name: "type", label: "Typ (household, club, …)" },
        { name: "last_reviewed", label: "Letzter Prüfstand (YYYY-MM-DD)" },
        { name: "emergency", label: "Notruf" },
        { name: "police", label: "Polizei" },
        { name: "disclaimer", label: "Disclaimer-Text", type: "textarea", rows: 4 },
      ],
      {
        name: c.project.name,
        type: c.project.type,
        last_reviewed: c.project.last_reviewed,
        emergency: c.emergency_numbers.emergency,
        police: c.emergency_numbers.police || "",
        disclaimer: c.disclaimer.text,
      },
      async (v) => {
        const next = {
          ...c,
          project: { ...c.project, name: v.name, type: v.type, last_reviewed: v.last_reviewed },
          emergency_numbers: { ...c.emergency_numbers, emergency: v.emergency, police: v.police },
          disclaimer: { ...c.disclaimer, text: v.disclaimer },
        };
        await saveApiFile("config", next);
      },
    );
  });
}

const contactFields = [
  { name: "name", label: "Name" },
  { name: "role", label: "Rolle" },
  { name: "phone", label: "Telefon" },
  { name: "priority", label: "Priorität (1–10)", type: "number", inputType: "number" },
  { name: "notes", label: "Notizen", type: "textarea", rows: 2 },
];

function renderContacts() {
  const items = project.contacts.contacts;
  sectionContent.innerHTML = sectionShell(
    "Kontakte",
    "Kontakt hinzufügen",
    null,
    renderListItems(items, (c) => `${c.name} · ${c.role} · ${c.phone}`, null, null),
  );
  bindAddButton(() =>
    openFormDialog("Kontakt hinzufügen", contactFields, { priority: 1 }, async (v) => {
      const next = { contacts: [...items, v] };
      await saveApiFile("contacts", next);
    }),
  );
  bindListActions(items, (i) => {
    openFormDialog("Kontakt bearbeiten", contactFields, items[i], async (v) => {
      const next = { contacts: items.map((c, idx) => (idx === i ? v : c)) };
      await saveApiFile("contacts", next);
    });
  }, async (i) => {
    await saveApiFile("contacts", { contacts: items.filter((_, idx) => idx !== i) });
  });
}

function renderMeetingPoints() {
  const items = project.meetingPoints.meeting_points;
  const fields = [
    { name: "name", label: "Name" },
    { name: "location", label: "Ort" },
    { name: "when", label: "Wann" },
    { name: "notes", label: "Notizen", type: "textarea", rows: 2 },
  ];
  sectionContent.innerHTML = sectionShell(
    "Treffpunkte",
    "Treffpunkt hinzufügen",
    null,
    renderListItems(items, (p) => `${p.name} — ${p.location}`, null, null),
  );
  bindAddButton(() =>
    openFormDialog("Treffpunkt hinzufügen", fields, {}, async (v) => {
      await saveApiFile("meeting-points", { meeting_points: [...items, v] });
    }),
  );
  bindListActions(items, (i) => {
    openFormDialog("Treffpunkt bearbeiten", fields, items[i], async (v) => {
      await saveApiFile("meeting-points", {
        meeting_points: items.map((p, idx) => (idx === i ? v : p)),
      });
    });
  }, async (i) => {
    await saveApiFile("meeting-points", {
      meeting_points: items.filter((_, idx) => idx !== i),
    });
  });
}

function renderChecklists() {
  const items = project.checklists.checklists;
  const fields = [
    { name: "title", label: "Titel" },
    { name: "description", label: "Beschreibung", type: "textarea", rows: 2 },
    { name: "items", label: "Punkte (eine Zeile pro Punkt)", type: "textarea", rows: 8, splitLines: true },
  ];
  sectionContent.innerHTML = sectionShell(
    "Checklisten",
    "Checkliste hinzufügen",
    null,
    renderListItems(items, (c) => `${c.title} (${c.items.length} Punkte)`, null, null),
  );
  bindAddButton(() =>
    openFormDialog("Checkliste hinzufügen", fields, { items: [] }, async (v) => {
      await saveApiFile("checklists", { checklists: [...items, v] });
    }),
  );
  bindListActions(
    items,
    (i) => {
      openFormDialog(
        "Checkliste bearbeiten",
        fields,
        { ...items[i], items: items[i].items.join("\n") },
        async (v) => {
          await saveApiFile("checklists", {
            checklists: items.map((c, idx) => (idx === i ? v : c)),
          });
        },
      );
    },
    async (i) => {
      await saveApiFile("checklists", { checklists: items.filter((_, idx) => idx !== i) });
    },
  );
}

function renderPets() {
  const items = project.pets.pets;
  const fields = [
    { name: "name", label: "Name" },
    { name: "type", label: "Tierart" },
    { name: "carrier_location", label: "Transportbox / Ort" },
    { name: "food", label: "Futter" },
    { name: "vet", label: "Tierarzt" },
    { name: "notes", label: "Notizen (eine Zeile pro Punkt)", type: "textarea", rows: 4, splitLines: true },
  ];
  sectionContent.innerHTML = sectionShell(
    "Haustiere",
    "Haustier hinzufügen",
    null,
    renderListItems(items, (p) => `${p.name} (${p.type})`, null, null),
  );
  bindAddButton(() =>
    openFormDialog("Haustier hinzufügen", fields, {}, async (v) => {
      await saveApiFile("pets", { pets: [...items, v] });
    }),
  );
  bindListActions(
    items,
    (i) => {
      openFormDialog(
        "Haustier bearbeiten",
        fields,
        { ...items[i], notes: (items[i].notes || []).join("\n") },
        async (v) => {
          await saveApiFile("pets", { pets: items.map((p, idx) => (idx === i ? v : p)) });
        },
      );
    },
    async (i) => {
      await saveApiFile("pets", { pets: items.filter((_, idx) => idx !== i) });
    },
  );
}

function renderMedication() {
  const med = project.medication;
  const items = med.persons;
  sectionContent.innerHTML = `
    <p class="hint">${med.disclaimer || "Disclaimer in medication.yml pflegen."}</p>
    ${sectionShell(
      "Medikamente",
      "Person hinzufügen",
      null,
      renderListItems(items, (p) => `${p.name} (${p.items.length} Einträge)`, null, null),
    )}
  `;
  bindAddButton(() => {
    openFormDialog(
      "Person hinzufügen",
      [
        { name: "name", label: "Name" },
        {
          name: "items",
          label: "Medikamente: Name | Dosierung | Ort (eine Zeile pro Medikament)",
          type: "textarea",
          rows: 6,
        },
      ],
      {},
      async (v) => {
        const parsed = String(v.items || "")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((line) => {
            const [name, dosage = "", location = ""] = line.split("|").map((s) => s.trim());
            return { name, dosage, location };
          });
        await saveApiFile("medication", {
          ...med,
          persons: [...items, { name: v.name, items: parsed }],
        });
      },
    );
  });
  bindListActions(
    items,
    (i) => {
      const lines = items[i].items.map((it) =>
        [it.name, it.dosage || "", it.location || ""].join(" | "),
      );
      openFormDialog(
        "Medikamente bearbeiten",
        [
          { name: "name", label: "Name" },
          { name: "items", label: "Medikamente (Name | Dosierung | Ort)", type: "textarea", rows: 6 },
        ],
        { name: items[i].name, items: lines.join("\n") },
        async (v) => {
          const parsed = String(v.items || "")
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
            .map((line) => {
              const [name, dosage = "", location = ""] = line.split("|").map((s) => s.trim());
              return { name, dosage, location };
            });
          await saveApiFile("medication", {
            ...med,
            persons: items.map((p, idx) => (idx === i ? { name: v.name, items: parsed } : p)),
          });
        },
      );
    },
    async (i) => {
      await saveApiFile("medication", {
        ...med,
        persons: items.filter((_, idx) => idx !== i),
      });
    },
  );
}

function renderDocuments() {
  const items = project.documents.documents;
  const fields = [
    { name: "name", label: "Bezeichnung" },
    { name: "location", label: "Ort" },
    { name: "original_or_copy", label: "Typ (original, copy, both, digital)" },
    { name: "notes", label: "Notizen", type: "textarea", rows: 2 },
  ];
  sectionContent.innerHTML = sectionShell(
    "Dokumente",
    "Dokument hinzufügen",
    null,
    renderListItems(items, (d) => `${d.name} — ${d.location}`, null, null),
  );
  bindAddButton(() =>
    openFormDialog("Dokument hinzufügen", fields, {}, async (v) => {
      const entry = { name: v.name, location: v.location };
      if (v.original_or_copy) entry.original_or_copy = v.original_or_copy;
      if (v.notes) entry.notes = v.notes;
      await saveApiFile("documents", { documents: [...items, entry] });
    }),
  );
  bindListActions(
    items,
    (i) => {
      openFormDialog("Dokument bearbeiten", fields, items[i], async (v) => {
        const entry = { name: v.name, location: v.location };
        if (v.original_or_copy) entry.original_or_copy = v.original_or_copy;
        if (v.notes) entry.notes = v.notes;
        await saveApiFile("documents", {
          documents: items.map((d, idx) => (idx === i ? entry : d)),
        });
      });
    },
    async (i) => {
      await saveApiFile("documents", { documents: items.filter((_, idx) => idx !== i) });
    },
  );
}

const defaultHomeAssistant = () => ({
  enabled: true,
  www: { subdirectory: "crisiskit" },
  dashboard: { title: "Notfall", icon: "mdi:shield-home", path: "notfall" },
  entities: [],
  automations: [],
});

async function ensureHomeAssistant() {
  if (!project.homeAssistant) {
    await saveApiFile("home-assistant", defaultHomeAssistant());
  }
}

function renderHomeAssistant() {
  if (!project.homeAssistant) {
    sectionContent.innerHTML = `
      <div class="section-header"><h2>Home Assistant</h2></div>
      <md-elevated-card><div class="card-body">
        <p class="hint">Exportiert Lovelace-Dashboard, Package und Installationsanleitung nach <code>dist/home-assistant/</code>.</p>
        <md-filled-tonal-button id="btn-enable-ha"><md-icon slot="icon">add</md-icon>Home Assistant aktivieren</md-filled-tonal-button>
      </div></md-elevated-card>`;
    document.getElementById("btn-enable-ha").addEventListener("click", () => ensureHomeAssistant());
    return;
  }

  const ha = project.homeAssistant;
  sectionContent.innerHTML = `
    <div class="section-header">
      <h2>Home Assistant</h2>
      <md-filled-tonal-button id="btn-ha-settings"><md-icon slot="icon">settings</md-icon>Einstellungen</md-filled-tonal-button>
    </div>
    <md-elevated-card><div class="card-body form-grid">
      <div><strong>Export</strong><br>${ha.enabled ? "Aktiv" : "Deaktiviert"}</div>
      <div><strong>WWW-Ordner</strong><br>/config/www/${ha.www.subdirectory}/</div>
      <div><strong>Dashboard</strong><br>${ha.dashboard.title} (${ha.dashboard.path})</div>
      <div><strong>Entitäten</strong><br>${ha.entities.length}</div>
      <div><strong>Automationen</strong><br>${ha.automations.length}</div>
    </div></md-elevated-card>
    <div class="section-header" style="margin-top:1.5rem">
      <h2>Entitäten</h2>
      <md-filled-tonal-button id="btn-add-entity"><md-icon slot="icon">add</md-icon>Entität hinzufügen</md-filled-tonal-button>
    </div>
    <div id="ha-entities">
    ${renderListItems(ha.entities, (e) => `${e.label} · ${e.entity_id}`, null, null) || '<p class="empty">Noch keine Entitäten.</p>'}
    </div>
    <div class="section-header" style="margin-top:1.5rem">
      <h2>Automationen</h2>
      <md-filled-tonal-button id="btn-add-automation"><md-icon slot="icon">add</md-icon>Automation hinzufügen</md-filled-tonal-button>
    </div>
    <div id="ha-automations">
    ${renderListItems(ha.automations, (a) => `${a.alias} · ${a.trigger_entity} → ${a.trigger_to}`, null, null) || '<p class="empty">Noch keine Automationen.</p>'}
    </div>
    <p class="hint" style="margin-top:1rem">Nach dem Speichern: „Build &amp; Vorschau“ — Artefakte liegen unter <code>dist/home-assistant/INSTALL.md</code>.</p>
  `;

  document.getElementById("btn-ha-settings").addEventListener("click", () => {
    openFormDialog(
      "Home Assistant Einstellungen",
      [
        { name: "enabled", label: "Export aktivieren", type: "checkbox" },
        { name: "subdirectory", label: "WWW-Unterordner (in /config/www/)" },
        { name: "dashboard_title", label: "Dashboard-Titel" },
        { name: "dashboard_icon", label: "Dashboard-Icon (mdi:…)" },
        { name: "dashboard_path", label: "Dashboard-Pfad (URL-Slug)" },
      ],
      {
        enabled: ha.enabled,
        subdirectory: ha.www.subdirectory,
        dashboard_title: ha.dashboard.title,
        dashboard_icon: ha.dashboard.icon,
        dashboard_path: ha.dashboard.path,
      },
      async (v) => {
        await saveApiFile("home-assistant", {
          ...ha,
          enabled: v.enabled,
          www: { subdirectory: v.subdirectory },
          dashboard: {
            title: v.dashboard_title,
            icon: v.dashboard_icon,
            path: v.dashboard_path,
          },
        });
      },
    );
  });

  const entityFields = [
    { name: "entity_id", label: "Entity ID (z. B. binary_sensor.stromnetz)" },
    { name: "label", label: "Anzeigename" },
    { name: "icon", label: "Icon (optional, mdi:…)" },
  ];

  document.getElementById("btn-add-entity").addEventListener("click", () => {
    openFormDialog("Entität hinzufügen", entityFields, {}, async (v) => {
      const entry = { entity_id: v.entity_id, label: v.label };
      if (v.icon) entry.icon = v.icon;
      await saveApiFile("home-assistant", { ...ha, entities: [...ha.entities, entry] });
    });
  });

  bindListActions(
    ha.entities,
    (i) => {
      openFormDialog("Entität bearbeiten", entityFields, ha.entities[i], async (v) => {
        const entry = { entity_id: v.entity_id, label: v.label };
        if (v.icon) entry.icon = v.icon;
        await saveApiFile("home-assistant", {
          ...ha,
          entities: ha.entities.map((e, idx) => (idx === i ? entry : e)),
        });
      });
    },
    async (i) => {
      await saveApiFile("home-assistant", {
        ...ha,
        entities: ha.entities.filter((_, idx) => idx !== i),
      });
    },
    sectionContent.querySelector("#ha-entities"),
  );

  const automationFields = [
    { name: "id", label: "ID (a-z, 0-9, _)" },
    { name: "alias", label: "Name" },
    { name: "enabled", label: "Aktiv", type: "checkbox" },
    { name: "trigger_entity", label: "Trigger Entity ID" },
    { name: "trigger_from", label: "Trigger from (optional)" },
    { name: "trigger_to", label: "Trigger to" },
    { name: "notify", label: "Benachrichtigung (persistent_notification, none)" },
    { name: "message", label: "Nachricht (optional)", type: "textarea", rows: 2 },
    { name: "enable_notfallmodus", label: "Notfallmodus aktivieren", type: "checkbox" },
  ];

  document.getElementById("btn-add-automation").addEventListener("click", () => {
    openFormDialog(
      "Automation hinzufügen",
      automationFields,
      { enabled: true, trigger_to: "on", notify: "persistent_notification", enable_notfallmodus: true },
      async (v) => {
        const entry = {
          id: v.id,
          alias: v.alias,
          enabled: v.enabled,
          trigger_entity: v.trigger_entity,
          trigger_to: v.trigger_to,
          notify: v.notify,
          enable_notfallmodus: v.enable_notfallmodus,
        };
        if (v.trigger_from) entry.trigger_from = v.trigger_from;
        if (v.message) entry.message = v.message;
        await saveApiFile("home-assistant", { ...ha, automations: [...ha.automations, entry] });
      },
    );
  });

  bindListActions(
    ha.automations,
    (i) => {
      openFormDialog("Automation bearbeiten", automationFields, ha.automations[i], async (v) => {
        const entry = {
          id: v.id,
          alias: v.alias,
          enabled: v.enabled,
          trigger_entity: v.trigger_entity,
          trigger_to: v.trigger_to,
          notify: v.notify,
          enable_notfallmodus: v.enable_notfallmodus,
        };
        if (v.trigger_from) entry.trigger_from = v.trigger_from;
        if (v.message) entry.message = v.message;
        await saveApiFile("home-assistant", {
          ...ha,
          automations: ha.automations.map((a, idx) => (idx === i ? entry : a)),
        });
      });
    },
    async (i) => {
      await saveApiFile("home-assistant", {
        ...ha,
        automations: ha.automations.filter((_, idx) => idx !== i),
      });
    },
    sectionContent.querySelector("#ha-automations"),
  );
}

init();
