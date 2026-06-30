'use client';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import theme from './theme'; // Tu archivo con la paleta de colores corregida

// 🎯 IMPORTAMOS EL SIDEBAR DESDE TU CARPETA DE COMPONENTES
import Sidebar from '@/app/components/Sidebar';

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

        {/* 🎯 SOLUCIÓN DE CONTEXTO: Estructura Flexbox integrada directamente en la raíz */}
        {isMounted ? (
            <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>

              {/* Renderiza el menú lateral fijo a la izquierda */}
              <Sidebar />

              {/* Contenedor principal dinámico para el contenido de tus páginas */}
              <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    p: 3,
                    // En pantallas medianas/grandes, resta automáticamente los 240px del Sidebar
                    width: { sm: `calc(100% - 240px)` },
                    bgcolor: 'background.default',
                    minHeight: '100vh'
                  }}
              >
                {/* Un Toolbar vacío para empujar tus títulos abajo de la barra superior fija */}
                <Toolbar />
                {children}
              </Box>
            </Box>
        ) : (
            // Contenedor de carga plano para evitar parpadeos de hidratación en el servidor
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }} />
        )}
      </ThemeProvider>
      </body>
      </html>
  );
}