import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = [
  "#8814B1",
  "#00C6F1",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#6366F1",
];

interface AnalyticsChartsProps {
  analytics: {
    salesTrend: Array<{ date: string; revenue: number }>;
    salesBySize: Array<{ size: string; count: number }>;
    salesByCategory: Array<{ category: string; count: number }>;
    popularPrints: Array<{ name: string; count: number }>;
    salesByDay: Array<{ day: string; revenue: number }>;
    salesByHour: Array<{ hour: number; revenue: number }>;
  };
}

export default function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Sales Trend */}
      <div className="bg-white rounded-[20px] p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Динамика продаж (30 дней)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.salesTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8814B1"
              strokeWidth={2}
              dot={{ fill: "#8814B1" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Size Distribution */}
      <div className="bg-white rounded-[20px] p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Продажи по размерам
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.salesBySize}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="size" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#00C6F1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-[20px] p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Продажи по категориям
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={analytics.salesByCategory}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {analytics.salesByCategory.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Popular Prints */}
      <div className="bg-white rounded-[20px] p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Популярные принты (Топ 10)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.popularPrints} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tick={{ fontSize: 11 }}
            />
            <Tooltip />
            <Bar dataKey="count" fill="#8814B1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sales by Day of Week */}
      <div className="bg-white rounded-[20px] p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Продажи по дням недели
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.salesByDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sales by Hour */}
      <div className="bg-white rounded-[20px] p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Продажи по часам
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analytics.salesByHour}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
