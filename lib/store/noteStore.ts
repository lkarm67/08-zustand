import { create } from "zustand";
import { CreateNoteParams } from "@/types/note";
import {  persist } from "zustand/middleware";

type NoteDraftStore = {
    draft: CreateNoteParams;
    setDraft: (draft: CreateNoteParams) => void;
    clearDraft: () => void;
};

export const useNoteDraftStore = create<NoteDraftStore>()(
    persist((set) => ({
      draft: { title: "", content: "", tag: "Todo" },
      setDraft: (draft) => set({ draft }),
      clearDraft: () => set({ draft: { title: "", content: "", tag: "Todo" }}),
    }),
    {
        name: "note-draft",
        partialize: (state) => ({ draft: state.draft }),
    }
  ),
);
