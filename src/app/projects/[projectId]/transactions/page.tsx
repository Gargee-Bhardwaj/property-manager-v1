"use client";
import { useEffect, useState, useCallback } from "react";
import MainLayout from "../../../../components/MainLayout";
import { useAuth } from "../../../../lib/contexts/AuthContext";
import { useParams } from "next/navigation";
import {
  getTransactionsCreatedByMeApi,
  getTransactionsToApproveApi,
  getTransactionApprovalDetailsApi,
  voteOnTransactionApprovalApi,
} from "../../../../lib/apis/transactions";
import { getProjectDetails } from "../../../../lib/apis/auth";

// Type definition for a transaction
interface Transaction {
  id: string;
  target_model: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  initiated_by?: {
    full_name?: string;
    email?: string;
  };
  votes?: any[]; // Keep flexible for now
  field_values?: any;
  approved_at?: string;
}

interface TransactionApiResponse {
  data: Transaction[];
}

interface ProjectDetails {
  name: string;
}

interface Vote {
  id: string;
  user: {
    full_name: string;
  };
  approval_status: string;
  voted_at: string;
}

interface TransactionApproval {
  id: string;
  target_model: string;
  created_at: string;
  initiated_by: {
    full_name?: string;
    email?: string;
  };
  status: "pending" | "approved" | "rejected";
  votes: Vote[];
}

