import React, { useState } from 'react';
import pkg from 'react-color';
const { ChromePicker } = pkg;

const ThemeCustomizer = () => {
    const [color, setColor] = useState('#FF5722');

    return (
        <div style={{ padding: '20px', zIndex: 50 }}>
            <h1>Pick a Color</h1>
            <ChromePicker
                color={color}
                onChangeComplete={(newColor) => setColor(newColor.hex)}
            />
            <div style={{ marginTop: '20px', backgroundColor: color, padding: '10px' }}>
                Selected Color: {color}
            </div>
        </div>
    );
};

export default ThemeCustomizer;
