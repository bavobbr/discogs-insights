"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function OAuthSuccessEvent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get('oauth_success') !== '1') return;

    window.gtag?.('event', 'login', {
      method: 'Discogs OAuth',
    });

    // Remove the param from the URL without a page reload
    const params = new URLSearchParams(searchParams.toString());
    params.delete('oauth_success');
    const newUrl = params.size > 0 ? `${pathname}?${params}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [searchParams, router, pathname]);

  return null;
}
