import type { AppProps } from "next/app";
import Head from "next/head";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
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
      <Theme>
        <Component {...pageProps} />
      </Theme>
    </ThemeProvider>
  );
}

export default App;
