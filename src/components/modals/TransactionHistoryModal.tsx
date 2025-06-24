import React from "react";

interface Transaction {
  id: string;
  created_at: string;
  amount: number;
  initiated_by?: {
    full_name: string;
  };
  status?: string;
}

interface TransactionHistoryModalProps {
  show: boolean;
  onClose: () => void;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  plotNumber: number;
}

const StatusBadge = ({ status }: { status?: string }) => {
  const baseClasses = "px-2 py-1 text-xs font-bold rounded-full";
  let specificClasses = "";
  const displayStatus = status || "unknown";

  switch (displayStatus) {
    case "approved":
      specificClasses = "bg-green-100 text-green-800";
      break;
    case "pending":
      specificClasses = "bg-yellow-100 text-yellow-800";
      break;
    case "rejected":
      specificClasses = "bg-red-100 text-red-800";
      break;
    default:
      specificClasses = "bg-gray-100 text-gray-800";
  }
  return (
    <span className={`${baseClasses} ${specificClasses}`}>
      {displayStatus.toUpperCase()}
    </span>
  );
};

export const TransactionHistoryModal: React.FC<
  TransactionHistoryModalProps
> = ({ show, onClose, transactions, loading, error, plotNumber }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-xl font-bold">
            Transaction History for Plot #{plotNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <p>Loading history...</p>
        ) : transactions.length === 0 ? (
          <p>No transaction history found for this plot.</p>
        ) : (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">
                    Amount
                  </th>
                  <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">
                    Initiated By
                  </th>
                  <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border-b text-sm">
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 px-4 border-b text-sm">
                      {tx.initiated_by?.full_name || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b text-sm">
                      <StatusBadge status={tx.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-end mt-4 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
