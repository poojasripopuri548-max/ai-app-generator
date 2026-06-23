import { z } from "zod";

const inputTypes = ["text", "email", "number", "password", "date", "textarea", "select", "checkbox"] as const;
const pageTypes = ["form", "table", "dashboard"] as const;

const fieldSchema = z.object({
  name: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1).optional(),
  type: z.string().trim().optional(),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

const entitySchema = z.object({
  name: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1).optional(),
  fields: z.array(fieldSchema).optional(),
});

const pageSchema = z.object({
  id: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).optional(),
  type: z.string().trim().optional(),
  entity: z.string().trim().optional(),
});

const workflowSchema = z.object({
  name: z.string().trim().min(1).optional(),
  trigger: z.enum(["create", "update", "delete"]).optional(),
  action: z.enum(["notify"]).optional(),
  message: z.string().trim().min(1).optional(),
});

const configSchema = z.object({
  title: z.string().trim().min(1).optional(),
  appName: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  locale: z.string().trim().optional(),
  entities: z.array(entitySchema).optional(),
  pages: z.array(pageSchema).optional(),
  fields: z.array(fieldSchema).optional(),
  workflows: z.array(workflowSchema).optional(),
});

export type RuntimeField = {
  name: string;
  label: string;
  type: (typeof inputTypes)[number];
  required: boolean;
  options: string[];
  defaultValue?: string | number | boolean;
  warning?: string;
};

export type RuntimeEntity = {
  name: string;
  label: string;
  fields: RuntimeField[];
};

export type RuntimePage = {
  id: string;
  title: string;
  type: (typeof pageTypes)[number] | "unknown";
  entity: string;
  warning?: string;
};

export type RuntimeWorkflow = {
  name: string;
  trigger: "create" | "update" | "delete";
  action: "notify";
  message: string;
};

export type RuntimeConfig = {
  title: string;
  description: string;
  locale: string;
  entities: RuntimeEntity[];
  pages: RuntimePage[];
  workflows: RuntimeWorkflow[];
  warnings: string[];
};

function slugify(value: string, fallback: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return slug || fallback;
}

function normalizeField(field: z.infer<typeof fieldSchema>, index: number): RuntimeField {
  const label = field.label || field.name || `Field ${index + 1}`;
  const rawType = field.type || "text";
  const type = inputTypes.includes(rawType as RuntimeField["type"])
    ? (rawType as RuntimeField["type"])
    : "text";

  return {
    name: slugify(field.name || label, `field_${index + 1}`),
    label,
    type,
    required: Boolean(field.required),
    options: field.options?.filter(Boolean) || [],
    defaultValue: field.defaultValue,
    warning: type !== rawType ? `Unknown field type "${rawType}" was rendered as text.` : undefined,
  };
}

export function normalizeConfig(input: unknown): RuntimeConfig {
  const parsed = configSchema.safeParse(input);
  const warnings: string[] = [];

  if (!parsed.success) {
    return {
      title: "Untitled Runtime",
      description: "The configuration could not be parsed into a supported app.",
      locale: "en",
      entities: [],
      pages: [],
      workflows: [],
      warnings: ["Configuration shape is invalid. Fix the JSON and the runtime will recover."],
    };
  }

  const raw = parsed.data;
  const legacyEntity = raw.fields
    ? [{ name: "submissions", label: raw.title || "Submissions", fields: raw.fields }]
    : [];

  const entities = (raw.entities?.length ? raw.entities : legacyEntity).map((entity, entityIndex) => {
    const label = entity.label || entity.name || `Entity ${entityIndex + 1}`;
    const fields = (entity.fields || []).map(normalizeField);

    fields.forEach((field) => {
      if (field.warning) warnings.push(`${label}: ${field.warning}`);
    });

    return {
      name: slugify(entity.name || label, `entity_${entityIndex + 1}`),
      label,
      fields,
    };
  });

  const fallbackEntity = entities[0]?.name || "submissions";
  const pages: RuntimePage[] = (raw.pages?.length
    ? raw.pages
    : [
        { id: "create", title: "Create Record", type: "form", entity: fallbackEntity },
        { id: "records", title: "Records", type: "table", entity: fallbackEntity },
        { id: "insights", title: "Insights", type: "dashboard", entity: fallbackEntity },
      ]).map((page, index) => {
    const requestedType = page.type || "form";
    const type = pageTypes.includes(requestedType as (typeof pageTypes)[number])
      ? (requestedType as (typeof pageTypes)[number])
      : "unknown";
    const warning = type === "unknown" ? `Unknown page type "${requestedType}".` : undefined;

    if (warning) warnings.push(warning);

    return {
      id: page.id || `page_${index + 1}`,
      title: page.title || `Page ${index + 1}`,
      type,
      entity: page.entity || fallbackEntity,
      warning,
    };
  });

  return {
    title: raw.appName || raw.title || "Generated Application",
    description: raw.description || "A metadata-driven application generated from JSON configuration.",
    locale: raw.locale || "en",
    entities,
    pages,
    workflows: (raw.workflows || []).map((workflow, index) => ({
      name: workflow.name || `Workflow ${index + 1}`,
      trigger: workflow.trigger || "create",
      action: workflow.action || "notify",
      message: workflow.message || "Workflow completed successfully.",
    })),
    warnings,
  };
}

export function parseConfigJson(json: string): { config: RuntimeConfig; parsed: unknown | null; error?: string } {
  try {
    const parsed = JSON.parse(json);
    return { parsed, config: normalizeConfig(parsed) };
  } catch {
    return {
      parsed: null,
      error: "Invalid JSON syntax. The preview is paused until the JSON is valid.",
      config: normalizeConfig(null),
    };
  }
}

export function coerceRecord(entity: RuntimeEntity, input: Record<string, unknown>) {
  const output: Record<string, string | number | boolean | null> = {};
  const errors: Record<string, string> = {};

  for (const field of entity.fields) {
    const value = input[field.name] ?? field.defaultValue ?? "";

    if (field.required && (value === "" || value === null || value === undefined)) {
      errors[field.name] = `${field.label} is required.`;
      continue;
    }

    if (field.type === "number") {
      output[field.name] = value === "" ? null : Number(value);
      if (value !== "" && Number.isNaN(output[field.name])) {
        errors[field.name] = `${field.label} must be a number.`;
      }
    } else if (field.type === "checkbox") {
      output[field.name] = Boolean(value);
    } else {
      output[field.name] = value === undefined || value === null ? "" : String(value);
    }
  }

  return { data: output, errors };
}
