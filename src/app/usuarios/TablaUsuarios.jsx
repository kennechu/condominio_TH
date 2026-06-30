'use client';
import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

// Iconos de acción
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// El modal adaptado
import ModalEditarUsuario from './ModalEditarUsuario';

export default function TablaUsuarios({ usuarios, refreshUsuarios }) {
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setModalOpen(true);
  };

  const handleEliminar = async (id, nombreCompleto) => {
    const confirmar = confirm(`¿Estás seguro de que deseas eliminar a ${nombreCompleto}? Esta acción desvinculará sus inmuebles asociados de forma permanente.`);
    if (!confirmar) return;

    try {
      // 🎯 Apunta a la ruta del endpoint que configuramos (ej: /api/usuarios/${id} o /api/residents/${id})
      const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar al residente');
      
      refreshUsuarios(); // Recarga la lista desde el servidor de manera reactiva
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell style={{ fontWeight: 'bold' }}>Nombre Residente</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Usuario</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Correo</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}># Tag Acceso</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Rol</TableCell>
              <TableCell align="center" style={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios && usuarios.length > 0 ? (
              usuarios.map((usuario) => {
                const nombreCompleto = `${usuario.first_name || ''} ${usuario.last_name || ''}`.trim();
                
                return (
                  <TableRow key={usuario.id} hover>
                    {/* 1. Nombre y Apellido Concatenados */}
                    <TableCell sx={{ fontWeight: 500 }}>{nombreCompleto || 'Sin nombre'}</TableCell>
                    
                    {/* 2. Nombre de Usuario */}
                    <TableCell>{usuario.user_name || '-'}</TableCell>
                    
                    {/* 3. Correo */}
                    <TableCell>{usuario.correo}</TableCell>
                    
                    {/* 4. Código Físico o Tag de Entrada */}
                    <TableCell>
                      {usuario.tagId ? (
                        <Chip label={usuario.tagId} size="small" variant="outlined" color="info" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    
                    {/* 5. Rol actualizado a usuario.role */}
                    <TableCell>
                      <Chip 
                        label={usuario.role} 
                        color={usuario.role === 'ADMINISTRADOR' ? 'primary' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    
                    {/* 6. Acciones del CRUD Blindadas */}
                    <TableCell align="center">
                      <Stack 
    sx={{ 
      display: 'flex',
      flexDirection: 'row', 
      gap: 1, 
      justifyContent: 'center' 
    }}
  >
    <IconButton color="info" onClick={() => handleOpenEdit(usuario)} size="small">
      <EditIcon fontSize="small" />
    </IconButton>
    
    <IconButton 
      color="error" 
      onClick={() => handleEliminar(usuario.id, nombreCompleto)} 
      size="small"
    >
      <DeleteIcon fontSize="small" />
    </IconButton>
  </Stack>
</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No se encontraron residentes registrados en el sistema.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL FLOTANTE DE EDICIÓN */}
      <ModalEditarUsuario
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        usuario={selectedUsuario}
        onEditSuccess={refreshUsuarios}
      />
    </>
  );
}