"use client";

import { Instrument_Serif, Figtree, Outfit } from "next/font/google";
import { Github, ArrowUpRight } from "lucide-react";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600"],
});

export default function Page() {
  return (
    <div
      className={`flex min-h-svh flex-col items-center justify-center ${figtree.className}`}
      style={{ background: "#faf8f4", color: "#1a1a1a" }}
    >
      <div className="flex max-w-sm flex-col items-center gap-6 px-6 text-center">
        <h1
          className={`text-5xl tracking-tight sm:text-6xl ${instrumentSerif.className}`}
        >
          <span className="italic">Curious?</span>
        </h1>

        <p className="leading-relaxed" style={{ color: "#6b7280" }}>
          You found a meeting link service. It turns short URLs into video
          calls. Built from scratch, fully open source.
        </p>

        <a
          href="https://github.com/timarnoldev/meetsubdomain"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-colors"
          style={{ background: "#4f6d24", color: "#ffffff" }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "#3f5a1b")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "#4f6d24")
          }
        >
          <Github size={16} />
          See how it works
          <ArrowUpRight size={13} />
        </a>

        <p className="mt-4 text-xs" style={{ color: "#1a1a1a20" }}>
          &copy; {new Date().getFullYear()} Tim Arnold
        </p>
      </div>
    </div>
  );
}
