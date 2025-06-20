import { apiClient } from "../apiClient";

const BASE_URL = "https://hustle-jldf.onrender.com/api/v1";

export function getTransactionsCreatedByMeApi(
  token: string,
  projectId: string
) {
  return apiClient(
    `/projects/${projectId}/transaction-approvals/created-by-me`,
    { token }
  );
}

export function getTransactionsToApproveApi(token: string, projectId: string) {
  return apiClient(`/projects/${projectId}/transaction-approvals/to-approve`, {
    token,
  });
}

export function getTransactionApprovalDetailsApi(
  token: string,
  approvalId: string
) {
  return apiClient(`/transaction-approvals/${approvalId}`, { token });
}

export function voteOnTransactionApprovalApi(
  token: string,
  approvalId: string,
  approvalStatus: "approved" | "rejected"
) {
  return apiClient(
    `/transaction-approvals/${approvalId}/vote?approval_status=${approvalStatus}`,
    {
      method: "POST",
      token,
    }
  );
}

export const getPlotTransactionHistory = (token: string, plotId: string) => {
  return apiClient(`/plots/${plotId}/transaction-history/`, {
    token,
  });
};
