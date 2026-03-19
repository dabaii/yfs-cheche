import React from 'react';

export const Sticker = ({ children, className = "", onClick }) => (
    <div onClick={onClick} className={`inline-block px-4 py-1.5 rounded-full border-4 border-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider cursor-pointer active:translate-y-1 active:shadow-none transition-all ${className}`}>
        {children}
    </div>
);
