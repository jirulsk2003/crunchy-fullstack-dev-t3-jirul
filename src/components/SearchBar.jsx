export const SearchBar = ({ query, onQueryChange, isLoading }) => {
  return (
    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
      <input
        type="text"
        placeholder="Search products (e.g., phone, laptop, perfume)..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '0.85rem 1rem',
          fontSize: '1rem',
          borderRadius: '8px',
          border: '1px solid #475569',
          backgroundColor: '#1e293b',
          color: '#f8fafc',
          outline: 'none',
        }}
      />
      {isLoading && (
        <span style={{ position: 'absolute', right: '15px', top: '14px', color: '#94a3b8', fontSize: '0.85rem' }}>
          Fetching...
        </span>
      )}
    </div>
  );
};