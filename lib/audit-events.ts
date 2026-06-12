export const ADMIN_MUTATION_EVENT = "bgycc:admin-mutation-complete";

export function notifyAdminMutation(endpoint: string, method: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(ADMIN_MUTATION_EVENT, {
      detail: { endpoint, method },
    }),
  );
}
