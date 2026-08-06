"use client";

import { propertiesApi } from "@/lib/api";
import { PropertyFilterListPage } from "@/components/PropertyFilterListPage";

export default function TrendingPage() {
  return (
    <PropertyFilterListPage
      title="Trending"
      description="Properties flagged as trending, shown to users in the Trending section"
      emptyMessage="No trending properties yet"
      fetchProperties={(page, limit) =>
        propertiesApi.getProperties(
          page,
          limit,
          undefined,
          undefined,
          true,
        )
      }
      badgeLabel="Trending"
      badgeClassName="bg-orange-100 text-orange-700"
    />
  );
}
