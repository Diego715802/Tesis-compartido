"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { appTheme } from "@/theme/theme";

export function AppThemeProvider({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true, nonce }}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
