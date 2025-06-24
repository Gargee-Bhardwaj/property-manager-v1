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
  LineChart,
  Line,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import MainLayout from "../../../../components/MainLayout";
import { useAuth } from "../../../../lib/contexts/AuthContext";
import {
  getProjectDetails,
  getPlotsSummaryByStatus,
  getNetWorthByPartner,
  getEmiSummaryByStatus,
  getPlotsSoldByMonth,
  getAmountCollectedByPartner,
  getProjectPartners,
} from "../../../../lib/apis/auth";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const PLOT_STATUS_COLORS: { [key: string]: string } = {
  sold: "#00C49F", // Green
  available: "#DC2626", // Red
  work_in_progress: "#FFBB28", // Yellow
};

// Add type definitions for API responses
interface ProjectDetails {
  name: string;
}
interface NetWorth {
  id: string;
  net_amount: number;
}
interface NetWorthResponse {
  data: NetWorth[];
}
interface Partner {
  id: string;
  full_name?: string;
}
interface AmountCollected {
  total_amount_collected: number;
}
interface PartnerResponse {
  data: Partner[];
}

export default function SummaryPage() {
  const { token } = useAuth();
  const params = useParams();
  const projectId = params.projectId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projectName, setProjectName] = useState("");
  const [plotSummary, setPlotSummary] = useState<{ [key: string]: number }>({});
  const [netWorth, setNetWorth] = useState<NetWorth[]>([]);
  const [emiSummary, setEmiSummary] = useState<{ [key: string]: number }>({});
  const [monthlySales, setMonthlySales] = useState<{ [key: string]: number }>(
    {}
  );
  const [totalCollected, setTotalCollected] = useState(0);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const fetchSummaryData = async () => {
      if (!token || !projectId) return;
      setLoading(true);
      setError(null);
      try {
        const [
          projectDetailsRes,
          plotSummaryRes,
          netWorthRes,
          emiSummaryRes,
          monthlySalesRes,
          collectedRes,
          partnersRes,
        ] = await Promise.all([
          getProjectDetails(token, projectId) as Promise<ProjectDetails>,
          getPlotsSummaryByStatus(token, projectId) as Promise<{
            [key: string]: number;
          }>,
          getNetWorthByPartner(token, projectId) as Promise<NetWorthResponse>,
          getEmiSummaryByStatus(token, projectId) as Promise<{
            [key: string]: number;
          }>,
          getPlotsSoldByMonth(token, projectId) as Promise<{
            [key: string]: number;
          }>,
          getAmountCollectedByPartner(
            token,
            projectId
          ) as Promise<AmountCollected>,
          getProjectPartners(token, projectId) as Promise<PartnerResponse>,
        ]);

        setProjectName(projectDetailsRes?.name || projectId);
        setPlotSummary(plotSummaryRes || {});
        setNetWorth(netWorthRes?.data || []);
        setEmiSummary(emiSummaryRes || {});
        setMonthlySales(monthlySalesRes || {});
        setTotalCollected(collectedRes?.total_amount_collected || 0);
        setPartners(partnersRes?.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch summary data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [token, projectId]);

  const pieChartData = useMemo(
    () =>
      Object.entries(plotSummary)
        .filter(([key]) => key !== "total")
        .map(([name, value]) => ({ name, value })),
    [plotSummary]
  );

  const barChartData = useMemo(
    () =>
      netWorth.map((item) => {
        const partner = partners.find((p) => p.id === item.id);
        return {
          name: partner?.full_name || item.id,
          netAmount: item.net_amount,
        };
      }),
    [netWorth, partners]
  );

  const hasNegativeNetWorth = useMemo(
    () => barChartData.some((item) => item.netAmount < 0),
    [barChartData]
  );

  const lineChartData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const monthKey = `${month}-${year}`;

      data.push({
        month: monthKey,
        count: monthlySales[monthKey] || 0,
      });
    }
    return data;
  }, [monthlySales]);

  if (loading) return <MainLayout>Loading...</MainLayout>;
  if (error)
    return (
      <MainLayout>
        <p className="text-red-500">{error}</p>
      </MainLayout>
    );

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: projectName, href: `/projects/${projectId}` },
        { label: "Summary" },
      ]}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Plot Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        PLOT_STATUS_COLORS[entry.name] ||
                        COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <h4 className="text-lg font-semibold text-gray-600">
                Total Amount Collected
              </h4>
              <p className="text-2xl font-bold text-green-600">
                ₹{totalCollected.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Partner Net Amount
            </h3>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    width={80}
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        notation: "compact",
                        compactDisplay: "short",
                      }).format(value as number)
                    }
                    domain={
                      hasNegativeNetWorth ? ["auto", "auto"] : [0, "auto"]
                    }
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                      }).format(value)
                    }
                    cursor={{ fill: "transparent" }}
                  />
                  <Legend />
                  <ReferenceLine y={0} stroke="#000" />
                  <Bar dataKey="netAmount" maxBarSize={60}>
                    {barChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-center">
            EMI Summary
          </h3>
          <div className="flex justify-around text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {emiSummary.total || 0}
              </p>
              <p className="text-gray-600">Total Installments</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">
                {emiSummary.paid || 0}
              </p>
              <p className="text-gray-600">Paid</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600">
                {emiSummary.unpaid || 0}
              </p>
              <p className="text-gray-600">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Monthly Plot Sales
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MainLayout>
  );
}
