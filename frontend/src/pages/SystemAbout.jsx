import React from 'react';
import { Layers, Database, Cpu, Users, GitBranch, ArrowRight } from 'lucide-react';

export default function SystemAbout() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">SANGAM</h1>
        <p className="text-xl text-slate-600">AI-Powered Automatic Block Planning & Optimization Platform</p>
        <div className="inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold border border-blue-200">
          Prototype Version 1.1 • Smart India Hackathon 2026
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">About the System</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          SANGAM addresses the complex challenge of scheduling maintenance blocks across various railway departments (Engineering, S&T, Traction/Electrical, General) while minimizing traffic disruption. Version 1.1 enhances multi-department coordination, AI priority explainability, and real-time CP-SAT optimization.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-xl">
            <Cpu className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">AI Prioritization</h3>
            <p className="text-sm text-slate-600">Calculates dynamic priority scores based on asset criticality, overdue status, and safety impact.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <GitBranch className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">CP-SAT Optimization</h3>
            <p className="text-sm text-slate-600">Uses constraint programming to pack tasks into block windows, maximizing efficiency.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <Users className="w-8 h-8 text-amber-600 mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">Human-in-the-Loop</h3>
            <p className="text-sm text-slate-600">Provides What-If analysis and manual override capabilities for final decision making.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Architecture Overview</h2>
        <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm w-full md:w-auto">
            <Database className="w-6 h-6 text-slate-600 mb-2" />
            <span className="font-semibold text-sm">Railway Data Adapters</span>
            <span className="text-xs text-slate-500">TMS / SMMS / TDMS</span>
          </div>
          <ArrowRight className="text-slate-400 rotate-90 md:rotate-0 my-4 md:my-0" />
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border-2 border-blue-500 w-full md:w-auto">
            <Layers className="w-6 h-6 text-blue-600 mb-2" />
            <span className="font-semibold text-sm">SANGAM Backend v1.1</span>
            <span className="text-xs text-slate-500">FastAPI + OR-Tools CP-SAT</span>
          </div>
          <ArrowRight className="text-slate-400 rotate-90 md:rotate-0 my-4 md:my-0" />
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm w-full md:w-auto">
            <Cpu className="w-6 h-6 text-slate-600 mb-2" />
            <span className="font-semibold text-sm">React 18 Frontend</span>
            <span className="text-xs text-slate-500">Tailwind + Recharts</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Tech Stack & Components</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex justify-between border-b border-slate-100 py-2">
              <span className="font-medium">Frontend</span>
              <span>React 18, Vite, Tailwind CSS</span>
            </li>
            <li className="flex justify-between border-b border-slate-100 py-2">
              <span className="font-medium">Visualizations</span>
              <span>Recharts, Custom Gantt Chart</span>
            </li>
            <li className="flex justify-between border-b border-slate-100 py-2">
              <span className="font-medium">Backend Framework</span>
              <span>Python 3.10+ FastAPI</span>
            </li>
            <li className="flex justify-between border-b border-slate-100 py-2">
              <span className="font-medium">Optimization Engine</span>
              <span>Google OR-Tools CP-SAT Solver</span>
            </li>
            <li className="flex justify-between border-b border-slate-100 py-2">
              <span className="font-medium">Machine Learning</span>
              <span>Scikit-Learn Random Forest Regressor</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Prototype Highlights (v1.1)</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
            <li>ML-driven Asset Failure Risk scoring with Feature Importance Attribution.</li>
            <li>Dynamic Priority Engine with preset strategies (Monsoon Mode, High-Speed, Safety Focus).</li>
            <li>Google OR-Tools CP-SAT constraint optimization for block allocation.</li>
            <li>Interactive What-If Scenario simulation with metric comparison.</li>
            <li>Multi-department track block coordination suggestions.</li>
            <li>Human-in-the-loop schedule review and approval workflow.</li>
          </ul>
        </div>
      </div>

      <div className="text-center text-sm text-slate-500 py-8">
        <p>Developed by Team <strong>SubwaySurfers</strong> for Smart India Hackathon 2026 (SIH26027)</p>
      </div>
    </div>
  );
}
