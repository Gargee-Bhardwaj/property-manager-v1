interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  token?: string;
  body?: any;
  headers?: HeadersInit;
  isFormData?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { method = "GET", token, body, headers: customHeaders } = options;
  const BASE_URL = "https://hustle-jldf.onrender.com/api/v1";

  const headers: HeadersInit = {
    accept: "application/json",
    ...customHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (body && !headers["Content-Type"] && !options.isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    if (options.isFormData) {
      config.body = body;
    } else if (headers["Content-Type"] === "application/json") {
      config.body = JSON.stringify(body);
    } else {
      config.body = body;
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage =
      errorData.detail || `Request failed with status ${response.status}`;

    if (response.status === 422 && Array.isArray(errorData.detail)) {
      errorMessage = errorData.detail.map((err: any) => err.msg).join(", ");
    }

    throw new Error(errorMessage);
  }

  // Handle empty responses
  if (
    response.status === 204 ||
    response.headers.get("Content-Length") === "0"
  ) {
    return {} as T;
  }

  // Handle non-JSON responses gracefully
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    // Assuming a successful response that isn't JSON doesn't need to be parsed.
    // Or, if you expect text, you could use response.text()
    return {} as T;
  }

  return response.json();
}
