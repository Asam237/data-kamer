import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "../style.css";

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <Theme>
        <Component {...pageProps} />
      </Theme>
    </>
  );
}

export default appWithTranslation(App);
