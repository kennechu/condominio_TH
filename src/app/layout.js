'use client'; // 🎯 Convertimos el layout raíz en un componente del cliente para estabilizar MUI
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import theme from './theme'; // Tu archivo con la paleta de colores corregida

export default function RootLayout({ children }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <html lang="es">
      <body suppressHydrationWarning={true}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/* 🎯 SOLUCIÓN MAESTRA: Si el componente no se ha montado, mostramos un contenedor vacío 
            para evitar que Next.js rompa las dimensiones o colapse el Flexbox del menú lateral.
          */}
          {isMounted ? (
            children
          ) : (
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }} />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}