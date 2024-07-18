import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(null);

  const handleMouseMove = (e, index) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    setHover(index + (percent > 0.5 ? 1 : 0.5));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {[...Array(5)].map((_, index) => {
          const value = index + 1;
          const isHalfStar = (hover || rating) - index > 0 && (hover || rating) - index < 1;
          const isFullStar = (hover || rating) >= value;
          
          return (
            <span
              key={index}
              onMouseEnter={() => handleMouseMove(event, index)}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setRating(hover)}
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
        value={rating}
        onChange={(e) => setRating(parseFloat(e.target.value))}
        style={{
          width: '150px',
          marginLeft: '10px',
          accentColor: '#ffc107',
        }}
      />
      <span style={{ marginLeft: '10px', minWidth: '40px' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

export default StarRating;