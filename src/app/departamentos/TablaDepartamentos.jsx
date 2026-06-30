'use client';
import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';

import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ModalAsignarResidente from '@/app/departamentos/ModalAsignarResidente';

export default function TablaDepartamentos({ departamentos, refreshDepartamentos }) {
  const [selectedDepto, setSelectedDepto] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenAsignar = (depto) => {
    setSelectedDepto(depto);
    setModalOpen(true);
  };

  if (!departamentos || departamentos.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
        No hay departamentos registrados todavía.
      </Typography>
    );
  }

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID Interno (UUID)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Torre / Bloque</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Número</TableCell>
              {/* 🎯 TÍTULO DE COLUMNA ACTUALIZADO */}
              <TableCell sx={{ fontWeight: 'bold' }}>Residente</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departamentos.map((depto) => (
              <TableRow key={depto.id} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'grey.600' }}>
                  {depto.id}
                </TableCell>
                
                <TableCell sx={{ fontWeight: 'medium' }}>{depto.tower}</TableCell>
                
                <TableCell>{depto.deptNum}</TableCell>
                
                {/* 🎯 MUESTRA EL NOMBRE DEL RESIDENTE O EL CHIP DE DISPONIBLE */}
                <TableCell>
                  {depto.residentId ? (
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {depto.resident_name || 'Cargando nombre...'}
                    </Typography>
                  ) : (
                    <Chip 
                      label="Disponible / Desocupado" 
                      size="small" 
                      variant="outlined" 
                      color="success" 
                      sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                    />
                  )}
                </TableCell>

                <TableCell align="center">
                  <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="Asignar o Cambiar Residente (Inquilino)">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenAsignar(depto)} 
                        size="small"
                      >
                        <AssignmentIndIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ModalAsignarResidente
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        depto={selectedDepto}
        onAsignacionExitosa={refreshDepartamentos}
      />
    </>
  );
}