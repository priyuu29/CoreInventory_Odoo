import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import classNames from "classnames";

import { dataStyle, fonts, style } from "@/resources/once-ui.config";
import { baseURL, meta } from "@/resources/seo";
import { Column, Flex, Meta, Schema, ThemeInit } from "@once-ui-system/core";
import { Providers } from "./providers";

export async function generateMetadata() {
  return Meta.generate({
    title: meta.home.title,
    description: meta.home.description,
    baseURL: baseURL,
    path: meta.home.path,
    canonical: meta.home.canonical,
    image: meta.home.image,
    robots: meta.home.robots,
    alternates: meta.home.alternates,
  });
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
    >
      <head>
        <ThemeInit
          config={{
            theme: style.theme,
            brand: style.brand,
            accent: style.accent,
            neutral: style.neutral,
            solid: style.solid,
            "solid-style": style.solidStyle,
            border: style.border,
            surface: style.surface,
            transition: style.transition,
            scaling: style.scaling,
            "viz-style": dataStyle.variant,
          }}
        />
        <Schema
          as="webPage"
          baseURL={baseURL}
          title={meta.home.title}
          description={meta.home.description}
          path={meta.home.path}
        />
      </head>
      <body>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0">
            {children}
          </Column>
        </Providers>
      </body>
    </html>
  );
}
