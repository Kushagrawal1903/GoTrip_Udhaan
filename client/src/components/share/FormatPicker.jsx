import { CARD_FORMATS } from '../../utils/cardFormats';

/**
 * FormatPicker — Four pill buttons for selecting a card format.
 */
export default function FormatPicker({ selected, onSelect }) {
  const formats = Object.entries(CARD_FORMATS);

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
    }}>
      {formats.map(([key, f]) => {
        const isSelected = selected === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              border: isSelected
                ? '1.5px solid #14B8A6'
                : '1px solid var(--border-color)',
              background: isSelected
                ? 'rgba(20, 184, 166, 0.12)'
                : 'transparent',
              color: isSelected
                ? '#14B8A6'
                : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: isSelected ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>{f.icon}</span>
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
