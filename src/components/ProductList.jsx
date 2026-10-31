export const ProductList = ({ products, onOptimisticStockUpdate, isUpdatingId }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '1.25rem',
    }}>
      {products.map((item) => (
        <div
          key={item.id}
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <img
              src={item.thumbnail}
              alt={item.title}
              style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.75rem' }}
            />
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1rem' }}>{item.title}</h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>{item.category}</p>
          </div>

          <div style={{ marginTop: '1rem', borderTop: '1px solid #334155', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>${item.price}</span>
              <span style={{
                color: item.stock < 10 ? '#f87171' : '#4ade80',
                fontSize: '0.8rem',
              }}>
                Stock: {item.stock} {isUpdatingId === item.id && '⏳'}
              </span>
            </div>

            <button
              onClick={() => onOptimisticStockUpdate(item.id, item.stock + 1)}
              disabled={isUpdatingId === item.id}
              style={{
                width: '100%',
                padding: '0.45rem',
                backgroundColor: '#0f766e',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: isUpdatingId === item.id ? 'wait' : 'pointer',
                fontSize: '0.85rem',
              }}
            >
              + Add Restock (Optimistic)
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};