import React from "react";

interface SellPlotModalProps {
  show: boolean;
  onClose: () => void;
  formData: {
    amount_collected: string;
    sold_on_date: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    is_emi: boolean;
    emi_amount?: number;
    emi_start_date?: string;
    emi_frequency_months?: number;
    remaining_amount: number;
  };
  error: string | null;
  success: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  plotNumber: number;
}

export const SellPlotModal: React.FC<SellPlotModalProps> = ({
  show,
  onClose,
  formData,
  error,
  success,
  onChange,
  onCheckboxChange,
  onSubmit,
  plotNumber,
}) => {
  if (!show) return null;

  return (
    <div className="mt-6 rounded-lg bg-white p-6 shadow-md border border-gray-200 relative">
      <h3 className="text-lg font-semibold mb-4">Sell Plot #{plotNumber}</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount Collected (₹)
          </label>
          <input
            type="number"
            name="amount_collected"
            value={formData.amount_collected}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sold On Date
          </label>
          <input
            type="date"
            name="sold_on_date"
            value={formData.sold_on_date.split("T")[0]}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name
          </label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Phone
          </label>
          <input
            type="tel"
            name="customer_phone"
            value={formData.customer_phone}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Email
          </label>
          <input
            type="email"
            name="customer_email"
            value={formData.customer_email}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_emi"
            name="is_emi"
            checked={formData.is_emi || false}
            onChange={onCheckboxChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="is_emi" className="ml-2 block text-sm text-gray-700">
            Is this an EMI sale?
          </label>
        </div>

        {formData.is_emi && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EMI Amount (₹)
              </label>
              <input
                type="number"
                name="emi_amount"
                value={formData.emi_amount || ""}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                step="0.01"
                required={formData.is_emi}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EMI Start Date
              </label>
              <input
                type="date"
                name="emi_start_date"
                value={
                  formData.emi_start_date
                    ? formData.emi_start_date.split("T")[0]
                    : ""
                }
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required={formData.is_emi}
              />
            </div>

            {/* <div className="p-3 bg-blue-50 rounded-md mb-4">
              <p className="text-sm">
                <span className="font-medium">Calculated Installments:</span>{" "}
                {formData.emi_frequency_months || 0} months
              </p>
              {formData.emi_amount && (
                <p className="text-xs text-gray-600 mt-1">
                  (₹{formData.remaining_amount.toLocaleString()} ÷ ₹
                  {Number(formData.emi_amount).toLocaleString()} ={" "}
                  {formData.remaining_amount / Number(formData.emi_amount)}{" "}
                  rounded up)
                </p>
              )}
            </div> */}
          </>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
          >
            Confirm Sale
          </button>
        </div>
      </form>
    </div>
  );
};
