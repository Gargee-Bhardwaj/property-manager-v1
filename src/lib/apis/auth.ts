const BASE_URL = "https://hustle-jldf.onrender.com/api/v1";

export async function loginApi(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/login/access-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "password",
      username: email,
      password: password,
      scope: "",
      client_id: "string",
      client_secret: "string",
    }).toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Login failed");
  }

  return response.json(); // { access_token, token_type }
}

export async function getUserProfileApi(token: string) {
  const response = await fetch(`${BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return response.json();
}

export async function getMyProjectsApi(token: string) {
  const response = await fetch(`${BASE_URL}/projects/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  const data = await response.json();
  console.log(data, "response in getMyProjectsApi");
  return data;
}

export async function getProjectPlotsApi(token: string, projectId: string) {
  const response = await fetch(`${BASE_URL}/projects/${projectId}/plots`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch plots");
  }
  return response.json();
}

export async function getProjectDetails(token: string, projectId: string) {
  const response = await fetch(`${BASE_URL}/projects/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch project details");
  return response.json();
}

// create plot
// export async function createPlotApi(
//   token: string,
//   projectId: string,
//   plotData: {
//     plot_status: string;
//     area: number;
//     price: number;
//     number_of_plots: number;
//   }
// ) {
//   const response = await fetch(`${BASE_URL}/projects/${projectId}/plots`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(plotData),
//   });

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => null);
//     throw new Error(errorData?.detail || "Failed to create plot");
//   }

//   return response.json();
// }

export async function createPlotApi(
  token: string,
  projectId: string,
  plotData: {
    plot_status: string;
    area: number;
    price: number;
    number_of_plots: number;
  }
) {
  const response = await fetch(`${BASE_URL}/projects/${projectId}/plots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(plotData),
  });

  console.log("Sending plot data: in api", plotData);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    // Handle validation errors specifically
    if (response.status === 422 && errorData?.detail) {
      const validationErrors = errorData.detail
        .map((err: any) => err.msg)
        .join(", ");
      throw new Error(validationErrors || "Validation failed");
    }
    throw new Error(errorData?.detail || "Failed to create plot");
  }

  return response.json();
}

// export const getPlotsApi = async (token: string, projectId: string) => {
//   const response = await fetch(`${BASE_URL}/projects/${projectId}/plots`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   if (!response.ok) {
//     throw new Error("Failed to fetch plots");
//   }
//   return response.json();
// };
