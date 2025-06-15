"use client";
import React, { useEffect, useState } from "react";
import MainLayout from "../../../../components/MainLayout";
import { useAuth } from "../../../../lib/contexts/AuthContext";
import { useParams } from "next/navigation";
import { getProjectDetails } from "../../../../lib/apis/auth";
import {
  getExpensesApi,
  createExpenseApi,
  Expense,
} from "../../../../lib/apis/expenses";

export default function ExpensesPage() {
  const { token, isLoading: authLoading } = useAuth();
  const params = useParams();
  const projectId = params.projectId as string;
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectName, setProjectName] = useState<string>("");

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add Expense State
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    type: "CONSTRUCTION",
  });
  const [creatingExpense, setCreatingExpense] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (authLoading) return;

      setProjectLoading(true);
      try {
        if (!token) throw new Error("No access token found");
        const project = await getProjectDetails(token, projectId);
        setProjectName(project.name || projectId);
      } catch {
        setProjectName(projectId);
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProject();
  }, [projectId, token, authLoading]);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!projectId || !token) return;

      setLoadingExpenses(true);
      try {
        const data = await getExpensesApi(token, projectId);
        setExpenses(data.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch expenses");
      } finally {
        setLoadingExpenses(false);
      }
    };

    fetchExpenses();
  }, [projectId, token, success]); // Add success to dependencies to refetch after creating

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingExpense(true);
    setError(null);
    setSuccess(null);

    try {
      if (!token) throw new Error("No access token found");

      const expenseData = {
        amount: Number(newExpense.amount),
        description: newExpense.description,
        date: newExpense.date,
        type: newExpense.type,
      };

      await createExpenseApi(token, projectId, expenseData);
      setSuccess("Expense added successfully!");

      // Reset form
      setNewExpense({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        type: "CONSTRUCTION",
      });

      // Close modal after 1.5 seconds
      setTimeout(() => {
        setShowAddExpenseModal(false);
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to add expense");
    } finally {
      setCreatingExpense(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Projects", href: "/dashboard" },
        {
          label: projectLoading ? "Loading..." : projectName,
          href: `/projects/${projectId}`,
        },
        { label: "Expenses" },
      ]}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Project Expenses: {projectName}</h2>
        <button
          onClick={() => setShowAddExpenseModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Add Expense
        </button>
      </div>

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

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">All Expenses</h3>
        {loadingExpenses ? (
          <p className="text-gray-500">Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p className="text-gray-500">No expenses found for this project.</p>
        ) : (
          <ul className="space-y-3">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="p-3 border border-gray-200 rounded-md bg-gray-50"
              >
                <p className="text-sm font-medium">
                  Description: {expense.description}
                </p>
                <p className="text-xs text-gray-600">
                  Amount: ${expense.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600">Type: {expense.type}</p>
                <p className="text-xs text-gray-600">
                  Date: {new Date(expense.date).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-600">
                  Added By:{" "}
                  {expense.added_by_user?.full_name ||
                    expense.added_by_user?.email ||
                    "Unknown"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="bg-opacity-50 flex items-center justify-center my-4">
          <div className="bg-white rounded-lg p-6 w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Expense</h3>
              <button
                onClick={() => {
                  setShowAddExpenseModal(false);
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={newExpense.amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={newExpense.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={newExpense.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={newExpense.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="CONSTRUCTION">Construction</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="UTILITIES">Utilities</option>
                  <option value="ADMINISTRATIVE">Administrative</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingExpense}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                  {creatingExpense ? "Adding..." : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
