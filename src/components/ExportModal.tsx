import React, { useState } from 'react';
import { X, Download, Copy, Check, FileSpreadsheet, Share2 } from 'lucide-react';
import { Expense, ExpenseCategory, Trip } from '../types';
import { CATEGORIES, PAYMENT_METHODS, formatCurrency } from '../utils/constants';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  expenses: Expense[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  trip,
  expenses,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalSpent = expenses.reduce((sum, e) => sum + e.convertedAmount, 0);

  // Generate CSV string
  const generateCSV = () => {
    const headers = [
      'Date',
      'Time',
      'Title',
      'Category',
      'Amount',
      'Currency',
      `Converted (${trip.currency})`,
      'Payment Method',
      'Paid By',
      'Split With',
      'Location',
      'Notes',
    ];

    const rows = expenses.map((e) => {
      const cat = CATEGORIES[e.category]?.name || e.category;
      const pm = PAYMENT_METHODS.find((p) => p.id === e.paymentMethod)?.label || e.paymentMethod;
      const split = e.splitWith ? e.splitWith.join(';') : '';
      return [
        `"${e.date}"`,
        `"${e.time || ''}"`,
        `"${e.title.replace(/"/g, '""')}"`,
        `"${cat}"`,
        e.amount,
        `"${e.currency}"`,
        e.convertedAmount,
        `"${pm}"`,
        `"${e.paidBy}"`,
        `"${split}"`,
        `"${(e.location || '').replace(/"/g, '""')}"`,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const handleDownloadCSV = () => {
    const csvData = generateCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${trip.name.replace(/[^a-zA-Z0-9]/g, '_')}_expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate plain text report
  const generateTextSummary = () => {
    let text = `✈️ TRIP EXPENSE REPORT: ${trip.name}\n`;
    text += `📍 Destination: ${trip.destination}\n`;
    text += `📅 Dates: ${trip.startDate} to ${trip.endDate}\n`;
    text += `💰 Budget: ${formatCurrency(trip.budget, trip.currency)}\n`;
    text += `💳 Total Spent: ${formatCurrency(totalSpent, trip.currency)} (${Math.round((totalSpent / trip.budget) * 100)}%)\n`;
    text += `👥 Travelers: ${trip.travelers.join(', ')}\n\n`;
    text += `--- CATEGORY BREAKDOWN ---\n`;

    const catSums: Record<string, number> = {};
    expenses.forEach((e) => {
      catSums[e.category] = (catSums[e.category] || 0) + e.convertedAmount;
    });

    Object.entries(catSums).forEach(([cat, sum]) => {
      const name = CATEGORIES[cat as ExpenseCategory]?.name || cat;
      text += `• ${name}: ${formatCurrency(sum, trip.currency)}\n`;
    });

    text += `\n--- DETAILED EXPENSES (${expenses.length}) ---\n`;
    expenses.forEach((e) => {
      text += `• [${e.date}] ${e.title}: ${formatCurrency(e.convertedAmount, trip.currency)} (Paid by ${e.paidBy})\n`;
    });

    return text;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateTextSummary());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Export & Share Trip Expenses
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white">
              <span>{trip.name}</span>
              <span>{formatCurrency(totalSpent, trip.currency)}</span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 flex justify-between">
              <span>{expenses.length} individual expenses recorded</span>
              <span>Budget: {formatCurrency(trip.budget, trip.currency)}</span>
            </div>
          </div>

          {/* Export Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleDownloadCSV}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-left transition group shadow-xs"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                Download CSV Spreadsheet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Open in Excel, Google Sheets, or Apple Numbers. Includes all categories and notes.
              </p>
            </button>

            <button
              onClick={handleCopyText}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-left transition group shadow-xs"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5">
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                {copied ? 'Copied to Clipboard!' : 'Copy Text Summary'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Formatted summary ready to paste into WhatsApp, Slack, or an email to friends.
              </p>
            </button>
          </div>

          {/* Text preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Report Preview
            </label>
            <pre className="p-3 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-300 rounded-xl text-[11px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800">
              {generateTextSummary()}
            </pre>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
