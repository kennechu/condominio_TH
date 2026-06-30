'use client';
import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';

import TablaPagos from './TablaPagos';
import ModalRegistrarPago from './ModalRegistrarPago';

export default function PagosPage() {
  const [pagos, setPagos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Control para blindar la hidratación en el cliente sin romper el Layout
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Función para traer el historial de pagos desde nuestro backend adaptado
  const cargarPagos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Apunta a la nueva API unificada de pagos
      const res = await fetch('/api/pagos'); 
      
      if (!res.ok) {
        throw new Error('No se pudo obtener el historial de cuotas y pagos.');
      }
      
      const data = await res.json();
      setPagos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial al entrar a la pantalla
  useEffect(() => {
    cargarPagos();
  }, [cargarPagos]);

  return (
    /* 🎯 SOLUCIÓN: Ocultamos el parpadeo inicial usando opacidad en lugar de retornar null. 
       Esto evita que el árbol de flexbox del layout compartido colapse y desaparezca tu menú. */
    <Box sx={{ opacity: isMounted ? 1 : 0, transition: 'opacity 0.15s ease-in-out' }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        
        {/* 📱 CABECERA RESPONSIVA: Cambia dirección de columna (móvil) a fila (escritorio) */}
        <Stack 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' }, 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', md: 'center' }, 
            gap: 2,
            mb: 4 
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Administración de Pagos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Controla las cuotas de mantenimiento, revisa adeudos y aprueba los comprobantes de Ribera Town Houses.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
            sx={{ height: 'fit-content', width: { xs: '100%', md: 'auto' } }}
          >
            Generar Cuota
          </Button>
        </Stack>

        {/* Alerta de errores en la comunicación con MySQL */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Renderizado condicional según el estado de la API */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TablaPagos 
            pagos={pagos} 
            onPagoActualizado={cargarPagos} // Refresca tras dar clic en "Aprobar Pago"
          />
        )}

        {/* Formulario Emergente */}
        <ModalRegistrarPago
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onPagoCreado={cargarPagos} // Refresca tras crear una nueva cuota
        />
      </Container>
    </Box>
  );
}