import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X, ArrowRight, Check, ArrowLeft } from 'lucide-react';
import { WOOD_TYPES, FINISHES, type WoodType, type Finish, type Product } from '@/data/products';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

function ProductCard({
  product,
  index,
  onViewDetails,
}: {
  product: Product;
  index: number;
  onViewDetails: (product: Product) => void;
}) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} group flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift`}
      style={{ transitionDelay: `${(index % 3) * 90}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {product.tag && (
          <span className="absolute left-4 top-4 rounded-full bg-walnut-800 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-sand-50 shadow-soft">
            {product.tag}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-600 leading-tight text-walnut-900">{product.name}</h3>
          <p className="shrink-0 font-display text-lg font-700 text-brass-600">
            ${product.pricePerSqm}
            <span className="block text-right text-xs font-400 text-ink-400">/ m²</span>
          </p>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-ink-500 line-clamp-2">{product.description}</p>

        <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-ink-200/60 pt-5">
          <div>
            <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-400">Thickness</dt>
            <dd className="mt-1 text-sm font-medium text-ink-800">{product.thickness}</dd>
          </div>
          <div>
            <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-400">Plank Size</dt>
            <dd className="mt-1 text-sm font-medium text-ink-800">{product.plankSize}</dd>
          </div>
          <div>
            <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-400">Finish</dt>
            <dd className="mt-1 text-sm font-medium text-ink-800">{product.finish}</dd>
          </div>
        </dl>

        <div className="mt-6 flex items-center gap-2">
          <span className="rounded-full bg-walnut-800/8 px-3 py-1 text-xs font-medium text-walnut-800">
            {product.woodType}
          </span>
          <span className="rounded-full bg-sand-200/60 px-3 py-1 text-xs font-medium text-sand-800">
            {product.finish}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(product)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-walnut-800/25 py-3 text-sm font-medium tracking-wide text-walnut-800 transition-all duration-300 hover:bg-walnut-800 hover:text-sand-50 group/btn"
        >
          View Details
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

export default function Products() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [woodTypes, setWoodTypes] = useState<WoodType[]>([]);
  const [finishes, setFinishes] = useState<Finish[]>([]);
  const [sort, setSort] = useState<SortKey>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetch(`${SERVER_URL}/api/products`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const mapped: Product[] = data.data.map((p: any) => {
            let img = p.imageUrl || '';
            if (img.startsWith('/uploads/')) {
              img = `${SERVER_URL}${img}`;
            }
            return {
              id: p.id,
              name: p.title || 'Untitled Product',
              woodType: p.woodType || 'Oak',
              finish: p.finish || 'Brushed',
              thickness: p.thickness || '15 mm',
              plankSize: p.plankSize || '190 × 1900 mm',
              description: p.description || '',
              pricePerSqm: p.price || 0,
              image: img,
              tag: p.tag || undefined,
            };
          });
          setProducts(mapped);
        } else {
          throw new Error('Invalid products data format');
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Error loading products');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggle = <T,>(arr: T[], val: T, setter: (v: T[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    // For now, ignore wood type and finish filters as per request
    let list = products;
    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.pricePerSqm - b.pricePerSqm);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.pricePerSqm - a.pricePerSqm);
        break;
      case 'name-asc':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return list;
  }, [products, sort]);

  const activeCount = woodTypes.length + finishes.length;
  const clearAll = () => {
    setWoodTypes([]);
    setFinishes([]);
  };

  const FilterPanel = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-walnut-900">Wood Type</h3>
        <ul className="mt-4 space-y-2.5">
          {WOOD_TYPES.map((type) => {
            const active = woodTypes.includes(type);
            return (
              <li key={type}>
                <button
                  type="button"
                  onClick={() => toggle(woodTypes, type, setWoodTypes)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? 'bg-walnut-800/8 text-walnut-900' : 'text-ink-600 hover:bg-ink-100/60'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                      active ? 'border-walnut-800 bg-walnut-800 text-sand-50' : 'border-ink-300'
                    }`}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                  </span>
                  {type}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-walnut-900">Finish</h3>
        <ul className="mt-4 space-y-2.5">
          {FINISHES.map((finish) => {
            const active = finishes.includes(finish);
            return (
              <li key={finish}>
                <button
                  type="button"
                  onClick={() => toggle(finishes, finish, setFinishes)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? 'bg-walnut-800/8 text-walnut-900' : 'text-ink-600 hover:bg-ink-100/60'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                      active ? 'border-walnut-800 bg-walnut-800 text-sand-50' : 'border-ink-300'
                    }`}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                  </span>
                  {finish}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brass-700 hover:text-brass-800"
        >
          <X className="h-4 w-4" />
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Page header */}
      <section className="bg-ink-950 pt-36 pb-20 text-sand-100 lg:pt-44 lg:pb-28">
        <div className="container-wide">
          <p className="eyebrow text-brass-300">Our Collection</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-700 leading-[1.05] text-sand-50 sm:text-6xl">
            Flooring that grounds a home
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sand-100/70">
            Explore our collections of oak, walnut, herringbone and chevron parquet.
            Each floor is hand-finished and backed by a 25-year structural guarantee.
          </p>
        </div>
      </section>

      {/* Catalog */}
      <section className="py-16 lg:py-24">
        <div className="container-wide">
          {selectedProduct ? (
            <div className="animate-fade-in">
              {/* Back button & Breadcrumb */}
              <div className="mb-10 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-walnut-800 transition-colors hover:text-walnut-600 font-semibold"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Collection
                </button>
                <span className="text-ink-300">/</span>
                <span className="text-sm font-medium text-ink-600">{selectedProduct.name}</span>
              </div>

              {/* Main detail layout */}
              <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                {/* Full Image view */}
                <div className="lg:col-span-7">
                  <div className="overflow-hidden rounded-3xl bg-sand-50 border border-ink-200/60 p-2 shadow-soft">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-auto max-h-[75vh] object-contain rounded-2xl mx-auto shadow-sm"
                    />
                  </div>
                </div>

                {/* Specs and action info */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <div>
                    {selectedProduct.tag && (
                      <span className="inline-block rounded-full bg-walnut-800 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-sand-50 shadow-soft mb-4">
                        {selectedProduct.tag}
                      </span>
                    )}
                    <h2 className="font-display text-4xl font-700 text-walnut-900 leading-tight">
                      {selectedProduct.name}
                    </h2>
                    
                    <p className="mt-4 font-display text-2xl font-700 text-brass-600">
                      ${selectedProduct.pricePerSqm}
                      <span className="text-sm font-400 text-ink-400 ml-1">/ m²</span>
                    </p>

                    <div className="mt-6 border-t border-ink-200/60 pt-6">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-walnut-900 mb-3">
                        Description
                      </h3>
                      <p className="text-base leading-relaxed text-ink-600">
                        {selectedProduct.description}
                      </p>
                    </div>

                    <div className="mt-8 border-t border-ink-200/60 pt-6">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-walnut-900 mb-4">
                        Specifications
                      </h3>
                      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div className="border-b border-ink-100 pb-2">
                          <dt className="text-xs uppercase tracking-wider text-ink-400 font-semibold">Wood Type</dt>
                          <dd className="mt-1 text-sm font-medium text-ink-800">{selectedProduct.woodType}</dd>
                        </div>
                        <div className="border-b border-ink-100 pb-2">
                          <dt className="text-xs uppercase tracking-wider text-ink-400 font-semibold">Finish</dt>
                          <dd className="mt-1 text-sm font-medium text-ink-800">{selectedProduct.finish}</dd>
                        </div>
                        <div className="border-b border-ink-100 pb-2">
                          <dt className="text-xs uppercase tracking-wider text-ink-400 font-semibold">Thickness</dt>
                          <dd className="mt-1 text-sm font-medium text-ink-800">{selectedProduct.thickness}</dd>
                        </div>
                        <div className="border-b border-ink-100 pb-2">
                          <dt className="text-xs uppercase tracking-wider text-ink-400 font-semibold">Plank Size</dt>
                          <dd className="mt-1 text-sm font-medium text-ink-800">{selectedProduct.plankSize}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="mt-10 pt-6 border-t border-ink-200/60">
                    <Link
                      to="/contact"
                      state={{ fromProduct: selectedProduct.name }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-walnut-800 py-4 text-base font-semibold tracking-wide text-sand-50 transition-all duration-300 hover:bg-walnut-700 hover:shadow-lift"
                    >
                      Inquire About This Floor
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
              {/* Desktop sidebar */}
              <aside className="hidden w-64 shrink-0 lg:block">
                <div className="sticky top-28">
                  <div className="mb-6 flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-walnut-800" />
                    <h2 className="font-display text-lg font-600 text-walnut-900">Filters</h2>
                  </div>
                  <FilterPanel />
                </div>
              </aside>

              {/* Main grid */}
              <div className="flex-1">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:border-walnut-800 hover:text-walnut-800 lg:hidden"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {activeCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-walnut-800 text-xs text-sand-50">
                          {activeCount}
                        </span>
                      )}
                    </button>
                    <p className="text-sm text-ink-500">
                      Showing <span className="font-semibold text-walnut-900">{filtered.length}</span>{' '}
                      {filtered.length === 1 ? 'product' : 'products'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-ink-400" />
                    <label htmlFor="sort" className="sr-only">
                      Sort by
                    </label>
                    <select
                      id="sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="rounded-full border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors focus:border-walnut-500 focus:outline-none focus:ring-2 focus:ring-walnut-500/20"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="flex min-h-[300px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-walnut-800 border-t-transparent"></div>
                  </div>
                ) : error ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                    <p className="font-display text-lg font-600 text-red-600">Failed to load products</p>
                    <p className="mt-2 text-sm text-ink-500">{error}</p>
                  </div>
                ) : filtered.length > 0 ? (
                  <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i} onViewDetails={handleViewDetails} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-300 py-24 text-center">
                    <p className="font-display text-xl font-600 text-walnut-900">No floors match those filters</p>
                    <p className="mt-2 text-sm text-ink-500">Try removing a filter to see more options.</p>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-walnut-800 px-6 py-3 text-sm font-medium text-sand-50 transition-colors hover:bg-walnut-700"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-sand-50 p-6 shadow-lift">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl font-600 text-walnut-900">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-700 hover:bg-ink-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterPanel />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-8 w-full btn-primary"
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </>
  );
}
