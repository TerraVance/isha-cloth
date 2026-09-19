'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppFAB from '@/components/ui/WhatsAppFAB';
import SareeCard, { SareeCardSkeleton } from '@/components/product/SareeCard';
import { Product } from '@/types/database';

const CATEGORIES = ['All', 'Cotton', 'Silk', 'Banarasi', 'Paithani', 'Chanderi', 'Kanjivaram'];
const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Latest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

const PAGE_SIZE = 12;

export default function CollectionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const category = searchParams.get('category') || 'All';
  const sort = searchParams.get('sort') || 'created_at_desc';
  const featured = searchParams.get('featured') === 'true';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Local state for price inputs
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  const fetchProducts = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort,
        page: String(p),
        pageSize: String(PAGE_SIZE),
      });
      if (category !== 'All') params.set('category', category);
      if (featured) params.set('featured', 'true');
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

      const res = await fetch(`/api/products?${params}`);
      const json = await res.json();
      if (p === 1) {
        setProducts(json.data || []);
      } else {
        setProducts(prev => [...prev, ...(json.data || [])]);
      }
      setTotal(json.total || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, sort, featured, minPrice, maxPrice]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [fetchProducts]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'All') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/collection?${params.toString()}`);
  };

  const applyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (localMin) params.set('minPrice', localMin);
    else params.delete('minPrice');
    
    if (localMax) params.set('maxPrice', localMax);
    else params.delete('maxPrice');
    
    params.delete('page');
    router.push(`/collection?${params.toString()}`);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProducts(next);
  };

  const hasMore = products.length < total;

  return (
    <>
      <Navbar />
      <main>
        {/* Page Header */}
        <div className="collection-header">
          <div className="container">
            <nav aria-label="Breadcrumb" className="breadcrumb">
              <a href="/">Home</a> <span>/</span>
              <span>Collection</span>
            </nav>
            <h1 className="collection-title">
              {featured ? '⭐ Featured Collection' : category !== 'All' ? `${category} Sarees` : 'All Sarees'}
            </h1>
            <p className="collection-count">
              {loading ? 'Loading…' : `${total} saree${total !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </div>

        <div className="container">
          {/* Filters Bar */}
          <div className="filters-bar">
            {/* Category Pills */}
            <div className="category-pills" role="group" aria-label="Filter by category">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => updateFilter('category', cat)}
                  className={`category-pill${category === cat || (cat === 'All' && !searchParams.get('category')) ? ' active' : ''}`}
                  id={`filter-${cat.toLowerCase()}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Price Filter & Sort Dropdown */}
            <div className="filters-right">
              <form onSubmit={applyPriceFilter} className="price-filter">
                <input 
                  type="number" 
                  placeholder="Min ₹" 
                  value={localMin} 
                  onChange={e => setLocalMin(e.target.value)}
                  className="price-input"
                  min="0"
                />
                <span>-</span>
                <input 
                  type="number" 
                  placeholder="Max ₹" 
                  value={localMax} 
                  onChange={e => setLocalMax(e.target.value)}
                  className="price-input"
                  min="0"
                />
                <button type="submit" className="price-apply">Apply</button>
              </form>

              <div className="sort-wrap">
                <label htmlFor="sort-select" className="sr-only">Sort by</label>
                <select
                  id="sort-select"
                  value={sort}
                  onChange={e => updateFilter('sort', e.target.value)}
                  className="sort-select"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading && products.length === 0 ? (
            <div className="products-grid">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <SareeCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <span aria-hidden="true">🌸</span>
              <h2>No sarees found</h2>
              <p>Try a different category or check back soon for new arrivals.</p>
              <button className="btn btn-primary btn-md" onClick={() => router.push('/collection')}>
                View All Sarees
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map(product => (
                  <SareeCard key={product.id} product={product} />
                ))}
                {loading && Array.from({ length: 4 }).map((_, i) => <SareeCardSkeleton key={`sk-${i}`} />)}
              </div>

              {hasMore && !loading && (
                <div className="load-more-wrap">
                  <button className="btn btn-outline btn-lg" onClick={loadMore} id="load-more-btn">
                    Load More Sarees
                  </button>
                  <p className="load-more-count">
                    Showing {products.length} of {total}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />

      <style>{`
        .collection-header {
          background: linear-gradient(135deg, var(--color-burgundy), #3D0B18);
          color: white;
          padding: var(--space-12) 0 var(--space-8);
          margin-bottom: var(--space-8);
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: rgba(255,255,255,0.6);
          margin-bottom: var(--space-4);
        }

        .breadcrumb a { color: var(--color-gold-light); text-decoration: none; }
        .breadcrumb a:hover { text-decoration: underline; }

        .collection-title {
          font-family: var(--font-heading);
          font-size: var(--text-5xl);
          color: white;
          margin-bottom: var(--space-2);
        }

        .collection-count {
          color: rgba(255,255,255,0.65);
          font-size: var(--text-base);
        }

        .filters-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          margin-bottom: var(--space-8);
          flex-wrap: wrap;
          padding: var(--space-4) 0;
          border-bottom: 1px solid var(--color-gray-200);
        }

        .category-pills {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .category-pill {
          padding: var(--space-2) var(--space-5);
          border-radius: var(--radius-full);
          font-size: var(--text-sm);
          font-weight: 500;
          border: 1.5px solid var(--color-gray-300);
          background: white;
          color: var(--color-gray-600);
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .category-pill:hover {
          border-color: var(--color-maroon);
          color: var(--color-maroon);
        }

        .category-pill.active {
          background: var(--color-maroon);
          border-color: var(--color-maroon);
          color: white;
        }

        .filters-right {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .price-filter {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: white;
          border: 1.5px solid var(--color-gray-200);
          border-radius: var(--radius-full);
          padding: var(--space-1) var(--space-2);
        }

        .price-input {
          width: 70px;
          border: none;
          background: transparent;
          text-align: center;
          font-size: var(--text-sm);
          outline: none;
        }

        .price-apply {
          background: var(--color-gold);
          color: white;
          border: none;
          border-radius: var(--radius-full);
          padding: 4px 12px;
          font-size: var(--text-xs);
          font-weight: 600;
          cursor: pointer;
        }
        .price-apply:hover { background: var(--color-gold-dark); }

        .sort-wrap {
          position: relative;
        }

        .sort-select {
          padding: var(--space-2) var(--space-4);
          border: 1.5px solid var(--color-gray-300);
          border-radius: var(--radius-md);
          background: white;
          font-size: var(--text-sm);
          color: var(--color-charcoal);
          cursor: pointer;
          outline: none;
          transition: border-color var(--transition-fast);
        }
        .sort-select:focus { border-color: var(--color-maroon); }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
          margin-bottom: var(--space-12);
        }

        @media (max-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px)  { .products-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-4); } }
        @media (max-width: 400px)  { .products-grid { grid-template-columns: 1fr; } }

        .empty-state {
          text-align: center;
          padding: var(--space-24) 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
        }
        .empty-state span { font-size: 4rem; }
        .empty-state h2 { font-family: var(--font-heading); color: var(--color-burgundy); }
        .empty-state p  { color: var(--color-gray-500); }

        .load-more-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-16);
        }

        @media (max-width: 768px) {
          .filters-bar { flex-direction: column; align-items: flex-start; }
          .category-pills { overflow-x: auto; padding-bottom: var(--space-2); width: 100%; }
          .filters-right { width: 100%; flex-wrap: wrap; justify-content: space-between; }
          .sort-wrap, .sort-select { width: auto; flex-grow: 1; }
        }

        .load-more-count {
          font-size: var(--text-sm);
          color: var(--color-gray-400);
        }
      `}</style>
    </>
  );
}
