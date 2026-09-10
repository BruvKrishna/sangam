import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ComparisonChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
        <Bar dataKey="current" name="Current Plan" fill="#94a3b8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="proposed" name="Proposed Scenario" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
