/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from 'next-themes';

/**
 * ThemeProvider wraps the application to provide light/dark mode toggling.
 * It uses next-themes to inject `data-theme` attributes onto the HTML element.
 * 
 * @param props Contains children and any next-themes specific props.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps): React.JSX.Element {
    const [mounted, setMounted] = React.useState(false);

    // Prevent hydration mismatch by only rendering after mount
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <>{children}</>;
    }

    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
