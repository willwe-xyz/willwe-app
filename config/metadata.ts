// This file exports the metadata object used by AppKit for dApp branding and wallet connection UI.
//
// Expected structure:
// {
//   name: string;           // The name of your dApp
//   description: string;    // A short description of your dApp
//   url: string;            // The public URL of your dApp
//   icons: string[];        // Array of icon URLs (at least one, ideally SVG or PNG)
// }

export const metadata = {
  name: "WillWe",
  description: "Self-Coordinating Value",
  url: "https://app.willwe.xyz",
  icons: ["https://app.willwe.xyz/favicons/icon.svg"],
}; 