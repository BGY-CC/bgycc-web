const ACTION_LABELS: Record<string, string> = {
  create: "create",
  update: "update",
  delete: "delete",
};

export function formatAuditResource(value: string | null) {
  const resource = value || "unknown resource";
  return resource.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatAuditStatement(
  actorName: string,
  action: string,
  resourceType: string | null,
) {
  const actionLabel = ACTION_LABELS[action] || action.replaceAll("_", " ");
  return `${actorName} performed the ${actionLabel} action on ${formatAuditResource(resourceType)}`;
}
