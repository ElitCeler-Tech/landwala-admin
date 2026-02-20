import { create } from "zustand";
import { ListingRequest } from "@/lib/api";

interface ListingRequestsState {
  requestDetails: Record<string, ListingRequest>;
  setRequestDetail: (id: string, data: ListingRequest) => void;
  getRequestDetail: (id: string) => ListingRequest | null;
}

export const useListingRequestsStore = create<ListingRequestsState>(
  (set, get) => ({
    requestDetails: {},

    setRequestDetail: (id, data) =>
      set((state) => ({
        requestDetails: {
          ...state.requestDetails,
          [id]: data,
        },
      })),

    getRequestDetail: (id) => {
      return get().requestDetails[id] || null;
    },
  }),
);
