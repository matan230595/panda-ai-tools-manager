import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { BarChart3, TrendingUp, DollarSign, Package, AlertCircle, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import SmartRecommendations from '@/components/recommendations/SmartRecommendations';
import ReminderCalendarView from '@/components/calendar/ReminderCalendarView';
import UpcomingRenewalsPanel from '@/components/subscription/UpcomingRenewalsPanel';

export default function Dashboard() {
  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Subscription.filter({ created_by_id: user.id });
    },
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Reminder.filter({ created_by_id: user.id });
    },
  });

  const { data: toolTasks = [] } = useQuery({
    queryKey: ['toolTasks'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolTask.filter({ created_by_id: user.id });
    },
  });

  const stats = {
    totalTools: tools.length,
    totalMonthlyCost: subscriptions.filter((item) => item.isActive).reduce((sum, item) => sum + (item.priceMonthly || 0), 0),
    favoriteTools: tools.filter((tool) => tool.isFavorite).length,
    toolsWithSubscription: tools.filter((tool) => tool.hasSubscription).length,
    toolsWithTasks: new Set(toolTasks.map((task) => task.toolId)).size,
    averageRating: (tools.reduce((sum, tool) => sum + (tool.rating || 0), 0) / tools.length || 0).toFixed(1),
  };

  const categoriesData = Object.entries(
    tools.reduce((acc, tool) => {
      acc[tool.category || 'אחר'] = (acc[tool.category || 'אחר'] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  const subscriptionCostData = subscriptions
    .filter((item) => item.isActive && (item.priceMonthly || 0) > 0)
    .sort((a, b) => (b.priceMonthly || 0) - (a.priceMonthly || 0))
    .slice(0, 6)
    .map((item) => ({
      name: item.toolName,
      cost: item.priceMonthly || 0,
      type: item.subscriptionType || '-',
    }));

  const knowledgeTrendData = tools.slice(0, 8).map((tool) => ({
    name: tool.name,
    tasks: toolTasks.filter((task) => task.toolId === tool.id && !task.isCompleted).length,
    notes: tool.notes || tool.personalNotes ? 1 : 0,
  }));

  const roiData = tools
    .filter((tool) => (tool.roiPercentage || 0) !== 0 || (tool.directRevenue || 0) > 0 || (tool.timeSavingsHours || 0) > 0)
    .sort((a, b) => (b.roiPercentage || 0) - (a.roiPercentage || 0))
    .slice(0, 6)
    .map((tool) => ({
      name: tool.name,
      roi: tool.roiPercentage || 0,
      revenue: tool.directRevenue || 0,
    }));

  const highlightedTools = tools
    .filter((tool) => tool.isFavorite || (tool.rating || 0) >= 4)
    .sort((a, b) => ((b.rating || 0) + (b.isFavorite ? 1 : 0)) - ((a.rating || 0) + (a.isFavorite ? 1 : 0)))
    .slice(0, 5);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-4 md:space-y-6" dir="rtl">
      <div className="text-right px-1 sm:px-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1 sm:mb-2">דשבורד</h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">מבט מרכזי על מאגר הידע שלך לכלי AI</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
        <StatCard title="סך הכלים" value={stats.totalTools} icon={<Package className="w-5 h-5" />} color="bg-blue-500" />
        <StatCard title="עלות חודשית" value={`₪${stats.totalMonthlyCost.toLocaleString('he-IL')}`} icon={<DollarSign className="w-5 h-5" />} color="bg-red-500" />
        <StatCard title="עם מנוי" value={stats.toolsWithSubscription} icon={<Calendar className="w-5 h-5" />} color="bg-purple-500" />
        <StatCard title="כלים עם משימות" value={stats.toolsWithTasks} icon={<AlertCircle className="w-5 h-5" />} color="bg-orange-500" />
        <StatCard title="דירוג ממוצע" value={stats.averageRating} icon={<TrendingUp className="w-5 h-5" />} color="bg-green-500" />
      </div>

      <UpcomingRenewalsPanel subscriptions={subscriptions} tools={tools} limit={6} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-bold mb-4">כלים לפי קטגוריה</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoriesData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} interval={0} />
              <YAxis width={32} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-bold mb-4">עלות חודשית לפי מנויים</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subscriptionCostData} margin={{ top: 10, right: 10, left: 0, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-30} textAnchor="end" height={90} interval={0} />
              <YAxis width={40} />
              <Tooltip />
              <Bar dataKey="cost" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {knowledgeTrendData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-bold mb-4">מפת ידע ותחזוקה לכלים</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={knowledgeTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" height={55} interval={0} />
              <YAxis width={32} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="tasks" stroke="#6366f1" name="משימות פתוחות" strokeWidth={2} />
              <Line type="monotone" dataKey="notes" stroke="#f59e0b" name="יש הערות" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {roiData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-bold mb-4">ROI ורווחיות לפי כלי</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiData} margin={{ top: 10, right: 10, left: 0, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-30} textAnchor="end" height={90} interval={0} />
              <YAxis width={40} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="roi" fill="#10b981" name="ROI %" radius={[6, 6, 0, 0]} />
              <Bar dataKey="revenue" fill="#6366f1" name="הכנסה ישירה" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-bold mb-4">המלצות חכמות</h2>
          <SmartRecommendations />
        </div>

        <ReminderCalendarView
          reminders={reminders.filter((item) => !item.isCompleted && item.isActive)}
          subscriptions={subscriptions.filter((item) => item.isActive)}
          tasks={toolTasks.filter((item) => !item.isCompleted)}
          onMoveReminder={() => {}}
          onMoveTask={() => {}}
        />
      </div>

      {highlightedTools.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
            כלים בולטים במאגר
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
            {highlightedTools.map((tool) => (
              <div key={tool.id} className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                <h3 className="font-semibold text-sm mb-2">{tool.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">דירוג</span>
                  <span className="text-lg font-bold text-indigo-600">{tool.rating || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700">
      <div className={`${color} w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 rounded-lg flex items-center justify-center text-white mb-2 sm:mb-3`}>
        <span className="text-sm sm:text-base">{icon}</span>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}