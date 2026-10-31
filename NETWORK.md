# NETWORK.md — Network Resilience & Race Condition Report

## 1. API Selection
* **Domain:** E-Commerce Product Catalog
* **Endpoint:** `https://dummyjson.com/products/search?q={query}&limit={limit}&skip={skip}`

---

## 2. Race Condition Reproduction & Proof of Fix

### How the Race Condition Occurs (Without Fix)
1. User types "lap" into search. Request $R_1$ is dispatched.
2. User quickly adds "top" so query becomes "laptop". Request $R_2$ is dispatched.
3. Due to variable network latency, $R_2$ finishes in 150ms while $R_1$ is delayed and finishes in 600ms.
4. $R_1$'s callback runs last, overwriting the fresh "laptop" view with the stale "lap" view.

### The Fix Implemented
We use an `AbortController` tied directly to the `useEffect` cleanup cycle:
```javascript
useEffect(() => {
  const controller = new AbortController();

  async function loadData() {
    try {
      const data = await fetchWithRetry(url, { signal: controller.signal });
      setProducts(data.products);
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Stale in-flight request canceled safely
      }
      setError(err.message);
    }
  }

  loadData();
  return () => controller.abort(); // Cancels previous in-flight request on new keystroke
}, [debouncedQuery, page]);