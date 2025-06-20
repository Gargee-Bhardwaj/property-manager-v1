import React from "react";

export interface PlotDocument {
  id: string;
  file_name: string;
  file_url?: string; // Optional because the API doesn't return it directly
}

interface ViewDocumentsModalProps {
  show: boolean;
  onClose: () => void;
  documents: PlotDocument[];
  plotNumber: number;
  isLoading: boolean;
  error: string | null;
}

export const ViewDocumentsModal: React.FC<ViewDocumentsModalProps> = ({
  show,
  onClose,
  documents,
  plotNumber,
  isLoading,
  error,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="bg-gray-200 p-6 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            Documents for Plot #{plotNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {isLoading ? (
          <p>Loading documents...</p>
        ) : documents.length === 0 ? (
          <p>No documents found for this plot.</p>
        ) : (
          <ul className="list-disc pl-5">
            {documents.map((doc) => (
              <li key={doc.file_name} className="mb-2">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {doc.file_name}
                </a>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
