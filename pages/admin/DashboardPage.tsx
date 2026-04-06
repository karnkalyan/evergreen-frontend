import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  ArrowRight,
  Calendar,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import DashboardCard from '../../components/admin/DashboardCard';
import { orderService } from '../../lib/orderService';
import { Order, OrderStats } from '../../types';
import { toast } from 'react-hot-toast';

// Custom tooltip for charts
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-800">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name.includes('Revenue') ? '$' : ''}{entry.value.toLocaleString()}
            {entry.name.includes('Revenue') ? '' : ' units'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-800">{data.label}</p>
        <p className="text-sm text-slate-600">
          Orders: {data.value}
        </p>
        <p className="text-sm text-slate-600">
          Percentage: {data.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

// Chart components with Recharts
const RevenueChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No revenue data available</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="label" 
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={false}
          tickFormatter={(value) => `$${value > 1000 ? `${(value/1000).toFixed(0)}k` : value.toLocaleString()}`}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="value" 
          name="Revenue"
          stroke="#3b82f6"
          fill="url(#colorRevenue)"
          strokeWidth={2}
        />
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );
};

const StatusDistributionChart = ({ data }: { data: any[] }) => {
  // Calculate percentages and prepare chart data
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = data.map(item => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
  }));

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No status distribution data available</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#f97316', '#8b5cf6'];

  return (
    <div className="h-72 flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPie>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) => `${percentage}%`}
              outerRadius={70}
              innerRadius={30}
              fill="#8884d8"
              dataKey="value"
              nameKey="label"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </RechartsPie>
        </ResponsiveContainer>
      </div>
      {/* Custom Legend - Fixed layout */}
      <div className="mt-4 grid grid-cols-2 gap-2 px-2">
        {chartData.map((entry, index) => (
          <div key={entry.label} className="flex items-center space-x-2 text-xs p-1 bg-slate-50 rounded">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-slate-600 truncate flex-1">{entry.label}</span>
            <span className="font-semibold text-slate-800 text-xs">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TopProductsChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No product sales data available</p>
        </div>
      </div>
    );
  }

  const chartData = data.slice(0, 6).map(product => ({
    ...product,
    shortName: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    revenue: product.totalRevenue || 0,
    quantity: product.totalQuantity || 0
  }));

  // Calculate max revenue for gradient
  const maxRevenue = Math.max(...chartData.map(item => item.revenue));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        barSize={32}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis 
          dataKey="shortName"
          angle={-45}
          textAnchor="end"
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickLine={false}
          height={60}
        />
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={false}
          tickFormatter={(value) => `$${value > 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
        />
        <Tooltip 
          formatter={(value, name) => [
            name === 'revenue' ? `$${Number(value).toLocaleString()}` : value,
            name === 'revenue' ? 'Revenue' : 'Quantity Sold'
          ]}
          labelFormatter={(value, payload) => {
            if (payload && payload[0] && payload[0].payload) {
              return payload[0].payload.name;
            }
            return value;
          }}
        />
        <Bar 
          dataKey="revenue" 
          name="Revenue"
          radius={[4, 4, 0, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.revenue === maxRevenue ? '#3b82f6' : '#60a5fa'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Alternative Top Products as a clean list
const TopProductsList = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No product sales data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.slice(0, 6).map((product, index) => (
        <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-sm font-bold text-white">
              {index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {product.name}
              </p>
              <p className="text-xs text-slate-500">
                {product.totalQuantity} sold • {product.category}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-800">
              ${product.totalRevenue?.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">
              Revenue
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PerformanceMetrics = ({ stats }: { stats: OrderStats | null }) => {
  const metrics = [
    {
      label: 'Avg. Order Value',
      value: stats?.averageOrderValue ? `$${stats.averageOrderValue.toFixed(2)}` : '$0.00',
      change: stats?.aovChange,
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      label: 'Conversion Rate',
      value: stats?.conversionRate ? `${stats.conversionRate}%` : '0%',
      change: stats?.conversionChange,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      label: 'Customer Satisfaction',
      value: stats?.satisfactionRate ? `${stats.satisfactionRate}%` : 'N/A',
      change: stats?.satisfactionChange,
      icon: Activity,
      color: 'bg-blue-500'
    },
    {
      label: 'Return Rate',
      value: stats?.returnRate ? `${stats.returnRate}%` : '0%',
      change: stats?.returnChange,
      icon: XCircle,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white p-4 rounded-xl shadow-soft-md">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-600 truncate">{metric.label}</p>
              <p className="text-lg font-bold text-slate-800 mt-1 truncate">{metric.value}</p>
              {metric.change !== undefined && (
                <p className={`text-xs mt-1 ${
                  metric.change > 0 ? 'text-green-600' : metric.change < 0 ? 'text-red-600' : 'text-slate-500'
                }`}>
                  {metric.change > 0 ? '↑' : metric.change < 0 ? '↓' : ''} 
                  {metric.change !== 0 ? `${Math.abs(metric.change)}%` : 'No change'}
                </p>
              )}
            </div>
            <div className={`p-2 rounded-lg flex-shrink-0 ml-2 ${metric.color}`}>
              <metric.icon className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const QuickStats = ({ stats }: { stats: OrderStats | null }) => {
  const quickStats = [
    {
      label: 'Paid Orders',
      value: stats?.paidOrders || 0,
      description: 'Successful payments',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
      iconBg: 'bg-green-500'
    },
    {
      label: 'Shipped',
      value: stats?.ordersByStatus?.find(s => s.status?.toLowerCase() === 'shipped')?.count || 0,
      description: 'In transit',
      icon: Truck,
      color: 'bg-blue-100 text-blue-600',
      iconBg: 'bg-blue-500'
    },
    {
      label: 'Pending',
      value: stats?.pendingOrders || 0,
      description: 'Awaiting processing',
      icon: Clock,
      color: 'bg-orange-100 text-orange-600',
      iconBg: 'bg-orange-500'
    },
    {
      label: 'Failed',
      value: stats?.failedOrders || 0,
      description: 'Payment issues',
      icon: XCircle,
      color: 'bg-red-100 text-red-600',
      iconBg: 'bg-red-500'
    }
  ];

  return (
    <div className="space-y-4">
      {quickStats.map((stat, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className={`p-2 rounded-lg ${stat.iconBg} shadow-sm`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">{stat.label}</p>
              <p className="text-xs text-slate-500 truncate">{stat.description}</p>
            </div>
          </div>
          <span className="text-xl font-bold text-slate-900 ml-3 bg-white px-3 py-1 rounded-lg border border-slate-200">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [topProductsView, setTopProductsView] = useState<'chart' | 'list'>('list');

  // Fetch recent orders
  const fetchRecentOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders({
        page: 1,
        limit: 5,
        status: ''
      });
      setRecentOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      toast.error('Failed to load recent orders');
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await orderService.getAdminOrderStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch chart data
  const fetchChartData = async () => {
    try {
      setChartsLoading(true);
      
      const [revenueData, statusData, productsData] = await Promise.all([
        orderService.getMonthlyRevenue(),
        orderService.getOrderStatusDistribution(),
        orderService.getTopSellingProducts()
      ]);

      setMonthlyRevenue(revenueData || []);
      setStatusDistribution(statusData || []);
      setTopProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      toast.error('Failed to load chart data');
      setMonthlyRevenue([]);
      setStatusDistribution([]);
      setTopProducts([]);
    } finally {
      setChartsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
    fetchDashboardStats();
    fetchChartData();
  }, []);

  // Get status badge classes
  const getStatusClasses = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': 
      case 'completed': 
        return 'bg-green-100 text-green-800';
      case 'shipped': 
        return 'bg-blue-100 text-blue-800';
      case 'processing': 
      case 'confirmed': 
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': 
      case 'refunded': 
        return 'bg-red-100 text-red-800';
      case 'pending': 
      case 'pending_payment': 
        return 'bg-orange-100 text-orange-800';
      default: 
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const currencySymbols: { [key: string]: string } = {
      USD: '$',
      GBP: '£',
      EUR: '€',
    };
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount?.toFixed(2) || '0.00'}`;
  };

  // Chart loading skeleton
  const ChartSkeleton = () => (
    <div className="h-72 bg-slate-50 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-2"></div>
        <div className="w-24 h-4 bg-slate-200 rounded mx-auto"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-poppins font-bold text-slate-800">Dashboard</h1>
        <div className="flex items-center space-x-2 text-slate-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Revenue"
          value={statsLoading ? "Loading..." : formatCurrency(stats?.totalRevenue || 0, stats?.currency)}
          change={stats?.revenueChange}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-emerald-500"
          loading={statsLoading}
        />
        <DashboardCard 
          title="New Orders"
          value={statsLoading ? "Loading..." : (stats?.totalOrders || 0).toString()}
          change={stats?.orderChange}
          icon={<ShoppingCart className="w-5 h-5" />}
          iconBgColor="bg-blue-500"
          loading={statsLoading}
        />
        <DashboardCard 
          title="Total Products"
          value={statsLoading ? "Loading..." : (stats?.totalProducts || 0).toString()}
          icon={<Package className="w-5 h-5" />}
          iconBgColor="bg-purple-500"
          loading={statsLoading}
        />
        <DashboardCard 
          title="New Customers"
          value={statsLoading ? "Loading..." : (stats?.totalCustomers || 0).toString()}
          change={stats?.customerChange}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-orange-500"
          loading={statsLoading}
        />
      </div>

      {/* Performance Metrics */}
      <PerformanceMetrics stats={stats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-soft-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>Revenue Overview</span>
            </h2>
            <div className="text-sm text-slate-500">Last 6 months</div>
          </div>
          <div className="h-72">
            {chartsLoading ? <ChartSkeleton /> : <RevenueChart data={monthlyRevenue} />}
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-soft-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-green-500" />
              <span>Order Status Distribution</span>
            </h2>
            <div className="text-sm text-slate-500">Current Month</div>
          </div>
          {chartsLoading ? <ChartSkeleton /> : <StatusDistributionChart data={statusDistribution} />}
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-soft-md lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
              <Package className="w-5 h-5 text-purple-500" />
              <span>Top Selling Products</span>
            </h2>
            <div className="flex items-center space-x-2">
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setTopProductsView('list')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    topProductsView === 'list' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setTopProductsView('chart')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    topProductsView === 'chart' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Chart
                </button>
              </div>
              <Link 
                to="/admin/products" 
                className="text-primaryEnd hover:text-primaryStart font-semibold text-sm flex items-center space-x-1 flex-shrink-0 ml-2"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="h-72">
            {chartsLoading ? (
              <ChartSkeleton />
            ) : topProductsView === 'chart' ? (
              <TopProductsChart data={topProducts} />
            ) : (
              <TopProductsList data={topProducts} />
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-2xl shadow-soft-md">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Quick Stats</h2>
          <QuickStats stats={stats} />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-2xl shadow-soft-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-poppins font-bold text-slate-800 flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
            <span>Recent Orders</span>
          </h2>
          <Link 
            to="/admin/orders" 
            className="text-primaryEnd hover:text-primaryStart font-semibold text-sm flex items-center space-x-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex justify-between items-center p-3 border-b last:border-0 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="h-3 bg-slate-200 rounded w-32"></div>
                </div>
                <div className="h-6 bg-slate-200 rounded w-20"></div>
                <div className="h-6 bg-slate-200 rounded w-16"></div>
                <div className="h-6 bg-slate-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-slate-500">No recent orders found</p>
            <Link 
              to="/admin/orders" 
              className="text-primaryEnd hover:text-primaryStart font-semibold mt-2 inline-block"
            >
              View All Orders
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm font-semibold text-slate-500 border-b">
                  <th className="p-3">Order Number</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => {
                  const customerName = order.user ? 
                    `${order.user.firstName} ${order.user.lastName}` : 
                    'Unknown Customer';
                  
                  return (
                    <tr key={order.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50">
                      <td className="p-3 font-semibold text-primaryEnd">
                        <Link to={`/admin/orders/${order.id}`} className="hover:underline">
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{customerName}</div>
                          {order.user?.email && (
                            <div className="text-xs text-slate-500">{order.user.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold">
                        {formatCurrency(order.totalAmount, order.currency)}
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
  );
};

export default DashboardPage;