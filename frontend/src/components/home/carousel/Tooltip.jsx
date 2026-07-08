import React, { useState } from "react";

const Tooltip = ({ children, text }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="tooltip-container inline-block">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
            >
                {children}
            </div>

            {isVisible && (
                <div className="tooltip absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-100 transition-opacity duration-300 whitespace-nowrap"
                    style={{
                        left: '50%',
                        top: '-50px',
                        transform: 'translateX(-50%)'
                    }}>
                    {text}
                    <div className="tooltip-arrow absolute w-2 h-2 bg-gray-900"
                        style={{
                            left: '50%',
                            bottom: '-4px',
                            transform: 'translateX(-50%) rotate(45deg)'
                        }}>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tooltip; 