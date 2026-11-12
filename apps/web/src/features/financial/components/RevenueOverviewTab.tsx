'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { formatINR } from '@/lib/formatters';

interface RevenueOverviewTabProps {
  branchId?: string;
}

const monthlyData = [
  { month: 'Jun', revenue: 280000, collections: 260000 },
  { month: 'Jul', revenue: 310000, collections: 295000 },
  { month: 'Aug', revenue: 340000, collections: 325000 },
  { month: 'Sep', revenue: 360000, collections: 345000 },
  { month: 'Oct', revenue: 385000, collections: 370000 },
  { month: 'Nov', revenue: 372000, collections: 350000 },
];

const categoryData = [
  { name: 'Clinical Therapy', value: 295000, color: '#6C3995' },
  { name: 'Assessment & Eval', value: 77000, color: '#00B9B4' },
];

const departmentData = [
  { name: 'Speech Therapy', value: 165000, color: '#6C3995' },
  { name: 'Occupational Therapy', value: 142000, color: '#00B9B4' },
  { name: 'Behavioural Therapy', value: 65000, color: '#8A5A00' },
];

export function RevenueOverviewTab({ branchId: _branchId }: RevenueOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Monthly Collections vs Billed Trend */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-quicksand font-bold text-lg text-purple-600">
              Revenue & Collections Trend
            </h3>
            <p className="text-xs text-gray-500">
              Monthly billed vs actual collected revenue
            </p>
          </div>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-chip">
            Last 6 months
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5EFFA" vertical={false} />
              <XAxis dataKey="month" stroke="#8E8B94" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#8E8B94"
                fontSize={12}
                tickLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip
                formatter={(val) => [formatINR(Number(val)), '']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#E6D8F1',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="circle"
              />
              <Bar dataKey="revenue" name="Billed Revenue" fill="#6C3995" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collections" name="Collected" fill="#00B9B4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Revenue Category */}
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5">
          <h3 className="font-quicksand font-bold text-base text-ink mb-1">
            Revenue by Service Category
          </h3>
          <p className="text-xs text-gray-500 mb-4">Therapy vs Diagnostic assessments</p>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [formatINR(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#E6D8F1',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">{cat.name}</span>
                <span className="font-semibold text-ink">{formatINR(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Clinical Department */}
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5">
          <h3 className="font-quicksand font-bold text-base text-ink mb-1">
            Revenue by Department
          </h3>
          <p className="text-xs text-gray-500 mb-4">Speech, OT, and Behavioural services</p>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [formatINR(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#E6D8F1',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-2">
            {departmentData.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">{dept.name}</span>
                <span className="font-semibold text-ink">{formatINR(dept.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
