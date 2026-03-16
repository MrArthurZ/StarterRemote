import { useEffect } from 'react';

interface GoogleAdProps {
  client?: string;
  slot?: string;
  format?: string;
  responsive?: boolean;
  className?: string;
}

export function GoogleAd({
  client = 'ca-pub-XXXXXXXXXXXXXXXX', // Replace with your actual AdSense Client ID
  slot = 'XXXXXXXXXX',                // Replace with your actual Ad Slot ID
  format = 'auto',
  responsive = true,
  className = ''
}: GoogleAdProps) {
  useEffect(() => {
    const isPlaceholder = client === 'ca-pub-XXXXXXXXXXXXXXXX';
    if (isPlaceholder) return;

    // Load script dynamically if not present
    const scriptId = 'google-adsense-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (err) {
      console.error('Google Ads error:', err);
    }
  }, [client]);

  // Render a visual placeholder in development/preview if the client ID hasn't been set
  if (client === 'ca-pub-XXXXXXXXXXXXXXXX') {
    return (
      <div className={`w-full bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-sm p-6 ${className}`}>
        <span className="font-medium mb-1">Advertisement Space</span>
        <span className="text-xs text-center">Update the client ID in <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">GoogleAd.tsx</code> to display real ads.</span>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
