import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Users, Package, X, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [ordersRes, custRes, prodRes] = await Promise.all([
          api.get(`/orders?search=${encodeURIComponent(query)}&limit=4`),
          api.get(`/customers?search=${encodeURIComponent(query)}&limit=4`),
          api.get(`/products?search=${encodeURIComponent(query)}&limit=4`),
        ]);

        setResults({
          orders: ordersRes.data || [],
          customers: custRes.data || [],
          products: prodRes.data || [],
        });
        setIsOpen(true);
      } catch (err) {
        console.error('[GlobalSearch Error]', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (path) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim().length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="Global search orders, customers, products..."
          className="w-full pl-10 pr-9 py-2 text-sm bg-muted/50 hover:bg-muted/80 focus:bg-background border border-border/80 focus:border-primary rounded-xl text-foreground placeholder:text-muted-foreground outline-none transition-all"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        ) : query ? (
          <button
            onClick={() => {
              setQuery('');
              setResults(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Results Dropdown */}
      {isOpen && results && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto animate-in fade-in duration-150">
          {results.orders.length === 0 && results.customers.length === 0 && results.products.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No matches found for "{query}"</div>
          ) : (
            <div className="p-2 divide-y divide-border">
              {/* Orders Section */}
              {results.orders.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-primary" /> Orders
                  </div>
                  {results.orders.map((ord) => (
                    <button
                      key={ord._id}
                      onClick={() => handleSelect(`/orders/${ord._id}`)}
                      className="w-full text-left px-3 py-2 hover:bg-muted/60 rounded-lg flex items-center justify-between text-sm group transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground group-hover:text-primary">{ord.orderNumber}</span>
                        <span className="text-xs text-muted-foreground">{ord.customer?.name || 'Unknown Customer'}</span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                        {ord.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Customers Section */}
              {results.customers.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> Customers
                  </div>
                  {results.customers.map((cust) => (
                    <button
                      key={cust._id}
                      onClick={() => handleSelect(`/customers/${cust._id}`)}
                      className="w-full text-left px-3 py-2 hover:bg-muted/60 rounded-lg flex items-center justify-between text-sm group transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground group-hover:text-primary">{cust.name}</span>
                        <span className="text-xs text-muted-foreground">{cust.companyName || cust.email}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Products Section */}
              {results.products.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-emerald-500" /> Products
                  </div>
                  {results.products.map((prod) => (
                    <button
                      key={prod._id}
                      onClick={() => handleSelect('/products')}
                      className="w-full text-left px-3 py-2 hover:bg-muted/60 rounded-lg flex items-center justify-between text-sm group transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground group-hover:text-primary">{prod.name}</span>
                        <span className="text-xs text-muted-foreground">{prod.sku ? `SKU: ${prod.sku}` : prod.category}</span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {prod.defaultUOM}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
