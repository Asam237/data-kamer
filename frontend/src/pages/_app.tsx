import type { AppProps } from "next/app";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "../style.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <ThemeProvider>
      <Theme>
        <Component {...pageProps} />
      </Theme>
    </ThemeProvider>
  );
}

export default App;
