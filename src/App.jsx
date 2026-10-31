import { useState, useEffect, useCallback } from 'react';
import { fetchWithRetry } from './api/productsApi';
import { useDebounce } from './hooks/useDebounce';
import { SearchBar } from './components/SearchBar';
import { ProductList } from './components/ProductList';
import { Pagination } from './components/Pagination';

const PAGE_SIZE = 8;

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);

  const [updatingId, setUpdatingId] = useState(null);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const loadProducts = useCallback(() => {
    const controller = new AbortController();
    setStatus('loading');
    setErrorMessage(null);

    const skip = (page - 1) * PAGE_SIZE;
    const endpoint = debouncedSearchTerm.trim()
      ? `https://dummyjson.com/products/search?q=${encodeURIComponent(debouncedSearchTerm)}&limit=${PAGE_SIZE}&skip=${skip}`
      : `https://dummyjson.com/products?limit=${PAGE_SIZE}&skip=${skip}`;

    fetchWithRetry(endpoint, { signal: controller.signal })
      .then((data) => {
        setProducts(data.products || []);
        setTotalItems(data.total || 0);
        setStatus('success');
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          return;
        }
        setStatus('error');
        setErrorMessage(err.message || 'Failed to load products.');
      });

    return () => {
      controller.abort();
    };
  }, [debouncedSearchTerm, page]);

  useEffect(() => {
    const cleanup = loadProducts();
    return cleanup;
  }, [loadProducts]);

  const handleOptimisticStockUpdate = async (id, newStock) => {
    const previousProducts = [...products];
    const target = products.find((p) => p.id === id);
    if (!target) return;

    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: newStock } : item))
    );
    setUpdatingId(id);
    setToast({ type: 'info', text: `Optimistically updating stock for ${target.title}...` });

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (simulateFailure) {
        throw new Error('Simulated network 500 error triggered by toggle.');
      }

      setToast({ type: 'success', text: `Stock successfully synchronized for ${target.title}!` });
    } catch (err) {
      setProducts(previousProducts);
      setToast({ type: 'error', text: `Sync failed: ${err.message}. Changes rolled back!` });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '1.75rem' }}>Task 3: Resilient Products Explorer</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#94a3b8' }}>Race condition prevention • Optimistic rollback • Retry with backoff</p>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', cursor: 'pointer', background: '#334155', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
          <input
            type="checkbox"
            checked={simulateFailure}
            onChange={(e) => setSimulateFailure(e.target.checked)}
          />
          <span style={{ fontSize: '0.85rem' }}>Force Server Failure (Test Rollback)</span>
        </label>
      </header>

      {toast && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          backgroundColor: toast.type === 'error' ? '#7f1d1d' : toast.type === 'success' ? '#064e3b' : '#1e3a8a',
          color: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>×</button>
        </div>
      )}

      <SearchBar
        query={searchTerm}
        onQueryChange={setSearchTerm}
        isLoading={status === 'loading'}
      />

      {status === 'error' && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#1e293b', borderRadius: '8px', border: '1px solid #7f1d1d' }}>
          <p style={{ color: '#f87171', fontSize: '1.1rem', marginBottom: '1rem' }}>⚠️ Error: {errorMessage}</p>
          <button
            onClick={loadProducts}
            style={{ padding: '0.6rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Retry Request
          </button>
        </div>
      )}

      {status === 'loading' && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#cbd5e1' }}>Loading products across network...</p>
        </div>
      )}

      {status === 'success' && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#1e293b', borderRadius: '8px' }}>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No products found matching "{debouncedSearchTerm}".</p>
        </div>
      )}

      {status === 'success' && products.length > 0 && (
        <>
          <ProductList
            products={products}
            onOptimisticStockUpdate={handleOptimisticStockUpdate}
            isUpdatingId={updatingId}
          />
          <Pagination
            currentPage={page}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            disabled={status === 'loading'}
          />
        </>
      )}
    </div>
  );
}