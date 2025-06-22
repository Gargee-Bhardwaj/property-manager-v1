"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import MainLayout from "../../../../components/MainLayout";
import { useAuth } from "../../../../lib/contexts/AuthContext";
import {
  getProjectDetails,
  getProjectPartners,
  getAmountCollectedByPartner,
  getAmountSpentByPartner,
  getTransactionApprovals,
} from "../../../../lib/apis/auth";
import { voteOnTransactionApprovalApi } from "../../../../lib/apis/transactions";

interface Partner {
  id: string;
  email: string;
  full_name: string;
  phone: string;
}

interface PartnerResponse {
  data: Partner[];
}

interface AmountResponse {
  data: { id: string; amount_collected?: number; amount_spent?: number }[];
  total_amount_collected?: number;
  total_amount_spent?: number;
}

interface ProjectDetails {
  name: string;
}

interface Vote {
  id: string;
  user_id: string;
  approval_status: "pending" | "approved" | "rejected";
  user: {
    full_name: string;
  };
}

interface TransactionApproval {
  id: string;
  target_model: string;
  field_values: any;
  status: "pending" | "approved" | "rejected";
  initiated_by: {
    full_name: string;
  };
  amount: number;
  votes: Vote[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF1943",
];

export default function PartnerDetailsPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const projectId = params.projectId as string;

