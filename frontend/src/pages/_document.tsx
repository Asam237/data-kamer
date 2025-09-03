import { CairoUiDisplay, MuseoSlabUiDisplay } from "@/lib/fonts";
import cn from "clsx";
import Document, { Head, Html, Main, NextScript } from "next/document";
import { DefaultSeo } from "next-seo";
import { SITE_DESCRIPTION, SITE_NAME } from "@/starter/config";

export default class Blog extends Document {
  render() {
    return (
      <Html>
        <Head />
        <DefaultSeo title={SITE_NAME} description={SITE_DESCRIPTION} />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
