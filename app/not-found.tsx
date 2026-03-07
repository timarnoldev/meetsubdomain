"use client";

import { Instrument_Serif, Figtree, Outfit } from "next/font/google";
import { Mail, Linkedin, Globe, ArrowUpRight } from "lucide-react";

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

export default function NotFound() {
  return (
    <div
      className={`flex min-h-svh flex-col items-center justify-center ${figtree.className}`}
      style={{ background: "#faf8f4", color: "#1a1a1a" }}
    >
      <div className="flex max-w-lg flex-col items-center gap-8 px-6 text-center">
        <p
          className={`text-sm uppercase tracking-[0.25em] ${outfit.className}`}
          style={{ color: "#4f6d24" }}
        >
          Page not found
        </p>
        <h1
          className={`text-7xl tracking-tight sm:text-8xl ${instrumentSerif.className}`}
          style={{ color: "#1a1a1a" }}
        >
          <span className="italic">404</span>
        </h1>
        <p className="text-lg leading-relaxed" style={{ color: "#6b7280" }}>
          The meeting link you followed may be expired or incorrect. If you
          think this is a mistake, feel free to reach out.
        </p>
        <a
          href="mailto:hello@tim-arnold.de"
          className="flex items-center justify-center gap-2 rounded-full px-10 py-4 text-sm font-semibold transition-colors"
          style={{
            background: "#4f6d24",
            color: "#ffffff",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "#3f5a1b")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "#4f6d24")
          }
        >
          <Mail size={16} />
          Write me an email
        </a>
        <div className="flex items-center gap-6">
          <a
            href="https://www.linkedin.com/in/timarnold-/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "#6b7280" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.color = "#4f6d24")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.color = "#6b7280")
            }
          >
            <Linkedin size={15} />
            LinkedIn
            <ArrowUpRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
          <span style={{ color: "#1a1a1a15" }}>|</span>
          <a
            href="https://tim-arnold.de"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "#6b7280" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.color = "#4f6d24")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.color = "#6b7280")
            }
          >
            <Globe size={15} />
            tim-arnold.de
            <ArrowUpRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        </div>
        <p className="text-xs" style={{ color: "#1a1a1a20" }}>
          &copy; {new Date().getFullYear()} Tim Arnold
        </p>
      </div>
    </div>
  );
}
