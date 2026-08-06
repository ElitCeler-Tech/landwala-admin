"use client";

import { propertiesApi } from "@/lib/api";
import { PropertyFilterListPage } from "@/components/PropertyFilterListPage";

export default function HotSalePage() {
  return (
    <PropertyFilterListPage
      title="Hot Sale"
      description="Properties flagged as hot sale, highlighted to users as high-priority listings"
      emptyMessage="No hot sale properties yet"
      fetchProperties={(page, limit) =>
        propertiesApi.getProperties(
          page,
          limit,
          undefined,
          undefined,
          undefined,
          true,
        )
      }
      badgeLabel="Hot Sale"
      badgeClassName="bg-red-100 text-red-700"
    />
  );
}
