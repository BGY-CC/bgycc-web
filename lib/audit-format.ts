const RESOURCE_LABELS: Record<string, string> = {
  clubs: "club",
  profiles: "profile",
  users: "user",
  pathways: "pathway",
  checklist: "checklist item",
  resources: "resource category",
  "detailed-resources": "resource",
  community: "announcement",
  curriculum: "curriculum item",
  quotes: "quote",
  support: "support ticket",
  notifications: "notification",
  "access-management": "user access",
};

export function formatAuditResource(value: string | null) {
  const resource = value || "unknown resource";
  return resource.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatAuditStatement(
  actorName: string,
  action: string,
  resourceType: string | null,
  resourceName?: string | null,
) {
  const resource = RESOURCE_LABELS[resourceType || ""] || (resourceType || "record").replaceAll("-", " ");
  const namedResource = resourceName ? ` ${resourceName}` : "";

  if (action === "create") return `${actorName} created a new ${resource}${namedResource}`;
  if (action === "update") return `${actorName} updated ${resource}${namedResource}`;
  if (action === "delete") return `${actorName} deleted ${resource}${namedResource}`;
  return `${actorName} ${action.replaceAll("_", " ")} ${resource}${namedResource}`;
}

export function isAuditDateInRange(
  createdAt: string,
  from?: string,
  to?: string,
  timeZone = "Africa/Lagos",
) {
  if (!from && !to) return true;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(createdAt));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const date = `${values.year}-${values.month}-${values.day}`;
  return (!from || date >= from) && (!to || date <= to);
}
