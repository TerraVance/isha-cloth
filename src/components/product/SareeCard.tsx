'use client';

import React, { useRef, MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/database';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

interface SareeCardProps {
  product: Product;
  showAddToCart?: boolean;
  customAction?: React.ReactNode;
  asPreview?: boolean;
}

export default function SareeCard({ product, showAddToCart = true, customAction, asPreview = false }: SareeCardProps) {
  const { addToCart, isInCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // C4: 3D tilt state
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const inCart = isInCart(product.id);
  const isOutOfStock = product.stock === 0;
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding || isOutOfStock) return;

    setAdding(true);
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      stock: product.stock,
    });
    setTimeout(() => {
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }, 400);
  };

  // C4: 3D tilt effect on mouse move
  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -6;
    const rotateY = ((x - cx) / cx) * 6;
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
      transition: 'transform 0.1s ease',
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'transform 0.4s ease',
    });
  };

  const CardWrapper = asPreview ? 'div' : Link;
  const wrapperProps = asPreview ? {} : { href: `/saree/${product.id}` };

  return (
    <CardWrapper
      {...wrapperProps as any}
      className="saree-card"
      aria-label={`View ${product.name}`}
      ref={cardRef as any}
      onMouseMove={handleMouseMove as any}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
    >
      {/* Image */}
      <div className="saree-card-image-wrap">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 480px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="saree-card-img"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="saree-card-placeholder">
            <span>🌸</span>
          </div>
        )}

        {/* Badges */}
        <div className="saree-card-badges">
          {product.featured && <span className="badge badge-new">Featured</span>}
          {discount && discount > 0 && <span className="badge badge-sale">{discount}% OFF</span>}
          {isOutOfStock && <span className="badge badge-draft">Sold Out</span>}
        </div>

        {/* Quick view overlay */}
        <div className="saree-card-overlay">
          <span className="saree-card-overlay-text">View Details</span>
        </div>
      </div>

      {/* Body */}
      <div className="saree-card-body">
        <p className="saree-card-category">{product.category}</p>
        <h3 className="saree-card-name">{product.name}</h3>

        {/* Price */}
        <div className="saree-card-price">
          <span className="price-current">₹{product.price.toLocaleString('en-IN')}</span>
          {product.compare_price && (
            <span className="price-original">₹{product.compare_price.toLocaleString('en-IN')}</span>
          )}
        </div>

        {/* Add to Cart / Custom Action */}
        {customAction ? (
          customAction
        ) : showAddToCart && (
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`btn btn-md saree-card-cta${inCart ? ' saree-card-cta-added' : ''}${isOutOfStock ? ' saree-card-cta-oos' : ''}`}
            aria-label={isOutOfStock ? 'Out of stock' : inCart ? 'Added to cart' : `Add ${product.name} to cart`}
            id={`add-to-cart-${product.id}`}
          >
            {adding ? (
              <><span className="spinner" />&nbsp;Adding…</>
            ) : added || inCart ? (
              <>✓ In Cart</>
            ) : isOutOfStock ? (
              <>Sold Out</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Add to Cart
              </>
            )}
          </button>
        )}
      </div>

      <style>{`
        .saree-card { transform-style: preserve-3d; will-change: transform; display: block; text-decoration: none; color: inherit; }
        .saree-card-img { transition: transform var(--transition-slow); }
        .saree-card:hover .saree-card-img { transform: scale(1.08); }

        .saree-card-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: var(--color-cream-dark);
          font-size: 3rem;
        }

        .saree-card-overlay {
          position: absolute; inset: 0;
          background: rgba(74,14,27,0);
          display: flex; align-items: center; justify-content: center;
          transition: background var(--transition-normal);
        }
        .saree-card:hover .saree-card-overlay { background: rgba(74,14,27,0.35); }

        .saree-card-overlay-text {
          color: white; font-weight: 600; font-size: var(--text-sm);
          letter-spacing: 0.05em; opacity: 0;
          transform: translateY(8px);
          transition: all var(--transition-normal);
        }
        .saree-card:hover .saree-card-overlay-text {
          opacity: 1; transform: translateY(0);
        }

        .saree-card-category {
          font-size: var(--text-xs);
          color: var(--color-gold-dark);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
          margin-bottom: var(--space-1);
        }

        .saree-card-cta {
          width: 100%;
          background: linear-gradient(135deg, var(--color-maroon), var(--color-maroon-dark));
          color: white;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: 600;
          transition: all var(--transition-normal);
          box-shadow: none;
        }
        .saree-card-cta:hover { box-shadow: var(--shadow-maroon); transform: translateY(-1px); }
        .saree-card-cta-added {
          background: linear-gradient(135deg, var(--color-success), #15803D) !important;
        }
        .saree-card-cta-oos {
          background: var(--color-gray-300) !important;
          color: var(--color-gray-500) !important;
          cursor: not-allowed;
        }
      `}</style>
    </CardWrapper>
  );
}

// Skeleton loader version
export function SareeCardSkeleton() {
  return (
    <div className="saree-card skeleton-card" aria-hidden="true">
      <div className="skeleton-image" style={{ aspectRatio: '3/4' }} />
      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div className="skeleton skeleton-text" style={{ width: '40%', height: '12px' }} />
        <div className="skeleton skeleton-text" style={{ width: '80%', height: '20px' }} />
        <div className="skeleton skeleton-text" style={{ width: '50%', height: '24px' }} />
        <div className="skeleton" style={{ height: '40px', borderRadius: 'var(--radius-md)' }} />
      </div>
    </div>
  );
}
