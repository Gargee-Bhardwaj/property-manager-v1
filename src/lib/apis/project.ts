import { apiClient } from "../apiClient";

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

export async function uploadFile(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });
  if (!response.ok) {
    throw new Error("File upload failed");
  }
}

export function associateProjectDocumentApi(
  token: string,
  projectId: string,
  uniqueKey: string
) {
  return apiClient(`/projects/${projectId}/project-document`, {
    method: "POST",
    token,
    body: { file_name: uniqueKey },
  });
}

export function getProjectDocumentsApi(token: string, projectId: string) {
  return apiClient(`/projects/${projectId}/project-document`, { token });
}
