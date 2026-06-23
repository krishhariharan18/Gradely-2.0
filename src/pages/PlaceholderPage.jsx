import React from 'react';
import { Calculator } from 'lucide-react';

function PlaceholderPage({ title, setActiveTab }) {
  return (
    <div className="pt-40 pb-24 flex flex-col items-center text-center max-w-xl mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(34,211,238,0.15)] animate-pulse">
        <Calculator className="w-10 h-10 text-cyan-400" />
      </div>
      <h1 className="font-poppins text-4xl font-bold text-white mb-4">
        {title} Tool
      </h1>
      <p className="text-gray-400 text-lg leading-relaxed mb-6">
        This feature is currently under active development. Stay tuned as we build more features for the Academic Excellence Platform!
      </p>
      <button
        onClick={() => setActiveTab('Home')}
        className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/50 rounded-xl font-semibold text-cyan-400 transition-all duration-300 shadow-md cursor-pointer"
      >
        Back to Home
      </button>
    </div>
  );
}

export default PlaceholderPage;
