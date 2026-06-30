'use client';
import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Stack from '@mui/material/Stack';

// Diccionario para convertir el Int de la base de datos a texto legible
const NOMBRE_MESES = {
  1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
  5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
  9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
};

// Mapeador dinámico de estilos para el enum PaymentStatus
const CONFIG_ESTATUS = {
  PENDIENTE: { color: 'error', label: 'Pendiente' },
  REVISION: { color: 'warning', label: 'En Revisión' },
  APROBADO: { color: 'success', label: 'Aprobado' },
  RECHAZADO: { color: 'error', label: 'Rechazado' },
};

export default function TablaPagos({ pagos, onPagoActualizado }) {
  const [procesandoId, setProcesandoId] = useState(null);

  // Función para registrar u homologar el cobro de una cuota directamente
  const handleAprobarPago = async (id) => {
    if (!window.confirm('¿Confirmas que deseas cambiar el estatus de esta cuota a APROBADO?')) return;
    
    setProcesandoId(id);
    try {
      // 🎯 Apunta al endpoint de pagos dinámico actualizado
      const res = await fetch(`/api/pagos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APROBADO', paymentDate: new Date() }) // Mandamos el nuevo enum correspondiente
      });

      if (!res.ok) throw new Error('No se pudo actualizar el pago en el servidor');
      
      onPagoActualizado(); // Recarga reactiva de la lista
    } catch (error) {
      alert('Error al registrar el pago: ' + error.message);
    } finally {
      setProcesandoId(null);
    }
  };

  if (!pagos || pagos.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
        No hay registros de cuotas o pagos en el sistema.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: 'grey.50' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Departamento</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Residente</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Periodo</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Monto</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Estatus</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Notas / Comentarios</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pagos.map((pago) => {
            const config = CONFIG_ESTATUS[pago.status] || { color: 'default', label: pago.status };

            return (
              <TableRow key={pago.id} hover>
                {/* 1. Dirección del Departamento adaptada al nuevo modelo */}
                <TableCell sx={{ fontWeight: 'medium' }}>
                  Torre {pago.tower} - {pago.deptNum}
                </TableCell>
                
                {/* 2. Nombre del Residente obtenido vía el CONCAT del JOIN */}
                <TableCell>{pago.resident_name || 'Sin asignar'}</TableCell>
                
                {/* 3. Month traducido de Int a String y Year */}
                <TableCell>
                  {NOMBRE_MESES[pago.month] || `Mes ${pago.month}`} / {pago.year}
                </TableCell>
                
                {/* 4. Amount formateado como moneda */}
                <TableCell sx={{ fontWeight: 'bold', color: 'grey.800' }}>
                  ${parseFloat(pago.amount || 0).toFixed(2)}
                </TableCell>
                
                {/* 5. Chip de Estatus dinámico según el nuevo enum PaymentStatus */}
                <TableCell>
                  <Chip
                    label={config.label}
                    size="small"
                    color={config.color}
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                </TableCell>

                {/* 6. Comment del Pago */}
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                  {pago.comment || '—'}
                </TableCell>

                {/* 7. Botón de Acción Dinámica */}
                <TableCell align="center">
                  {pago.status !== 'APROBADO' ? (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      disabled={procesandoId === pago.id}
                      onClick={() => handleAprobarPago(pago.id)}
                    >
                      {procesandoId === pago.id ? 'Aprobando...' : 'Aprobar Pago'}
                    </Button>
                  ) : (
                    <Stack 
                      sx={{ 
                        display: 'flex',
                        flexDirection: 'row', 
                        gap: 1, 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        color: 'success.main' 
                      }}
                    >
                      <CheckCircleIcon fontSize="small" />
                      <Typography variant="caption" fontWeight="bold">Liquidado</Typography>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}