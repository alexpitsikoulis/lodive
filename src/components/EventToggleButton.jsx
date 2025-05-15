import React from 'react';

export const EventToggleButton = ({ value, onChange }) => {
  const isStarted = value === "end_event";

  const handleClick = () => {
    const newValue = isStarted ? "start_event" : "end_event";
    onChange(newValue); // Notify Form of the value change
  };

  return (
    <button type="button" onClick={handleClick}>
      {isStarted ? "End Event" : "Start Event"}
    </button>
  );
};