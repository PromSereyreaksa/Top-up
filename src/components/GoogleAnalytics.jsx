"use client"

import Script from "next/script"
import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && window.gtag) {
      // Send pageview with a custom path
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: pathname + searchParams.toString(),
      })
    }
  }, [pathname, searchParams, GA_MEASUREMENT_ID])

  return (
    <>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname + window.location.search,
            });
          `,
        }}
      />
    </>
  )
}
