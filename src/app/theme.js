'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#284b63',      // El azul pizarra/marino profundo de tu imagen (Ideal para botones principales y headers)
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3c6e71',      // El verde azulado / turquesa opaco (Excelente para acentos, herramientas o filtros)
      contrastText: '#ffffff',
    },
    neutral: {
      dark: '#353535',      // El gris casi negro / carbón (Para textos principales, títulos pesados o fondos oscuros)
      light: '#d9d9d9',     // El gris claro sutil (Para bordes de tablas, contenedores secundarios o dividers)
    },
    background: {
      default: '#ffffff',   // Blanco puro de tu paleta como fondo general
      paper: '#ffffff',     // Fondo de las tarjetas y modales
    },
    text: {
      primary: '#353535',   // Forzamos a que el texto use el gris carbón en vez de negro puro
      secondary: '#3c6e71', // Textos de apoyo o subtítulos
    },
  },
  
  // 📱 CONFIGURACIÓN PARA RESPONSIVIDAD GLOBAL
  breakpoints: {
    values: {
      xs: 0,    // Teléfonos compactos (vertical)
      sm: 600,  // Teléfonos grandes / Tablets chicas (horizontal)
      md: 900,  // Tablets medianas / Laptops compactas
      lg: 1200, // Pantallas de escritorio estándar (Tus Containers maxWidth="lg" se basan aquí)
      xl: 1536, // Monitores ultra-anchos
    },
  },

  components: {
    // Forzar que las tablas Mui sean responsivas por defecto
    MuiTableContainer: {
      styleOverrides: {
        root: {
          width: '100%',
          overflowX: 'auto', // Permite scroll horizontal en móviles si la tabla es muy ancha
        },
      },
    },
    // Ajuste responsivo automático para botones
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Quita las mayúsculas forzadas molestas
          borderRadius: 8,       // Esquinas más modernas y suavizadas
        },
      },
    },
  },
});

export default theme;