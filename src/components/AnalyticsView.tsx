import React from 'react';
import {
  PieChart,
  TrendingUp,
  CreditCard,
  Users,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Expense, ExpenseCategory, Trip } from '../types';
import { CATEGORIES, PAYMENT_METHODS, formatCurrency } from '../utils/constants';
import { CategoryIcon, PaymentIcon } from './CategoryIcon';

interface AnalyticsViewProps {
  trip: Trip;
  expenses: Expense[];
  onSelectCategoryFilter: (category: ExpenseCategory) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  trip,
  expenses,
  onSelectCategoryFilter,
}) => {
  const totalSpent = expenses.reduce((sum, e) => sum + e.convertedAmount, 0);

  // Category breakdown
  const categoryStats = (Object.keys(CATEGORIES) as ExpenseCategory[]).map((cat) => {
    const matching = expenses.filter((e) => e.category === cat);
    const amount = matching.reduce((sum, e) => sum + e.convertedAmount, 0);
    const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
    const categoryBudget = trip.categoryBudgets?.[cat];
    return {
      category: cat,
      config: CATEGORIES[cat],
      count: matching.length,
      amount,
      percentage,
      categoryBudget,
    };
  }).filter((stat) => stat.count > 0 || (stat.categoryBudget && stat.categoryBudget > 0))
    .sort((a, b) => b.amount - a.amount);

  // Daily Spending timeline
  const dailyStatsMap: Record<string, number> = {};
  expenses.forEach((e) => {
    dailyStatsMap[e.date] = (dailyStatsMap[e.date] || 0) + e.convertedAmount;
  });
  const sortedDates = Object.keys(dailyStatsMap).sort();
  const maxDaySpend = Math.max(...Object.values(dailyStatsMap), 1);

  // Spending by Traveler (Who paid)
  const paidByStats = trip.travelers.map((traveler) => {
    const paidExpenses = expenses.filter((e) => e.paidBy === traveler);
    const totalPaid = paidExpenses.reduce((sum, e) => sum + e.convertedAmount, 0);

    // Calculate traveler's fair share based on splits
    let fairShare = 0;
    expenses.forEach((e) => {
      if (e.splitWith && e.splitWith.includes(traveler)) {
        fairShare += e.convertedAmount / e.splitWith.length;
      } else if (!e.splitWith || e.splitWith.length === 0) {
        if (e.paidBy === traveler) {
          fairShare += e.convertedAmount;
        }
      }
    });

    const netBalance = totalPaid - fairShare;

    return {
      traveler,
      totalPaid,
      fairShare,
      netBalance,
      percentageOfPaid: totalSpent > 0 ? (totalPaid / totalSpent) * 100 : 0,
    };
  });

  // Payment Methods stats
  const paymentStats = PAYMENT_METHODS.map((pm) => {
    const matching = expenses.filter((e) => e.paymentMethod === pm.id);
    const amount = matching.reduce((sum, e) => sum + e.convertedAmount, 0);
    return {
      ...pm,
      count: matching.length,
      amount,
      percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
    };
  }).filter((p) => p.count > 0);

  // Top 5 largest expenses
  const topExpenses = [...expenses]
    .sort((a, b) => b.convertedAmount - a.convertedAmount)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Category Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown list */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              Category Breakdown
            </h3>
            <span className="text-xs text-slate-400">
              Total {formatCurrency(totalSpent, trip.currency)}
            </span>
          </div>

          <div className="space-y-3.5">
            {categoryStats.map((stat) => (
              <div
                key={stat.category}
                onClick={() => onSelectCategoryFilter(stat.category)}
                className="group p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${stat.config.color}20`, color: stat.config.color }}
                    >
                      <CategoryIcon category={stat.category} className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {stat.config.name}
                    </span>
                    <span className="text-slate-400">({stat.count})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 dark:text-white">
                      {formatCurrency(stat.amount, trip.currency)}
                    </span>
                    <span className="text-slate-400 ml-1.5 font-medium">
                      ({Math.round(stat.percentage)}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(2, stat.percentage)}%`,
                      backgroundColor: stat.config.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Spending Trend chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Daily Spending Trend
            </h3>
            <span className="text-xs text-slate-400">
              Peak: {formatCurrency(maxDaySpend, trip.currency)}
            </span>
          </div>

          {sortedDates.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">No daily data available</p>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="flex items-end gap-2 h-44 border-b border-slate-100 dark:border-slate-800 pb-2">
                {sortedDates.map((date) => {
                  const spend = dailyStatsMap[date];
                  const heightPercent = Math.max(8, Math.round((spend / maxDaySpend) * 100));
                  return (
                    <div
                      key={date}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 px-2 py-1 bg-slate-900 text-white text-[10px] rounded-md whitespace-nowrap pointer-events-none z-10 shadow-lg">
                        {date}: {formatCurrency(spend, trip.currency)}
                      </div>

                      <div
                        className="w-full rounded-t-md bg-blue-500 hover:bg-blue-600 transition-all duration-300 min-h-[8px]"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[10px] text-slate-400 mt-1 truncate max-w-[40px] text-center rotate-45 sm:rotate-0 origin-left">
                        {date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="text-[11px] text-slate-400 text-center">
                Hover over bars to inspect daily expenditures
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Traveler Settlement & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Split & Net Settlement */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Travelers & Split Balances
            </h3>
            <span className="text-xs text-slate-400">Fair share breakdown</span>
          </div>

          <div className="space-y-3">
            {paidByStats.map((item) => (
              <div
                key={item.traveler}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {item.traveler}
                  </h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-1">
                    <span>Paid: {formatCurrency(item.totalPaid, trip.currency)}</span>
                    <span>•</span>
                    <span>Share: {formatCurrency(item.fairShare, trip.currency)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">
                    Net Balance
                  </span>
                  {item.netBalance >= 0 ? (
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      + gets back {formatCurrency(item.netBalance, trip.currency)}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                      - owes {formatCurrency(Math.abs(item.netBalance), trip.currency)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            Top 5 Highest Expenses
          </h3>

          <div className="space-y-2.5">
            {topExpenses.map((exp, idx) => {
              const conf = CATEGORIES[exp.category];
              return (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {exp.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {conf?.name} • {exp.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {formatCurrency(exp.convertedAmount, trip.currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
