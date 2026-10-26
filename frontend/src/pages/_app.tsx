import type { AppProps } from "next/app";
import Head from "next/head";
import "../style.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <ThemeProvider>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default App;
