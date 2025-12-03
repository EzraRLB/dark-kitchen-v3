import React, { useRef, useState, useEffect } from 'react';
import './PinInput.css';

const PinInput = ({ length, onComplete }) => {
  const [pin, setPin] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const { value } = e.target;
    if (!/^[0-9]$/.test(value) && value !== '') return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
    
    const pinString = newPin.join('');
    if (pinString.length === length) {
      onComplete(pinString);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="pin-input-container">
      {pin.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="tel"
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="pin-input-box"
        />
      ))}
    </div>
  );
};

export default PinInput;