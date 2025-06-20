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

// Update plot
export async function updatePlotApi(
  token: string,
  plotId: string,
  plotData: {
    plot_status?: string;
    area?: number;
    price?: number;
  }
) {
  const response = await fetch(`${BASE_URL}/plots/${plotId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(plotData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    // Handle validation errors specifically
    if (response.status === 422 && errorData?.detail) {
      const validationErrors = errorData.detail
        .map((err: any) => err.msg)
        .join(", ");
      throw new Error(validationErrors || "Validation failed");
    }
    throw new Error(errorData?.detail || "Failed to update plot");
  }

  return response.json();
}

// Sell plot
export async function sellPlotApi(
  token: string,
  plotId: string,
  sellData: {
    amount_collected: number;
    sold_on_date: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    is_emi?: boolean;
    emi_amount?: number;
    emi_start_date?: string;
    emi_frequency_months?: number;
  }
) {
  const response = await fetch(`${BASE_URL}/plots/${plotId}/sell`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(sellData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 422 && errorData?.detail) {
      const validationErrors = errorData.detail
        .map((err: any) => err.msg)
        .join(", ");
      throw new Error(validationErrors || "Validation failed");
    }
    throw new Error(errorData?.detail || "Failed to sell plot");
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

export async function getPlotEmiDetails(token: string, plotId: string) {
  const response = await fetch(`${BASE_URL}/plots/${plotId}/emis`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to fetch EMI details");
  }

  return response.json();
}

export async function markEmiAsPaid(
  token: string,
  plotId: string,
  emiId: string
) {
  const response = await fetch(
    `${BASE_URL}/plots/${plotId}/emi/${emiId}/mark-as-paid`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to mark EMI as paid");
  }

  return response.json();
}

export async function getProjectPartners(token: string, projectId: string) {
  const response = await fetch(`${BASE_URL}/projects/${projectId}/partners`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch project partners");
  }
  return response.json();
}

export async function getAmountCollectedByPartner(
  token: string,
  projectId: string
) {
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/plots/summary/amount-collected-by-partner`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || "Failed to fetch amount collected by partner"
    );
  }
  return response.json();
}

export async function getAmountSpentByPartner(
  token: string,
  projectId: string
) {
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/expenses/summary/amount-spent-by-partner`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || "Failed to fetch amount spent by partner"
    );
  }
  return response.json();
}

export async function getTransactionApprovals(
  token: string,
  projectId: string,
  partnerId?: string
) {
  const url = new URL(
    `${BASE_URL}/projects/${projectId}/transaction-approvals`
  );
  if (partnerId) {
    url.searchParams.append("partner_id", partnerId);
  }
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || "Failed to fetch transaction approvals"
    );
  }
  return response.json();
}

export async function voteOnTransactionApprovalApi(
  token: string,
  approvalId: string,
  status: "approved" | "rejected"
) {
  const response = await fetch(
    `${BASE_URL}/transaction-approvals/${approvalId}/vote`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to vote on transaction`);
  }
  return response.json();
}
