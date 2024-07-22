import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(null);
  const safeRating = rating != null ? rating : 0;

  const handleMouseMove = (e, index) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    setHover(index + (percent > 0.5 ? 1 : 0.5));
  };

  const handleClick = (e, index) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    setRating(index + (percent > 0.5 ? 1 : 0.5));
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
  };

  const responsiveContainerStyle = {
    ...containerStyle,
    flexDirection: 'column',
    alignItems: 'flex-start',
  };

  return (
    <div style={{ maxWidth: '100%' }}>
      <div
        style={{
          ...(window.innerWidth < 550 ? responsiveContainerStyle : containerStyle),
          padding: '10px',
        }}
      >
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {[...Array(5)].map((_, index) => {
            const value = index + 1;
            const isHalfStar = (hover || safeRating) - index > 0 && (hover || safeRating) - index < 1;
            const isFullStar = (hover || safeRating) >= value;

            return (
              <span
                key={index}
                onMouseEnter={(e) => handleMouseMove(e, index)}
                onMouseMove={(e) => handleMouseMove(e, index)}
                onMouseLeave={() => setHover(null)}
                onClick={(e) => handleClick(e, index)}
                style={{ cursor: 'pointer' }}
              >
                {isFullStar ? (
                  <FaStar color="#ffc107" size={30} />
                ) : isHalfStar ? (
                  <FaStarHalfAlt color="#ffc107" size={30} />
                ) : (
                  <FaStar color="#e4e5e9" size={30} />
                )}
              </span>
            );
          })}
        </div>
        <input
          type="range"
          min={0}
          max={5}
          step={0.1}
          value={safeRating}
          onChange={(e) => setRating(parseFloat(e.target.value))}
          style={{
            width: '150px',
            marginLeft: window.innerWidth < 550 ? '0' : '10px',
            marginTop: window.innerWidth < 550 ? '10px' : '0',
            accentColor: '#ffc107',
          }}
        />
        <span style={{ marginLeft: window.innerWidth < 550 ? '0' : '10px', marginTop: window.innerWidth < 550 ? '10px' : '0', minWidth: '40px' }}>
          {safeRating.toFixed(1)}
        </span>
      </div>
    </div>
  );
};

export default StarRating;