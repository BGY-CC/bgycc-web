import { API_CONFIG, readJson } from "../api";

export interface OnboardingStep {
  id: string;
  type: string;
  title: string;
  description: string;
  video_url?: string;
  text?: string;
  is_mandatory: boolean;
  order: number;
}

export interface OnboardingFlow {
  id: string | null;
  steps: OnboardingStep[];
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateFlowInput {
  steps: OnboardingStep[];
  consent_text?: string;
  vision_text?: string;
  welcome_video_url?: string;
  description?: string;
  is_active?: boolean;
}

export interface OnboardingVersion {
  id: string;
  flow_id: string;
  steps: OnboardingStep[];
  version: number;
  description: string | null;
  created_at: string;
  created_by: string | null;
  creator: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

export const onboardingService = {
  getFlow: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/onboarding/flow`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return readJson<{ success: boolean; data: OnboardingFlow }>(response);
  },

  updateFlow: async (input: UpdateFlowInput) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/onboarding/flow`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });
    return readJson<{ success: boolean; data: { message: string; flow: OnboardingFlow } }>(response);
  },

  getVersions: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/onboarding/versions`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return readJson<{ success: boolean; data: { versions: OnboardingVersion[] } }>(response);
  },

  rollbackVersion: async (versionId: string) => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/onboarding/versions/${versionId}/rollback`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return readJson<{ success: boolean; data: { message: string; flow: OnboardingFlow } }>(response);
  },
};