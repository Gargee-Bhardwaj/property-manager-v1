const BASE_URL = "https://hustle-jldf.onrender.com/api/v1";

export async function getTransactionsCreatedByMeApi(
  token: string,
  projectId: string
) {
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/transaction-approvals/created-by-me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail || "Failed to fetch transactions created by me"
    );
  }

  return response.json();
}

export async function getTransactionsToApproveApi(
  token: string,
  projectId: string
) {
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/transaction-approvals/to-approve`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail || "Failed to fetch transactions to approve"
    );
  }

  return response.json();
}

export async function getTransactionApprovalDetailsApi(
  token: string,
  approvalId: string
) {
  const response = await fetch(
    `${BASE_URL}/transaction-approvals/${approvalId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail || "Failed to fetch transaction approval details"
    );
  }

  return response.json();
}

export async function voteOnTransactionApprovalApi(
  token: string,
  approvalId: string,
  approvalStatus: "approved" | "rejected"
) {
  const response = await fetch(
    `${BASE_URL}/transaction-approvals/${approvalId}/vote?approval_status=${approvalStatus}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 422 && errorData?.detail) {
      const validationErrors = Array.isArray(errorData.detail)
        ? errorData.detail.map((err: any) => err.msg).join(", ")
        : errorData.detail;
      throw new Error(validationErrors || "Validation failed");
    }
    throw new Error(errorData?.detail || "Failed to vote on approval");
  }

  return response.json();
}

export const getPlotTransactionHistory = async (
  token: string,
  plotId: string
) => {
  const response = await fetch(
    `${BASE_URL}/api/v1/plots/${plotId}/transaction-history/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch transaction history");
  }

  return response.json();
};
