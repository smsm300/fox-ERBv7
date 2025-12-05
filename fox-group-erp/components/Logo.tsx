import React from 'react';

interface LogoProps {
  src?: string;
  height?: number;
  className?: string;
  showFallbackText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ src, height = 64, className, showFallbackText = true }) => {
  const [error, setError] = React.useState<boolean>(false);

  const handleError = () => setError(true);

  const rootClass = className ? `${className} flex items-center justify-center` : 'flex items-center justify-center';

  return (
    <div className={rootClass} style={{ height }}>
      {!error && src ? (
        <img
          src={src}
          alt="Fox Group"
          style={{ height, width: 'auto', objectFit: 'contain', display: 'block' }}
          onError={handleError}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      ) : (
        showFallbackText ? (
          <div style={{ height }} className="flex items-center justify-center">
            <span className="font-bold text-xl text-fox-500 tracking-widest">FOX GROUP</span>
          </div>
        ) : null
      )}
    </div>
  );
};

export default React.memo(Logo);
