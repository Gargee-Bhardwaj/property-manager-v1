"use client";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import MainLayout from "../../../../components/MainLayout";
import { useAuth } from "../../../../lib/contexts/AuthContext";
import {
  generateUploadUrlApi,
  uploadFile,
  associateProjectDocumentApi,
  getProjectDocumentsApi,
} from "../../../../lib/apis/project";
import { getProjectDetails } from "../../../../lib/apis/auth";

interface ProjectDetails {
  name: string;
}

interface ProjectDocument {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

// Helper to format the filename
const formatFilename = (filename: string) => {
  const parts = filename.split("_");
  if (parts.length > 1) {
    return parts.slice(1).join("_");
  }
  return filename;
};

export default function ProjectDocumentsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [projectLoading, setProjectLoading] = useState(true);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  const fetchProjectDocuments = useCallback(async () => {
    if (!token) return;
    setLoadingDocuments(true);
    try {
      const response = (await getProjectDocumentsApi(token, projectId)) as {
        data: ProjectDocument[];
      };
      setDocuments(response.data);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setLoadingDocuments(false);
    }
  }, [token, projectId]);

  useEffect(() => {
    const fetchProject = async () => {
      setProjectLoading(true);
      try {
        if (!token) return;
        const project = (await getProjectDetails(
          token,
          projectId
        )) as ProjectDetails;
        setProjectName(project.name || projectId);
      } catch {
        setProjectName(projectId);
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProject();
    fetchProjectDocuments();
  }, [projectId, token, fetchProjectDocuments]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
      }
    },
    []
  );

  const handleUpload = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedFile) return;

      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      try {
        if (!token) throw new Error("Authentication token not found.");

        const { upload_url, unique_key } = (await generateUploadUrlApi(
          token,
          selectedFile.name,
          selectedFile.type
        )) as { upload_url: string; unique_key: string };

        await uploadFile(upload_url, selectedFile);

        await associateProjectDocumentApi(token, projectId, unique_key);

        setUploadSuccess("File uploaded successfully!");
        setSelectedFile(null);
      } catch (err: any) {
        setUploadError(err.message || "Failed to upload file.");
      } finally {
        setIsUploading(false);
        fetchProjectDocuments();
      }
    },
    [token, selectedFile, projectId, fetchProjectDocuments]
  );

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        {
          label: projectLoading ? "Loading..." : projectName,
          href: `/projects/${projectId}`,
        },
        { label: "Project Documents" },
      ]}
    >
      <h2 className="text-2xl font-bold mb-6">Project Documents</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Upload New Document</h3>
        <form onSubmit={handleUpload}>
          {uploadError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {uploadSuccess}
            </div>
          )}
          <div className="mb-4">
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300"
          >
            {isUploading ? "Uploading..." : "Upload Document"}
          </button>
        </form>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md overflow-y-auto max-h-[50vh]">
        <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
        {loadingDocuments ? (
          <p>Loading documents...</p>
        ) : documents.length === 0 ? (
          <p>No documents found.</p>
        ) : (
          <ul>
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="border-b py-2 flex justify-between items-center"
              >
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {formatFilename(doc.file_name)}
                </a>
                {/* <span className="text-sm text-gray-500">
                  {new Date(doc.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span> */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </MainLayout>
  );
}
