"use client";

import { propertiesApi } from "@/lib/api";
import { PropertyFilterListPage } from "@/components/PropertyFilterListPage";

export default function NearByPropertiesPage() {
  return (
    <PropertyFilterListPage
      title="Near By Properties"
      description="Properties flagged for the app's Explore Nearby section"
      emptyMessage="No near by properties yet"
      fetchProperties={(page, limit) =>
        propertiesApi.getProperties(
          page,
          limit,
          undefined,
          undefined,
          undefined,
          undefined,
          true,
        )
      }
      badgeLabel="Near By"
      badgeClassName="bg-blue-100 text-blue-700"
    />
  );
}
