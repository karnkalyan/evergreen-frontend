import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Target, 
  Users, 
  Package,
  Calendar,
  Download,
  Filter,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import DashboardCard from '../../../components/admin/DashboardCard';
import { reportService, SalesReport } from '../../../lib/reportService';
import { toast } from 'react-hot-toast';

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="text-sm text-slate-600">
          <span className="text-blue-600">Sales: </span>
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for pie chart
const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-800">{payload[0].name}</p>
        <p className="text-sm text-slate-600">
          Revenue: ${payload[0].value.toLocaleString()}
        </p>
        <p className="text-sm text-slate-600">
          Percentage: {payload[0].payload.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

// Color palette for charts
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

const SalesBarChart: React.FC<{ data: { month: string, sales: number }[] }> = ({ data }) => {
  if (!data || data.length === 0 || data.every(item => item.sales === 0)) {
    return (
      <div className="h-72 bg-slate-50 p-4 rounded-lg flex items-center justify-center">
        <div className="text-center text-slate-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No sales data available for this period</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#64748b' }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fill: '#64748b' }}
          tickLine={false}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="sales" 
          name="Monthly Sales"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

const SalesLineChart: React.FC<{ data: { month: string, sales: number }[] }> = ({ data }) => {
  if (!data || data.length === 0 || data.every(item => item.sales === 0)) {
    return (
      <div className="h-72 bg-slate-50 p-4 rounded-lg flex items-center justify-center">
        <div className="text-center text-slate-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No sales data available for this period</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#64748b' }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fill: '#64748b' }}
          tickLine={false}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="sales" 
          name="Monthly Sales"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#1d4ed8' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const CategoryPieChart: React.FC<{ data: { category: string, revenue: number }[] }> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.revenue, 0);
  
  // Add percentage to each data item
  const chartData = data.map(item => ({
    ...item,
    percentage: total > 0 ? ((item.revenue / total) * 100).toFixed(1) : '0'
  }));

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="h-64 bg-slate-50 p-4 rounded-lg flex items-center justify-center">
        <div className="text-center text-slate-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No category data available</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ category, percentage }) => `${category}: ${percentage}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="revenue"
          nameKey="category"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const ReportsPage: React.FC = () => {
    const [report, setReport] = useState<SalesReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('yearly');
    const [year, setYear] = useState(2025);
    const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

    const fetchReportData = async () => {
        try {
            setLoading(true);
            console.log(`🔄 Fetching report for ${period}, year: ${year}`);
            const reportData = await reportService.getSalesReports(period, year);
            console.log('📊 Report data received:', reportData);
            setReport(reportData);
        } catch (error) {
            console.error('Error fetching report data:', error);
            toast.error('Failed to load sales reports');
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [period, year]);

    const formatCurrency = (amount: number) => {
        return `$${amount?.toFixed(2) || '0.00'}`;
    };

    const handleExport = () => {
        toast.success('Export feature coming soon!');
    };

    // Generate year options from 2023 to current year
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let y = 2023; y <= currentYear; y++) {
        yearOptions.push(y);
    }

    if (loading) {
        return (
            <div>
                <h1 className="text-3xl font-poppins font-bold text-slate-800 mb-6">Sales Reports</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="bg-white p-6 rounded-2xl shadow-soft-md animate-pulse">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                                    <div className="h-8 bg-slate-200 rounded w-32"></div>
                                </div>
                                <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-soft-md animate-pulse">
                    <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
                    <div className="h-72 bg-slate-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-poppins font-bold text-slate-800">Sales Reports</h1>
                <div className="flex items-center space-x-4">
                    {/* Period Filter */}
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <select 
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <select 
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {yearOptions.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Data Info Banner */}
            {report && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />
                        <p className="text-sm text-blue-700">
                            Showing data for <strong>{period}</strong> period in <strong>{year}</strong>. 
                            {year === 2024 && " Your orders are from 2024, so select 2024 to see the data."}
                        </p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard 
                    title="Total Sales"
                    value={report ? formatCurrency(report.summary.totalSales) : '$0.00'}
                    subtitle={`${period} ${year}`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    iconBgColor="bg-sky-500"
                />
                <DashboardCard 
                    title="Avg. Order Value"
                    value={report ? formatCurrency(report.summary.averageOrderValue) : '$0.00'}
                    subtitle={`${period} ${year}`}
                    icon={<ShoppingCart className="w-5 h-5" />}
                    iconBgColor="bg-amber-500"
                />
                <DashboardCard 
                    title="Conversion Rate"
                    value={report ? `${report.summary.conversionRate}%` : '0%'}
                    subtitle={`${period} ${year}`}
                    icon={<Target className="w-5 h-5" />}
                    iconBgColor="bg-green-500"
                />
                <DashboardCard 
                    title="New vs Returning"
                    value={report ? `${report.summary.newVsReturning.new}% / ${report.summary.newVsReturning.returning}%` : '0% / 0%'}
                    subtitle={`${period} ${year}`}
                    icon={<Users className="w-5 h-5" />}
                    iconBgColor="bg-indigo-500"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-soft-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-poppins font-bold text-slate-800">
                            Sales in {year}
                        </h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setChartType('bar')}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    chartType === 'bar' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Bar
                            </button>
                            <button
                                onClick={() => setChartType('line')}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    chartType === 'line' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Line
                            </button>
                        </div>
                    </div>
                    <div className="h-72">
                        {chartType === 'bar' ? (
                            <SalesBarChart data={report?.charts.monthlySales || []} />
                        ) : (
                            <SalesLineChart data={report?.charts.monthlySales || []} />
                        )}
                    </div>
                </div>

                {/* Category Sales */}
                <div className="bg-white p-6 rounded-2xl shadow-soft-md">
                    <h2 className="text-xl font-poppins font-bold text-slate-800 mb-4">
                        Sales by Category ({year})
                    </h2>
                    <div className="h-64">
                        <CategoryPieChart data={report?.charts.salesByCategory || []} />
                    </div>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white p-6 rounded-2xl shadow-soft-md">
                <h2 className="text-xl font-poppins font-bold text-slate-800 mb-4">
                    Top Selling Products ({year})
                </h2>
                {report?.charts.topProducts && report.charts.topProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-sm font-semibold text-slate-500 border-b">
                                    <th className="p-3">Rank</th>
                                    <th className="p-3">Product</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Quantity Sold</th>
                                    <th className="p-3 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.charts.topProducts.map((product, index) => (
                                    <tr key={product.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50">
                                        <td className="p-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-sm font-bold">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="p-3 font-medium">{product.name}</td>
                                        <td className="p-3">
                                            <span className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-full">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="p-3 font-semibold">{product.quantity}</td>
                                        <td className="p-3 text-right font-semibold">
                                            {formatCurrency(product.revenue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No product sales data available for {year}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;