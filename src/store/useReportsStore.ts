import { create } from "zustand";
import { Report } from "@/lib/api";

interface ReportsState {
  reportDetails: Record<string, Report>;
  setReportDetail: (id: string, data: Report) => void;
  getReportDetail: (id: string) => Report | null;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  reportDetails: {},

  setReportDetail: (id, data) =>
    set((state) => ({
      reportDetails: {
        ...state.reportDetails,
        [id]: data,
      },
    })),

  getReportDetail: (id) => {
    return get().reportDetails[id] || null;
  },
}));
