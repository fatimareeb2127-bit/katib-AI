import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <meta property="og:title" content="Katib AI" key="title"/>
        <meta property="og:description" content="Intelligent academic and professional writing workspace" key="description"/>
        <meta
          property="og:image"
          content="/katib-logo.png"
        />
        <meta name="twitter:card" content="summary_large_image"></meta>
        <link rel="icon" href="/katib-logo.png" />
        <link rel="apple-touch-icon" href="/katib-logo.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
