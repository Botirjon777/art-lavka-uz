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
    salesByRegion: Array<{ region: string; revenue: number; orders: number }>;
    orderStatusBreakdown: Array<{
      status: string;
      label: string;
      count: number;
    }>;
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

      {/* Order Status Breakdown */}
      <div className="bg-white rounded-[20px] p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Статусы заказов
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.orderStatusBreakdown}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(value: any) => [value, "Заказов"]}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="count">
              {analytics.orderStatusBreakdown.map((entry) => {
                const color =
                  entry.status === "cancelled"
                    ? "#EF4444"
                    : entry.status === "completed"
                      ? "#10B981"
                      : "#00C6F1";
                return <Cell key={entry.status} fill={color} />;
              })}
            </Bar>
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

      {/* Sales by Region */}
      <div className="bg-white rounded-[20px] p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Продажи по регионам
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analytics.salesByRegion}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="region"
              angle={-45}
              textAnchor="end"
              height={120}
              tick={{ fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: any, name: string | undefined) => {
                if (name === "revenue")
                  return [value.toLocaleString() + " UZS", "Выручка"];
                if (name === "orders") return [value, "Заказов"];
                return [value, name || ""];
              }}
            />
            <Legend
              formatter={(value: string) => {
                if (value === "revenue") return "Выручка";
                if (value === "orders") return "Заказов";
                return value;
              }}
            />
            <Bar dataKey="revenue" fill="#8814B1" />
            <Bar dataKey="orders" fill="#00C6F1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
