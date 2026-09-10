export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 px-8 mt-auto text-sm text-slate-500 flex justify-between items-center">
      <div>
        <span className="font-semibold text-slate-700">SANGAM (v1.1)</span> — AI-Powered Automatic Block Planning Platform
        <span className="mx-2">•</span> 
        Prototype Disclaimer: Uses synthetic data for SIH26027 evaluation.
      </div>
      <div className="flex items-center gap-4 text-xs">
        <span>Team: <strong className="text-slate-700">SubwaySurfers</strong></span>
        <span>SIH 2026</span>
      </div>
    </footer>
  );
}
