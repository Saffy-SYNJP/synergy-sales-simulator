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

  const btn = (active: boolean) =>
    `px-3 py-2 rounded text-xs font-medium transition border ${
      active ? "border-gold bg-gold/20 text-gold" : "border-navy-surface bg-navy-surface text-gray-300 hover:border-gray-500"
    }`;

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onChange({ kind: "none" })}
          className={btn(value.kind === "none")}
        >
          None (free play)
        </button>
        <button
          onClick={() => onChange({ kind: "random" })}
          className={btn(value.kind === "random")}
        >
          🎲 Random Mix
        </button>
      </div>

      <div className="space-y-1">
        {cats.map((cat) => {
          const isOpen = openCat === cat;
          const catActive =
            value.kind === "category" && value.category === cat;
          return (
            <div
              key={cat}
              className="border border-navy-surface rounded overflow-hidden"
            >
              <div className="flex">
                <button
                  onClick={() => setOpenCat(isOpen ? null : cat)}
                  className="flex-1 text-left px-3 py-2 text-sm font-medium hover:bg-navy-surface"
                >
                  {isOpen ? "▼" : "▶"} {CATEGORY_LABELS[cat]}
                </button>
                <button
                  onClick={() => onChange({ kind: "category", category: cat })}
                  className={`px-3 text-xs border-l border-navy ${
                    catActive ? "bg-gold/20 text-gold" : "text-gray-400 hover:bg-navy-surface"
                  }`}
                >
                  Pick all
                </button>
              </div>
              {isOpen && (
                <div className="bg-navy px-2 pb-2 space-y-1">
                  {OBJECTIONS.filter((o) => o.category === cat).map((o) => {
                    const active =
                      value.kind === "specific" && value.id === o.id;
                    return (
                      <button
                        key={o.id}
                        onClick={() => onChange({ kind: "specific", id: o.id })}
                        className={`w-full text-left text-xs px-2 py-1.5 rounded ${
                          active
                            ? "bg-gold/20 text-gold"
                            : "text-gray-400 hover:bg-navy-surface"
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
