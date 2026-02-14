import React, { useCallback, useEffect, useState, useRef } from "react";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  minVal: number;
  maxVal: number;
  onChange: (values: { min: number; max: number }) => void;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  minVal,
  maxVal,
  onChange,
}) => {
  const [minValState, setMinValState] = useState(minVal);
  const [maxValState, setMaxValState] = useState(maxVal);
  const minValRef = useRef(minVal);
  const maxValRef = useRef(maxVal);
  const range = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => ((value - min) / (max - min)) * 100,
    [min, max],
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minValState);
    const maxPercent = getPercent(maxValState);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minValState, maxValState, getPercent]);

  // Update refs when props change
  useEffect(() => {
    setMinValState(minVal);
    minValRef.current = minVal;
  }, [minVal]);

  useEffect(() => {
    setMaxValState(maxVal);
    maxValRef.current = maxVal;
  }, [maxVal]);

  return (
    <div className="range-slider-container">
      <input
        type="range"
        min={min}
        max={max}
        value={minValState}
        step={1}
        onChange={(event) => {
          const value = Math.min(
            Number(event.target.value),
            maxValRef.current - 1,
          );
          setMinValState(value);
          minValRef.current = value;
          onChange({ min: value, max: maxValRef.current });
        }}
        className={`range-input thumb--left ${minValState > max - 100 ? "z-[5]" : "z-[3]"}`}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxValState}
        step={1}
        onChange={(event) => {
          const value = Math.max(
            Number(event.target.value),
            minValRef.current + 1,
          );
          setMaxValState(value);
          maxValRef.current = value;
          onChange({ min: minValRef.current, max: value });
        }}
        className="range-input thumb--right z-[4]"
      />

      <div className="range-slider-highlight" ref={range} />

      {/* Values Displayed below handles */}
      <div
        className="absolute text-xs text-gray-500 font-medium whitespace-nowrap"
        style={{
          left: `${getPercent(minValState)}%`,
          transform: "translateX(-50%)",
          top: "24px",
        }}
      >
        ${minValState}
      </div>
      <div
        className="absolute text-xs text-gray-500 font-medium whitespace-nowrap"
        style={{
          left: `${getPercent(maxValState)}%`,
          transform: "translateX(-50%)",
          top: "24px",
        }}
      >
        ${maxValState}
      </div>
    </div>
  );
};

export default PriceRangeSlider;
