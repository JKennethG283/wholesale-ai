"use client";

import Link from "next/link";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import {
  filterCatalogueProducts,
  getStockStatus,
  type CatalogueFilters,
  type CatalogueProduct,
} from "@/lib/catalogue";
import { catalogueCategories, products, regions } from "@/lib/mock-data";
import { navigationItems } from "@/lib/navigation";

const priceOptions = [
  { label: "Any price", value: "" },
  { label: "Up to $50", value: "50" },
  { label: "Up to $100", value: "100" },
  { label: "Up to $150", value: "150" },
  { label: "Up to $250", value: "250" },
] as const;

const allSubcategories = Array.from(
  new Set(products.map((product) => product.subcategory)),
).sort();

function getSubcategories(category: string) {
  const source = category
    ? products.filter((product) => product.category === category)
    : products;

  return Array.from(new Set(source.map((product) => product.subcategory))).sort();
}

function getSimilarProductNames(product: CatalogueProduct) {
  return product.similarProductIds
    .map((id) => products.find((candidate) => candidate.id === id)?.name)
    .filter(Boolean)
    .join(", ");
}

function getCategoryHeadingId(category: string) {
  return `category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function ProductCard({ product }: { product: CatalogueProduct }) {
  const stockStatus = getStockStatus(product.stock);
  const similarProductNames = getSimilarProductNames(product);

  return (
    <article className="catalogue-card" aria-label={product.name}>
      <div className="product-visual" aria-label={`Synthetic product placeholder for ${product.name}`}>
        <span>{product.imageLabel}</span>
      </div>

      <div className="product-card-body">
        <div className="product-card-topline">
          <span>{product.category}</span>
          <span>{product.subcategory}</span>
        </div>
        <h3>{product.name}</h3>
        <p className="product-brand">{product.brand}</p>
        <p className="product-description">{product.description}</p>

        <div className="ai-badge-row" aria-label={`AI recommendation badges for ${product.name}`}>
          {product.aiBadges.map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>

        <dl className="product-facts">
          <div>
            <dt>Stock</dt>
            <dd>{product.stock} cases</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd className={`status-pill status-${stockStatus.tone}`}>{stockStatus.label}</dd>
          </div>
          <div>
            <dt>Regions</dt>
            <dd>{product.regions.join(", ")}</dd>
          </div>
          <div>
            <dt>Base price</dt>
            <dd>${product.basePrice} / case</dd>
          </div>
          <div>
            <dt>Pack</dt>
            <dd>{product.packageSize}</dd>
          </div>
        </dl>

        <div className="quantity-pricing" aria-label={`Quantity pricing for ${product.name}`}>
          {product.quantityPricing.map((tier) => (
            <span key={`${product.id}-${tier.minCases}`}>
              {tier.minCases}+ cases ${tier.price}
            </span>
          ))}
        </div>

        {similarProductNames ? (
          <p className="similar-products">Similar: {similarProductNames}</p>
        ) : null}
      </div>
    </article>
  );
}

export function CatalogueBrowser() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [region, setRegion] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const availableSubcategories = useMemo(
    () => (category ? getSubcategories(category) : allSubcategories),
    [category],
  );

  const filters: CatalogueFilters = {
    search,
    category,
    subcategory,
    region,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  };

  const visibleProducts = filterCatalogueProducts(products, filters);
  const visibleByCategory = catalogueCategories.map((catalogueCategory) => ({
    category: catalogueCategory,
    products: visibleProducts.filter((product) => product.category === catalogueCategory),
  }));

  function clearFilters() {
    setSearch("");
    setCategory("");
    setSubcategory("");
    setRegion("");
    setMaxPrice("");
  }

  return (
    <div className="shell">
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand-lockup" href="/" aria-label="LiquorOps AI home">
            <span className="brand-mark">LO</span>
            <span className="brand-text">
              <strong>LiquorOps AI</strong>
              <span>Synthetic wholesale portal</span>
            </span>
          </Link>
          <nav className="primary-nav" aria-label="Primary">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="catalogue-main">
        <section className="catalogue-title-band" aria-labelledby="catalogue-title">
          <div>
            <p className="eyebrow">Wholesale catalogue</p>
            <h1 id="catalogue-title">Buyer stock ordering desk</h1>
            <p>
              Browse synthetic wholesale liquor, beverage, service, and counter-stock lines by
              category, region availability, and quantity pricing.
            </p>
          </div>
          <div className="catalogue-metrics" aria-label="Catalogue metrics">
            <span>
              <strong>{products.length}</strong>
              Product lines
            </span>
            <span>
              <strong>{catalogueCategories.length}</strong>
              Categories
            </span>
            <span>
              <strong>{regions.length}</strong>
              Delivery regions
            </span>
          </div>
        </section>

        <section className="catalogue-toolbar" aria-label="Catalogue filters">
          <div className="toolbar-heading">
            <SlidersHorizontal aria-hidden="true" size={18} />
            <strong>Filter stock list</strong>
          </div>

          <label className="control search-control">
            <span>Search products</span>
            <span className="input-with-icon">
              <Search aria-hidden="true" size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by product name"
                type="search"
              />
            </span>
          </label>

          <label className="control">
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setSubcategory("");
              }}
            >
              <option value="">All categories</option>
              {catalogueCategories.map((catalogueCategory) => (
                <option key={catalogueCategory} value={catalogueCategory}>
                  {catalogueCategory}
                </option>
              ))}
            </select>
          </label>

          <label className="control">
            <span>Subcategory</span>
            <select value={subcategory} onChange={(event) => setSubcategory(event.target.value)}>
              <option value="">All subcategories</option>
              {availableSubcategories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="control">
            <span>Region</span>
            <select value={region} onChange={(event) => setRegion(event.target.value)}>
              <option value="">All regions</option>
              {regions.map((catalogueRegion) => (
                <option key={catalogueRegion} value={catalogueRegion}>
                  {catalogueRegion}
                </option>
              ))}
            </select>
          </label>

          <label className="control">
            <span>Base price</span>
            <select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}>
              {priceOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button className="reset-button" type="button" onClick={clearFilters}>
            <RotateCcw aria-hidden="true" size={16} />
            Reset
          </button>
        </section>

        <p className="results-summary" aria-live="polite">
          Showing {visibleProducts.length} of {products.length} synthetic wholesale products.
        </p>

        {visibleProducts.length === 0 ? (
          <section className="empty-state" aria-live="polite">
            <h2>No catalogue products match these filters</h2>
            <p>Try broadening the region, category, subcategory, search term, or price ceiling.</p>
          </section>
        ) : (
          <div className="catalogue-sections">
            {visibleByCategory.map(({ category: catalogueCategory, products: categoryProducts }) => {
              const headingId = getCategoryHeadingId(catalogueCategory);

              return (
              <section className="catalogue-section" key={catalogueCategory} aria-labelledby={headingId}>
                <div className="category-section-heading">
                  <div>
                    <h2 id={headingId}>{catalogueCategory}</h2>
                    <p>
                      {getSubcategories(catalogueCategory).join(" / ")}
                    </p>
                  </div>
                  <span>{categoryProducts.length} visible</span>
                </div>

                {categoryProducts.length > 0 ? (
                  <div className="catalogue-card-grid">
                    {categoryProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <p className="category-empty">No visible products in this category for the current filters.</p>
                )}
              </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