  const [projectLoading, setProjectLoading] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [amountCollected, setAmountCollected] = useState<{
    [key: string]: number;
  }>({});
  const [amountSpent, setAmountSpent] = useState<{ [key: string]: number }>({});
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalCollected, setTotalCollected] = useState(0);
  const [transactions, setTransactions] = useState<TransactionApproval[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState<string | null>(null);
  const [voteSuccessTrigger, setVoteSuccessTrigger] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (authLoading || !token || !projectId) return;

      setLoading(true);
      setError(null);
      try {
        const [projectDetails, partnersRes, collectedRes, spentRes] =
          await Promise.all([
            getProjectDetails(token, projectId) as Promise<ProjectDetails>,
            getProjectPartners(token, projectId) as Promise<PartnerResponse>,
            getAmountCollectedByPartner(
              token,
              projectId
            ) as Promise<AmountResponse>,
            getAmountSpentByPartner(
              token,
              projectId
            ) as Promise<AmountResponse>,
          ]);

        console.log("Project Details:", projectDetails);
        console.log("Partners Response:", partnersRes);
        console.log("Amount Collected Response:", collectedRes);
        console.log("Amount Spent Response:", spentRes);

        const collectedData = (collectedRes?.data || []).reduce(
          (
            acc: { [key: string]: number },
            curr: { id: string; amount_collected: number }
          ) => {
            acc[curr.id] = curr.amount_collected;
            return acc;
          },
          {}
        );

        const spentData = (spentRes?.data || []).reduce(
          (
            acc: { [key: string]: number },
            curr: { id: string; amount_spent: number }
          ) => {
            acc[curr.id] = curr.amount_spent;
            return acc;
          },
          {}
        );

        setProjectName(projectDetails?.name || projectId);
        setPartners(partnersRes?.data || []);
        setAmountCollected(collectedData);
        setAmountSpent(spentData);
        setTotalSpent(spentRes?.total_amount_spent || 0);
        setTotalCollected(collectedRes?.total_amount_collected || 0);

        // Set current user as default selected partner
        const currentUserAsPartner = (partnersRes?.data || []).find(
          (p: Partner) => p.id === user?.id
        );
        setSelectedPartner(currentUserAsPartner || null);
        console.log("Current User as Partner:", currentUserAsPartner);
      } catch (err: any) {
        setError(err.message || "Failed to fetch partner details");
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
        setProjectLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, token, authLoading, user]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!token || !projectId) {
        setTransactions([]);
        return;
      }
      setTransactionsLoading(true);
      try {
        const res: any = await getTransactionApprovals(token, projectId);
        const transactionsData = res?.data || res || [];
        setTransactions(
          Array.isArray(transactionsData) ? transactionsData : []
        );
      } catch (err: any) {
        console.error("Failed to fetch transactions:", err);
        setTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };
    fetchTransactions();
  }, [token, projectId, voteSuccessTrigger]);

  const pieChartData = useMemo(() => {
    if (!selectedPartner) {
      const data = partners
        .map((partner) => ({
          name: partner.full_name || partner.email,
          value: amountCollected[partner.id] || 0,
        }))
        .filter((p) => p.value > 0);
      console.log("Pie Chart Data (All Partners):", data);
      return data;
    }

    const partnerCollected = amountCollected[selectedPartner.id] || 0;
    const othersCollected = totalCollected - partnerCollected;

    if (totalCollected === 0) {
      return [];
    }

    const data = [
      {
        name: selectedPartner.full_name || selectedPartner.email,
        value: partnerCollected,
      },
      { name: "Other Partners", value: othersCollected },
    ];

    console.log("Pie Chart Data (Partner vs Others):", data);
    return data;
  }, [selectedPartner, partners, amountCollected, totalCollected]);

  const barChartData = useMemo(() => {
    const partnerSpent = selectedPartner
      ? amountSpent[selectedPartner.id] || 0
      : 0;
    const partnerName = selectedPartner
      ? selectedPartner.full_name || selectedPartner.email
      : "Partner";

    const data = [
      { name: "Total Project Spent", amount: totalSpent },
      { name: `Spent by: ${partnerName}`, amount: partnerSpent },
    ];
    console.log("Bar Chart Data:", data);
    return data;
  }, [selectedPartner, amountSpent, totalSpent]);

  const selectedPartnerData = useMemo(() => {
    if (!selectedPartner) {
      console.log("No selected partner");
      return { collected: 0, spent: 0 };
    }
    const data = {
      collected: amountCollected[selectedPartner.id] || 0,
      spent: amountSpent[selectedPartner.id] || 0,
    };
    console.log("Selected Partner Data:", data);
    return data;
  }, [selectedPartner, amountCollected, amountSpent]);

  const handleVote = async (
    approvalId: string,
    approvalStatus: "approved" | "rejected"
  ) => {
    setIsVoting(approvalId);
    try {
      if (!token) throw new Error("No access token found");
      await voteOnTransactionApprovalApi(token, approvalId, approvalStatus);
      setVoteSuccessTrigger((prev) => !prev); // Trigger re-fetch
    } catch (err: any) {
      console.error(`Failed to ${approvalStatus} transaction`, err);
      setError(err.message || "Failed to submit vote");
    } finally {
      setIsVoting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderTransactionDetails = (tx: TransactionApproval) => {
    const { target_model, field_values, amount } = tx;
    if (target_model === "Expense") {
      return `Expense: ${
        field_values.description
      } (₹${amount.toLocaleString()})`;
    }
    if (target_model === "Plot") {
      return `Plot Sale: ${
        field_values.customer_name
      } (₹${amount.toLocaleString()})`;
    }
    if (target_model === "PlotEMI") {
      return `EMI Payment (₹${amount.toLocaleString()})`;
    }
    return `${target_model} (₹${amount.toLocaleString()})`;
  };

  if (projectLoading || loading) {
    return (
      <MainLayout>
        <div>Loading...</div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-red-500">{error}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        {
          label: projectName,
          href: `/projects/${projectId}`,
        },
        { label: "Partner Details" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Partner Details</h2>
          <div className="w-64">
            <select
              value={selectedPartner?.id || ""}
              onChange={(e) => {
                const partner = partners.find((p) => p.id === e.target.value);
                setSelectedPartner(partner || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="" disabled>
                -- Select a Partner --
              </option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.full_name || partner.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h4 className="text-lg font-semibold text-gray-600">
              Total Project Amount Collected
            </h4>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ₹{totalCollected.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h4 className="text-lg font-semibold text-gray-600">
              Total Project Amount Spent
            </h4>
            <p className="text-3xl font-bold text-red-600 mt-2">
              ₹{totalSpent.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-4 text-center">
              {selectedPartner
                ? `Amount Collected: ${
                    selectedPartner.full_name || selectedPartner.email
                  } vs Others`
                : "Amount Collected By All Partners"}
            </h3>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No collection data available.
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-4 text-center">
              Amount Spent Comparison
            </h3>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="amount" maxBarSize={80}>
                  {barChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 1 ? "#0088FE" : "#82ca9d"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {selectedPartner && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h4 className="text-lg font-semibold text-gray-600">
                Amount Collected by{" "}
                {selectedPartner.full_name || selectedPartner.email}
              </h4>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ₹{selectedPartnerData.collected.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h4 className="text-lg font-semibold text-gray-600">
                Amount Spent by{" "}
                {selectedPartner.full_name || selectedPartner.email}
              </h4>
              <p className="text-3xl font-bold text-red-600 mt-2">
                ₹{selectedPartnerData.spent.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h3 className="text-xl font-bold mb-4 text-center">
            Transaction Approvals
          </h3>
          {transactionsLoading ? (
            <p className="text-center text-gray-500">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center text-gray-500">
              No pending transactions for the project.
            </p>
          ) : (
            <div className="overflow-auto max-h-[50vh]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Initiated By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Votes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => {
                    const currentUserVote = tx.votes.find(
                      (v) => v.user_id === user?.id
                    );
                    const canVote =
                      tx.status === "pending" &&
                      currentUserVote?.approval_status === "pending";

                    return (
                      <tr key={tx.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {renderTransactionDetails(tx)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tx.initiated_by.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              tx.status
                            )}`}
                          >
                            {tx.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tx.votes
                            .map(
                              (v) => `${v.user.full_name}: ${v.approval_status}`
                            )
                            .join(", ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {canVote ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleVote(tx.id, "approved")}
                                disabled={isVoting === tx.id}
                                className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                              >
                                {isVoting === tx.id
                                  ? "Approving..."
                                  : "Approve"}
                              </button>
                              <button
                                onClick={() => handleVote(tx.id, "rejected")}
                                disabled={isVoting === tx.id}
                                className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                              >
                                {isVoting === tx.id ? "Rejecting..." : "Reject"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500">
                              {currentUserVote
                                ? `Voted: ${currentUserVote.approval_status}`
                                : "N/A"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
