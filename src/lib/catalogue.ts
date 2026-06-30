import type { products } from "@/lib/mock-data";

export type CatalogueProduct = (typeof products)[number];

export type CatalogueFilters = {
  search?: string;
  category?: string;
  subcategory?: string;
  region?: string;
  maxPrice?: number;
};

export function filterCatalogueProducts(
  catalogueProducts: readonly CatalogueProduct[],
  filters: CatalogueFilters,
) {
  const search = filters.search?.trim().toLowerCase();

  return catalogueProducts.filter((product) => {
    if (search && !product.name.toLowerCase().includes(search)) {
      return false;
    }

    if (filters.category && product.category !== filters.category) {
      return false;
    }

    if (filters.subcategory && product.subcategory !== filters.subcategory) {
      return false;
    }

    if (filters.region && !product.regions.includes(filters.region as never)) {
      return false;
    }

    if (filters.maxPrice !== undefined && product.basePrice > filters.maxPrice) {
      return false;
    }

    return true;
  });
}

export function getStockStatus(stock: number) {
  if (stock <= 0) {
    return { label: "Out of stock", tone: "out" as const };
  }

  if (stock < 40) {
    return { label: "Low stock", tone: "low" as const };
  }

  return { label: "In stock", tone: "in" as const };
}
