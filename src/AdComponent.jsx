import React, { useEffect } from 'react';

const AdComponent = () => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-5303491138270690"
            data-ad-slot="5276708258"
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
    );
};

export default AdComponent;
