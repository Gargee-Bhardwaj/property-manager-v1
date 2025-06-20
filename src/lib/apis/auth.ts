import { apiClient } from "../apiClient";

const BASE_URL = "https://hustle-jldf.onrender.com/api/v1";

export function loginApi(email: string, password: string) {
  const body = new URLSearchParams({
    grant_type: "password",
    username: email,
    password: password,
    scope: "",
    client_id: "string",
    client_secret: "string",
  });

  return apiClient("/login/access-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  });
}

export function getUserProfileApi(token: string) {
  return apiClient("/users/me", { token });
}

export function getMyProjectsApi(token: string) {
  return apiClient("/projects/my", { token });
}

export function getProjectPlotsApi(token: string, projectId: string) {
  return apiClient(`/projects/${projectId}/plots`, { token });
}

export function getProjectDetails(token: string, projectId: string) {
  return apiClient(`/projects/${projectId}`, { token });
}

export function createPlotApi(
  token: string,
  projectId: string,
  plotData: {
    plot_status: string;
    area: number;
    price: number;
    number_of_plots: number;
  }
) {
  return apiClient(`/projects/${projectId}/plots`, {
    method: "POST",
    token,
    body: plotData,
  });
}

export function updatePlotApi(
  token: string,
  plotId: string,
  plotData: {
    plot_status?: string;
    area?: number;
    price?: number;
  }
) {
  return apiClient(`/plots/${plotId}`, {
    method: "PUT",
    token,
    body: plotData,
  });
}

export function sellPlotApi(
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
  return apiClient(`/plots/${plotId}/sell`, {
    method: "POST",
    token,
    body: sellData,
  });
}

export function getPlotEmiDetails(token: string, plotId: string) {
  return apiClient(`/plots/${plotId}/emis`, { token });
}

export function markEmiAsPaid(token: string, plotId: string, emiId: string) {
  return apiClient(`/plots/${plotId}/emi/${emiId}/mark-as-paid`, {
    method: "GET",
    token,
  });
}

export function getProjectPartners(token: string, projectId: string) {
  return apiClient(`/projects/${projectId}/partners`, { token });
}

export function getAmountCollectedByPartner(token: string, projectId: string) {
  return apiClient(
    `/projects/${projectId}/plots/summary/amount-collected-by-partner`,
    { token }
  );
}

export function getAmountSpentByPartner(token: string, projectId: string) {
  return apiClient(
    `/projects/${projectId}/expenses/summary/amount-spent-by-partner`,
    { token }
  );
}

export function getTransactionApprovals(
  token: string,
  projectId: string,
  partnerId?: string
) {
  const url = new URL(
    `https://hustle-jldf.onrender.com/api/v1/projects/${projectId}/transaction-approvals`
  );
  if (partnerId) {
    url.searchParams.append("partner_id", partnerId);
  }
  // The apiClient prepends BASE_URL, so we just need the path and query params
  const endpoint = `/projects/${projectId}/transaction-approvals${
    partnerId ? `?partner_id=${partnerId}` : ""
  }`;
  return apiClient(endpoint, { token });
}

export function getPlotsSummaryByStatus(token: string, projectId: string) {
  return apiClient(`/projects/${projectId}/plots/summary/count-by-status`, {
    token,
  });
}

export function getNetWorthByPartner(token: string, projectId: string) {
  return apiClient(`/projects/${projectId}/summary/net-amount-by-partner`, {
    token,
  });
}

export function getEmiSummaryByStatus(token: string, projectId: string) {
  return apiClient(
    `/projects/${projectId}/plots/emis/summary/count-by-status`,
    { token }
  );
}

export function getPlotsSoldByMonth(token: string, projectId: string) {
  return apiClient(
    `/projects/${projectId}/plots/summary/count-by-sold-by-month`,
    { token }
  );
}

export function addAmountToPlotApi(
  token: string,
  plotId: string,
  amount: number
) {
  return apiClient(`/plots/${plotId}/add-amount`, {
    method: "POST",
    token,
    body: { amount_collected: amount },
  });
}

export function generateUploadUrlApi(
  token: string,
  filename: string,
  contentType: string
) {
  return apiClient(`/files/generate-upload-url`, {
    method: "POST",
    token,
    body: { filename: filename, content_type: contentType },
  });
}

export function associatePlotDocumentApi(
  token: string,
  plotId: string,
  uniqueKey: string
) {
  return apiClient(`/plots/${plotId}/plot-document`, {
    method: "POST",
    token,
    body: { file_name: uniqueKey },
  });
}

export async function uploadFile(uploadUrl: string, file: File) {
  console.log(
    `Making PUT request to pre-signed URL with file type: ${file.type}`
  );
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "Direct upload to storage failed. Status:",
      response.status,
      "Response:",
      errorText
    );
    throw new Error(
      `File upload to storage failed with status ${response.status}.`
    );
  }
  console.log("Direct upload to storage was successful.");
  return response;
}

export function getPlotDocumentsApi(token: string, plotId: string) {
  return apiClient(`/plots/${plotId}/plot-document`, { token });
}
