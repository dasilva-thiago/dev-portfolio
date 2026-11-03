import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import { AppearanceProvider } from "~/features/toggle-appearance/AppearanceProvider";
import dmSansItalic from "@fontsource-variable/dm-sans/files/dm-sans-latin-wght-italic.woff2?url";
import dmSans from "@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2?url";
import syne from "@fontsource-variable/syne/files/syne-latin-wght-normal.woff2?url";
import favicon from "~/shared/assets/favicon.ico";
import { I18nProvider } from "~/shared/i18n/I18nProvider";
import { DEFAULT_LOCALE, HTML_LANG } from "~/shared/i18n/locales";
import { loadResources } from "~/shared/i18n/load";
import { localeFromPath } from "~/shared/i18n/path";
import type { Route } from "./+types/root";
import { ANALYTICS_BOOTSTRAP, usePageViews } from "./analytics";
import { PRE_PAINT_SCRIPT } from "./pre-paint";
import "./styles/app.css";

export async function loader({ request }: Route.LoaderArgs) {
  // Client navigations fetch `<path>.data`; the locale must come from the page path, not that file name.
  const locale = localeFromPath(new URL(request.url).pathname.replace(/\.data$/, ""));
  return { locale, resources: await loadResources(locale) };
}

// The root loader depends on the locale prefix, which can change without any matched route param changing.
export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return localeFromPath(currentUrl.pathname) !== localeFromPath(nextUrl.pathname) || defaultShouldRevalidate;
}

export function links(): Route.LinkDescriptors {
  // The above-the-fold text (hero title, subtitle, body) uses these three; preloading them makes the web-font
  // swap happen early instead of after the stylesheet has been parsed.
  const font = (href: string) => ({ rel: "preload", as: "font", type: "font/woff2", href, crossOrigin: "anonymous" as const });
  return [{ rel: "icon", type: "image/x-icon", href: favicon }, font(dmSans), font(dmSansItalic), font(syne)];
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  return (
    <html lang={HTML_LANG[data?.locale ?? DEFAULT_LOCALE]} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#faf6ec" />
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: ANALYTICS_BOOTSTRAP }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { locale, resources } = loaderData;
  usePageViews();
  return (
    <I18nProvider locale={locale} resources={resources}>
      <AppearanceProvider>
        <Outlet />
      </AppearanceProvider>
    </I18nProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const status = isRouteErrorResponse(error) ? error.status : 500;
  return (
    <main className="p-8">
      <h1 className="text-2xl">{status === 404 ? "404" : "Error"}</h1>
    </main>
  );
}
