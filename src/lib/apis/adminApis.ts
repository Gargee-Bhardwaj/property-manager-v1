import { apiClient } from "../apiClient";

export function createUserApi(
  token: string,
  userData: {
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
    is_active?: boolean;
    is_superuser?: boolean;
  }
) {
  return apiClient("/users/", {
    method: "POST",
    token,
    body: userData,
  });
}

export function getUserByPhoneApi(token: string, phone: string) {
  return apiClient(`/users/phone/${phone}`, { token });
}

export function createProjectApi(
  token: string,
  projectData: {
    name: string;
    owner_id: string;
  }
) {
  return apiClient("/projects/", {
    method: "POST",
    token,
    body: projectData,
  });
}

export function getAllProjectsApi(token: string) {
  return apiClient("/projects/", { token });
}

export function addPartnerToProjectApi(
  token: string,
  projectId: string,
  partnerData: { user_id: string; role: string }
) {
  return apiClient(`/projects/${projectId}/partners`, {
    method: "POST",
    token,
    body: partnerData,
  });
}
