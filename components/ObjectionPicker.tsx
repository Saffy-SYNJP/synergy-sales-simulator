"use client";
import { useState } from "react";
import {
  OBJECTIONS,
  CATEGORY_LABELS,
  ObjectionCategory,
} from "@/lib/objections";

export type ObjectionSelection =
  | { kind: "none" }
  | { kind: "specific"; id: number }
  | { kind: "category"; category: ObjectionCategory }
  | { kind: "random" };

interface Props {
  value: ObjectionSelection;
  onChange: (s: ObjectionSelection) => void;
}

export default function ObjectionPicker({ value, onChange }: Props) {
  const [openCat, setOpenCat] = useState<ObjectionCategory | null>(null);
  const cats = Object.keys(CATEGORY_LABELS) as ObjectionCategory[];

  return (
    <div className="space-y-2">
      {/* Quick picks */}
      <div className="flex gap-2">
        <button
          onClick={() => onChange({ kind: "none" })}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
            value.kind === "none"
              ? "border-gold bg-gold/10 text-gold"
              : "border-navy-border bg-navy-card text-gray-400 hover:border-gray-600"
          }`}
        >
          Free play
        </button>
        <button
          onClick={() => onChange({ kind: "random" })}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
            value.kind === "random"
              ? "border-gold bg-gold/10 text-gold"
              : "border-navy-border bg-navy-card text-gray-400 hover:border-gray-600"
          }`}
        >
          🎲 Random
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
        {cats.map((cat) => {
          const isOpen = openCat === cat;
          const catActive = value.kind === "category" && value.category === cat;
          return (
            <div key={cat} className="rounded-lg border border-navy-border overflow-hidden">
              <div className="flex">
                <button
                  onClick={() => setOpenCat(isOpen ? null : cat)}
                  className="flex-1 text-left px-3 py-2 text-xs font-medium hover:bg-navy-hover transition-colors"
                >
                  <span className="text-gray-500 mr-1">{isOpen ? "▼" : "▶"}</span>
                  {CATEGORY_LABELS[cat]}
                </button>
                <button
                  onClick={() => onChange({ kind: "category", category: cat })}
                  className={`px-2.5 text-[10px] border-l border-navy-border transition-colors ${
                    catActive ? "bg-gold/10 text-gold" : "text-gray-500 hover:bg-navy-hover"
                  }`}
                >
                  All
                </button>
              </div>
              {isOpen && (
                <div className="bg-navy/60 px-2 pb-2 space-y-0.5">
                  {OBJECTIONS.filter((o) => o.category === cat).map((o) => {
                    const active = value.kind === "specific" && value.id === o.id;
                    return (
                      <button
                        key={o.id}
                        onClick={() => onChange({ kind: "specific", id: o.id })}
                        className={`w-full text-left text-[11px] px-2.5 py-1.5 rounded-lg transition-colors ${
                          active
                            ? "bg-gold/15 text-gold"
                            : "text-gray-400 hover:bg-navy-hover hover:text-gray-300"
                        }`}
                      >
                        #{o.id} — {o.text}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
