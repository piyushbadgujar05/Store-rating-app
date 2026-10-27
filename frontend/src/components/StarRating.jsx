import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export default function StarRating({
  value = 0,
  onChange = null,
  readOnly = false,
  size = 20,
  showLabel = false,
  showCount = null,
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue > 0 ? hoverValue : (value || 0);

  const handleClick = (star) => {
    if (!readOnly && onChange) {
      onChange(star);
    }
  };

  const handleMouseEnter = (star) => {
    if (!readOnly) {
      setHoverValue(star);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(0);
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
      <div
        className="star-rating"
        onMouseLeave={handleMouseLeave}
        role={readOnly ? 'img' : 'radiogroup'}
        aria-label={`Rating: ${value} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = displayValue >= star;
          const isHalf = !isFilled && displayValue >= star - 0.5;

          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: readOnly ? 'default' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={readOnly ? `${value} / 5` : `${star} Star - ${RATING_LABELS[star]}`}
            >
              <Star
                size={size}
                className={`star-icon ${isFilled ? 'filled' : 'empty'} ${!readOnly ? 'interactive' : ''}`}
                style={{
                  fill: isFilled ? '#d97706' : 'transparent',
                  color: isFilled ? '#d97706' : '#cbd5e1',
                }}
              />
            </button>
          );
        })}
      </div>

      {showLabel && !readOnly && hoverValue > 0 && (
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#b45309' }}>
          {hoverValue} — {RATING_LABELS[hoverValue]}
        </span>
      )}

      {showLabel && readOnly && value > 0 && (
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
          {Number(value).toFixed(1)}
        </span>
      )}

      {showCount !== null && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>
          ({showCount} {showCount === 1 ? 'rating' : 'ratings'})
        </span>
      )}
    </div>
  );
}
