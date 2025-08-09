import localFont from "next/font/local";

/**
 * Euclide UI Display
 */
export const CairoUiDisplay = localFont({
  src: [
    {
      path: "../fonts/Cairo-Light.ttf",
      weight: "300",
      style: "light",
    },
    {
      path: "../fonts/Cairo-Regular.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Cairo-Bold.ttf",
      weight: "800",
      style: "bold",
    },
  ],
  display: "swap",
  variable: "--font-cairo-ui-display",
  preload: true,
});

/**
 * MuseoSlab
 */
export const MuseoSlabUiDisplay = localFont({
  src: [
    {
      path: "../fonts/MuseoSlab/Museo.otf",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-museo-slab-ui-display",
  preload: true,
});
