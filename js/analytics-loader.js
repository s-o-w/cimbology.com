/**
 * Google Analytics 4 Loader
 * 
 * To enable analytics:
 * 1. Create a property at analytics.google.com
 * 2. Replace 'G-XXXXXXXXXX' with your actual Measurement ID below
 */

(function() {
    const GA_ID = 'G-3F4ESRJQSQ'; 
    
    // Don't load if ID is still placeholder
    if (GA_ID === 'G-XXXXXXXXXX') {
        console.log('Analytics: Placeholder ID detected. Update js/analytics-loader.js to enable.');
        return;
    }

    // Create the async script tag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // Initialize the dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_ID);
})();
