// Add these to your existing API functions
const BASE_URL = "https://hustle-jldf.onrender.com/api/v1";

export async function createUserApi(
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
  const response = await fetch(`${BASE_URL}/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    // Handle validation errors specifically
    if (response.status === 422 && errorData?.detail) {
      const validationErrors = Array.isArray(errorData.detail)
        ? errorData.detail.map((err: any) => err.msg).join(", ")
        : errorData.detail;
      throw new Error(validationErrors || "Validation failed");
    }
    throw new Error(errorData?.detail || "Failed to create user");
  }

  return response.json();
}

export async function getUserByPhoneApi(token: string, phone: string) {
  const response = await fetch(`${BASE_URL}/users/phone/${phone}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 422 && errorData?.detail) {
      const validationErrors = Array.isArray(errorData.detail)
        ? errorData.detail.map((err: any) => err.msg).join(", ")
        : errorData.detail;
      throw new Error(validationErrors || "Validation failed");
    }
    throw new Error(errorData?.detail || "User not found");
  }

  return response.json();
}

export async function createProjectApi(
  token: string,
  projectData: {
    name: string;
    owner_id: string;
  }
) {
  const response = await fetch(`${BASE_URL}/projects/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 422 && errorData?.detail) {
      const validationErrors = Array.isArray(errorData.detail)
        ? errorData.detail.map((err: any) => err.msg).join(", ")
        : errorData.detail;
      throw new Error(validationErrors || "Validation failed");
    }
    throw new Error(errorData?.detail || "Failed to create project");
  }

  return response.json();
}

export async function getAllProjectsApi(token: string) {
  const response = await fetch(`${BASE_URL}/projects`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to fetch projects");
  }

  return response.json();
}

export async function addPartnerToProjectApi(
  token: string,
  projectId: string,
  partnerData: { user_id: string; role: string }
) {
  const response = await fetch(`${BASE_URL}/projects/${projectId}/partners`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(partnerData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 422 && errorData?.detail) {
      const validationErrors = Array.isArray(errorData.detail)
        ? errorData.detail.map((err: any) => err.msg).join(", ")
        : errorData.detail;
      throw new Error(validationErrors || "Validation failed");
    }
    throw new Error(errorData?.detail || "Failed to add partner");
  }

  return response.json();
}
