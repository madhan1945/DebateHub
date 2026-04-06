'use client';

export default function Input({
  label,
  error,
  hint,
  icon,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={props.id || props.name}
          style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}
        <input
          id={props.id || props.name}
          className={`input-base ${error ? 'error' : ''} ${className}`}
          style={icon ? { paddingLeft: '2.5rem' } : {}}
          {...props}
        />
      </div>
      {error && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--accent)' }}>{error}</span>
      )}
      {hint && !error && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{hint}</span>
      )}
    </div>
  );
}
