export const Pagination = ({ currentPage, totalItems, pageSize, onPageChange, disabled }) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
      <button
        disabled={currentPage === 1 || disabled}
        onClick={() => onPageChange(currentPage - 1)}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: currentPage === 1 || disabled ? '#334155' : '#2563eb',
          color: '#fff',
          cursor: currentPage === 1 || disabled ? 'not-allowed' : 'pointer',
        }}
      >
        Previous
      </button>

      <span style={{ color: '#cbd5e1' }}>
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} total)
      </span>

      <button
        disabled={currentPage >= totalPages || disabled}
        onClick={() => onPageChange(currentPage + 1)}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: currentPage >= totalPages || disabled ? '#334155' : '#2563eb',
          color: '#fff',
          cursor: currentPage >= totalPages || disabled ? 'not-allowed' : 'pointer',
        }}
      >
        Next
      </button>
    </div>
  );
};