export default function TransactionsPage() {
  const { token, isLoading: authLoading } = useAuth();
  const params = useParams();
  const projectId = params.projectId as string;
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectName, setProjectName] = useState<string>("");

  const [createdByMe, setCreatedByMe] = useState<TransactionApproval[]>([]);
  const [toApprove, setToApprove] = useState<TransactionApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedApproval, setSelectedApproval] = useState<Transaction | null>(
    null
  );
  const [showApprovalDetailsModal, setShowApprovalDetailsModal] =
    useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const created = (await getTransactionsCreatedByMeApi(
        token,
        projectId
      )) as { data: TransactionApproval[] };
      const toApproveRes = (await getTransactionsToApproveApi(
        token,
        projectId
      )) as { data: TransactionApproval[] };
      setCreatedByMe(created.data);
      setToApprove(toApproveRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  }, [token, projectId]);

  useEffect(() => {
    const fetchProject = async () => {
      if (authLoading) return; // Wait until auth is loaded

      setProjectLoading(true);
      try {
        if (!token) throw new Error("No access token found");
        const project = (await getProjectDetails(
          token,
          projectId
        )) as ProjectDetails;
        setProjectName(project?.name || projectId);
      } catch {
        setProjectName(projectId);
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProject();
  }, [projectId, token, authLoading]);

  // Fetch transactions based on selected project from URL
  useEffect(() => {
    if (!authLoading) {
      fetchTransactions();
    }
  }, [projectId, token, success, authLoading, fetchTransactions]); // Re-fetch on project change (via URL) or successful vote

  const handleViewApprovalDetails = useCallback(
    async (approvalId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        if (!token) throw new Error("No access token found");
        const details = (await getTransactionApprovalDetailsApi(
          token,
          approvalId
        )) as Transaction;
        setSelectedApproval(details);
        setShowApprovalDetailsModal(true);
      } catch (err: any) {
        setError(err.message || "Failed to fetch approval details");
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const handleVote = useCallback(
    async (approvalStatus: "approved" | "rejected") => {
      if (!selectedApproval) return;
      setIsLoading(true);
      setSuccess(null);
      setError(null);
      try {
        if (!token) throw new Error("No access token found");
        await voteOnTransactionApprovalApi(
          token,
          selectedApproval.id,
          approvalStatus
        );
        setSuccess(`Transaction ${approvalStatus} successfully!`);
        setShowApprovalDetailsModal(false);
        setSelectedApproval(null);
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        setError(err.message || `Failed to ${approvalStatus} transaction`);
      } finally {
        setIsLoading(false);
      }
    },
    [token, selectedApproval]
  );

  const getStatusComponent = useCallback((status: string) => {
    let className = "px-2 py-1 text-xs rounded-full";
    switch (status) {
      case "approved":
        className += " bg-green-100 text-green-800";
        break;
      case "pending":
        className += " bg-yellow-100 text-yellow-800";
        break;
      case "rejected":
        className += " bg-red-100 text-red-800";
        break;
      default:
        className += " bg-gray-100 text-gray-800";
    }
    return <span className={className}>{status.toUpperCase()}</span>;
  }, []);

  if (authLoading || isLoading) {
    return <MainLayout>Loading transactions...</MainLayout>;
  }

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Projects", href: "/dashboard" },
        {
          label: projectLoading ? "Loading..." : projectName,
          href: `/projects/${projectId}`,
        },
        { label: "Transactions" },
      ]}
    >
      <h2 className="text-2xl font-bold mb-6">
        Transaction Approvals for: {projectName}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transactions Created by Me */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            Transactions Created by Me
          </h3>
          {isLoading ? (
            <p className="text-gray-500">Loading transactions...</p>
          ) : createdByMe.length === 0 ? (
            <p className="text-gray-500">
              No transactions created by you for this project.
            </p>
          ) : (
            <ul className="space-y-3">
              {createdByMe.map((tx) => (
                <li
                  key={tx.id}
                  className="p-3 border border-gray-200 rounded-md bg-gray-50"
                >
                  <p className="text-sm font-medium">Type: {tx.target_model}</p>
                  <p className="text-xs text-gray-600">Status: {tx.status}</p>
                  <p className="text-xs text-gray-600">
                    Created: {new Date(tx.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Transactions to Approve */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            Transactions to Approve
          </h3>
          {isLoading ? (
            <p className="text-gray-500">Loading transactions...</p>
          ) : toApprove.length === 0 ? (
            <p className="text-gray-500">
              No transactions awaiting your approval for this project.
            </p>
          ) : (
            <ul className="space-y-3">
              {toApprove.map((tx) => (
                <li
                  key={tx.id}
                  className="p-3 border border-gray-200 rounded-md bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition"
                  onClick={() => handleViewApprovalDetails(tx.id)}
                >
                  <p className="text-sm font-medium">Type: {tx.target_model}</p>
                  <p className="text-xs text-gray-600">Status: {tx.status}</p>
                  <p className="text-xs text-gray-600">
                    Initiated By:{" "}
                    {tx.initiated_by?.full_name ||
                      tx.initiated_by?.email ||
                      "Unknown"}
                  </p>
                  <p className="text-xs text-gray-600">
                    Created: {new Date(tx.created_at).toLocaleString()}
                  </p>
                  <span className="text-indigo-600 text-xs mt-1 block">
                    View Details
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Approval Details Modal */}
      {showApprovalDetailsModal && selectedApproval && (
        <div className="fixed inset-0 bg-opacity-50 min-h-[80vh] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-scroll relative shadow-xl mt-20">
            <button
              onClick={() => {
                setShowApprovalDetailsModal(false);
                setSelectedApproval(null);
                setError(null); // Clear any modal-specific errors
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">
              Transaction Approval Details
            </h3>

            {isLoading ? (
              <p className="text-gray-500">Loading details...</p>
            ) : (
              <div className="space-y-3">
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {getStatusComponent(selectedApproval.status)}
                </p>
                <p>
                  <span className="font-medium">Type:</span>{" "}
                  {selectedApproval.target_model}
                </p>
                <p>
                  <span className="font-medium">Initiated By:</span>{" "}
                  {selectedApproval.initiated_by?.full_name ||
                    selectedApproval.initiated_by?.email ||
                    "Unknown"}
                </p>
                <p>
                  <span className="font-medium">Created At:</span>{" "}
                  {new Date(selectedApproval.created_at).toLocaleString()}
                </p>
                {selectedApproval.approved_at && (
                  <p>
                    <span className="font-medium">Approved/Rejected At:</span>{" "}
                    {new Date(selectedApproval.approved_at).toLocaleString()}
                  </p>
                )}

                <h4 className="font-semibold text-md mt-4">Field Values:</h4>
                {selectedApproval.field_values &&
                Object.keys(selectedApproval.field_values).length > 0 ? (
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {Object.entries(selectedApproval.field_values).map(
                      ([key, value]) => (
                        <li key={key} className="text-sm">
                          <span className="font-medium">
                            {key.replace(/_/g, " ")}:
                          </span>{" "}
                          {String(value)}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No specific field values.
                  </p>
                )}
                {selectedApproval.votes &&
                  selectedApproval.votes.length > 0 && (
                    <>
                      <h4 className="font-semibold text-md mt-4">Votes:</h4>
                      <ul className="list-disc list-inside ml-4 space-y-2">
                        {selectedApproval.votes.map((vote: any) => (
                          <li key={vote.id} className="text-sm">
                            <span className="font-medium">
                              {vote.user?.full_name ||
                                vote.user?.email ||
                                "Unknown"}
                            </span>
                            : {vote.approval_status} on{" "}
                            {new Date(vote.voted_at).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => handleVote("approved")}
                    disabled={isLoading}
                    className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 font-medium"
                  >
                    {isLoading ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleVote("rejected")}
                    disabled={isLoading}
                    className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 font-medium"
                  >
                    {isLoading ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
