import React, { useState } from "react";

interface AddAmountModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
  plotNumber: number;
  isSubmitting: boolean;
  error: string | null;
}

export const AddAmountModal: React.FC<AddAmountModalProps> = ({
  show,
  onClose,
  onSubmit,
  plotNumber,
  isSubmitting,
  error,
}) => {
  if (!show) return null;

  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      return;
    }
    onSubmit(Number(amount));
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            Add Amount to Plot #{plotNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <label
              htmlFor="amount"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter amount collected"
              required
            />
          </div>
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300"
            >
              {isSubmitting ? "Adding..." : "Add Amount"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
