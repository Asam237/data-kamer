import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "../style.css";
import { SessionProvider } from "next-auth/react";

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <Theme>
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </Theme>
    </>
  );
}

export default appWithTranslation(App);
