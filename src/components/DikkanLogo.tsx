import React, { useState, useEffect } from 'react';

interface DikkanLogoProps {
  variant?: 'full' | 'icon';
  className?: string;
  onClick?: () => void;
}

export const DikkanLogo: React.FC<DikkanLogoProps> = ({
  variant = 'full',
  className = '',
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  useEffect(() => {
    const key = variant === 'full' ? 'dikkan_custom_logo_full' : 'dikkan_custom_logo_icon';
    setCustomLogo(localStorage.getItem(key));
  }, [variant]);

  // If user uploaded via UI (localStorage base64) OR placed in /public/
  const imgSrc = customLogo || (variant === 'full' ? '/dikkan-logo.png' : '/dikkan-icon.png');

  if (!imgError && imgSrc) {
    return (
      <img
        src={imgSrc}
        alt="Dikkan"
        onClick={onClick}
        onError={() => setImgError(true)}
        className={
          variant === 'full' 
            ? `h-7 sm:h-8 w-auto object-contain cursor-pointer select-none transition-transform hover:scale-[1.02] ${className}` 
            : `h-7 w-7 object-contain cursor-pointer select-none transition-transform hover:scale-105 ${className}`
        }
      />
    );
  }

  // Beautiful Vector Fallback in Corporate Dikkan Orange (#ec691f)
  if (variant === 'icon') {
    return (
      <div 
        onClick={onClick}
        className={`flex h-7 w-7 items-center justify-center rounded-lg shadow-xs font-black text-white text-sm select-none transition-transform hover:scale-105 cursor-pointer ${className}`}
        style={{ backgroundColor: '#ec691f' }}
        title="Dikkan Logo"
      >
        <svg viewBox="0 0 32 32" className="w-4.5 h-4.5 fill-white" aria-hidden="true">
          <path d="M7 6h9c5.5 0 10 4.5 10 10s-4.5 10-10 10H7V6zm5 4.5v11h4c3 0 5.5-2.5 5.5-5.5s-2.5-5.5-5.5-5.5h-4z" />
        </svg>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2 select-none cursor-pointer group ${className}`}
      title="Dikkan Terim Sözlüğü"
    >
      <div 
        className="flex h-7 w-7 items-center justify-center rounded-lg shadow-xs text-white transition-transform group-hover:scale-105"
        style={{ backgroundColor: '#ec691f' }}
      >
        <svg viewBox="0 0 32 32" className="w-4 h-4 fill-white" aria-hidden="true">
          <path d="M7 6h9c5.5 0 10 4.5 10 10s-4.5 10-10 10H7V6zm5 4.5v11h4c3 0 5.5-2.5 5.5-5.5s-2.5-5.5-5.5-5.5h-4z" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-extrabold tracking-wider text-base text-zinc-900 dark:text-zinc-100 font-sans" style={{ letterSpacing: '0.04em' }}>
          DİKKAN
        </span>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: '#ec691f' }}>
          Terim Sözlüğü
        </span>
      </div>
    </div>
  );
};
