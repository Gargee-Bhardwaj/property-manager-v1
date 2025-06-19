import React from "react";

interface Transaction {
  id: string;
  status: string;
  created_at: string;
  amount?: number;
  initiated_by?: {
    full_name?: string;
    email?: string;
  };
  field_values?: {
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    amount_collected?: number;
    sold_on_date?: string;
    plot_status?: string;
    sold_by_user_id?: string;
    is_emi?: boolean;
    emi_amount?: number;
    emi_frequency_months?: number;
    emi_start_date?: string;
  };
  votes?: Array<{
    id: string;
    user?: {
      full_name?: string;
      email?: string;
    };
    approval_status: string;
    voted_at?: string;
  }>;
}

interface TransactionHistoryModalProps {
  show: boolean;
  onClose: () => void;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  plotNumber: number;
}

export const TransactionHistoryModal: React.FC<
  TransactionHistoryModalProps
> = ({ show, onClose, transactions, loading, error, plotNumber }) => {
  if (!show) return null;

  return (
    <div className="flex items-center justify-center w-full my-4 bg-white p-6 rounded-lg shadow-md border border-gray-200 relative">
      <div className="bg-white rounded-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            Transaction History for Plot #{plotNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div>Loading...</div>
        ) : transactions.length === 0 ? (
          <p>No transaction history found.</p>
        ) : (
          <div className="space-y-6">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg border-b pb-2">
                      Transaction Details
                    </h4>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          transaction.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.status.toUpperCase()}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Transaction ID:</span>{" "}
                      {transaction.id}
                    </p>
                    <p>
                      <span className="font-medium">Created At:</span>{" "}
                      {new Date(transaction.created_at).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Amount:</span> ₹
                      {transaction.amount?.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Initiated By:</span>{" "}
                      {transaction.initiated_by?.full_name ||
                        transaction.initiated_by?.email ||
                        "System"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg border-b pb-2">
                      Sale Information
                    </h4>
                    <p>
                      <span className="font-medium">Customer Name:</span>{" "}
                      {transaction.field_values?.customer_name || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Customer Email:</span>{" "}
                      {transaction.field_values?.customer_email || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Customer Phone:</span>{" "}
                      {transaction.field_values?.customer_phone || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Amount Collected:</span> ₹
                      {transaction.field_values?.amount_collected || "0"}
                    </p>
                    <p>
                      <span className="font-medium">Sold On:</span>{" "}
                      {transaction.field_values?.sold_on_date
                        ? new Date(
                            transaction.field_values.sold_on_date
                          ).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {transaction.votes && transaction.votes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-lg border-b pb-2">
                      Approval Votes
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Voted At
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transaction.votes.map((vote) => (
                            <tr key={vote.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {vote.user?.full_name ||
                                  vote.user?.email ||
                                  "Unknown"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    vote.approval_status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : vote.approval_status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {vote.approval_status.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {vote.voted_at
                                  ? new Date(vote.voted_at).toLocaleString()
                                  : "Not voted yet"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold border-b pb-1">Plot Status</h4>
                    <p>{transaction.field_values?.plot_status || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold border-b pb-1">Sold By</h4>
                    <p>{transaction.field_values?.sold_by_user_id || "N/A"}</p>
                  </div>
                  {transaction.field_values?.is_emi && (
                    <>
                      <div>
                        <h4 className="font-semibold border-b pb-1">
                          EMI Amount
                        </h4>
                        <p>₹{transaction.field_values.emi_amount || "0"}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold border-b pb-1">
                          EMI Frequency
                        </h4>
                        <p>
                          {transaction.field_values.emi_frequency_months || "0"}{" "}
                          months
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold border-b pb-1">
                          EMI Start Date
                        </h4>
                        <p>
                          {transaction.field_values.emi_start_date
                            ? new Date(
                                transaction.field_values.emi_start_date
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
