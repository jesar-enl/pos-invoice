"use client";

import { create } from "zustand";
import type { Draft, DraftLine } from "./types";

const emptyDraft: Draft = {
  customerId: null,
  customerName: "",
  lines: [],
};

function newLineId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

type DraftState = {
  draft: Draft;
  setCustomer: (name: string, id?: string | null) => void;
  clearCustomer: () => void;
  addLine: (line: Omit<DraftLine, "id">) => void;
  updateLine: (id: string, patch: Partial<DraftLine>) => void;
  removeLine: (id: string) => void;
  reset: () => void;
};

export const useDraftStore = create<DraftState>((set) => ({
  draft: emptyDraft,

  setCustomer: (name, id = null) =>
    set((s) => ({
      draft: { ...s.draft, customerName: name, customerId: id },
    })),

  clearCustomer: () =>
    set((s) => ({
      draft: { ...s.draft, customerName: "", customerId: null },
    })),

  addLine: (line) =>
    set((s) => {
      // If same product already exists, increment its quantity
      if (line.productId) {
        const existing = s.draft.lines.find(
          (l) => l.productId === line.productId
        );
        if (existing) {
          return {
            draft: {
              ...s.draft,
              lines: s.draft.lines.map((l) =>
                l.id === existing.id
                  ? { ...l, quantity: l.quantity + line.quantity }
                  : l
              ),
            },
          };
        }
      }
      return {
        draft: {
          ...s.draft,
          lines: [...s.draft.lines, { ...line, id: newLineId() }],
        },
      };
    }),

  updateLine: (id, patch) =>
    set((s) => ({
      draft: {
        ...s.draft,
        lines: s.draft.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      },
    })),

  removeLine: (id) =>
    set((s) => ({
      draft: {
        ...s.draft,
        lines: s.draft.lines.filter((l) => l.id !== id),
      },
    })),

  reset: () => set({ draft: emptyDraft }),
}));
