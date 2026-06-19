"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/5">
      {/* Subtle gradient glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left — Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
              <span className="text-sm">🌍</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Global AQ Intelligence
              </p>
              <p className="text-xs text-slate-500">V7 Thermodynamics Engine · June 2026</p>
            </div>
          </div>

          {/* Center — Built by */}
          <div className="text-center">
            <p className="text-sm text-slate-400">
              Built by{" "}
              <a
                href="https://github.com/divyanshailani"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
              >
                Divyansh Ailani
              </a>
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Simulation Architect · First-Principles Engineering
            </p>
          </div>

          {/* Right — GitHub */}
          <a
            href="https://github.com/divyanshailani"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.06] transition-all duration-300"
          >
            <svg
              className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="text-xs text-slate-400 group-hover:text-slate-200 font-medium transition-colors">
              GitHub
            </span>
          </a>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
          <p className="text-xs text-slate-600">
            © 2026 Global AQ Intelligence. Data sourced from EPA, CPCB, DEFRA,
            NSW EPA, and OpenAQ.
          </p>
        </div>
      </div>
    </footer>
  );
}
