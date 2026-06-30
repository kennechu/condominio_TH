'use client';
import { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';

const modalStyle = {
  position: 'absolute', 
  top: '50%', 
  left: '50%',
  transform: 'translate(-50%, -50%)', 
  width: 450, // Lo ampliamos ligeramente a 450 para que los campos queden más cómodos
  bgcolor: 'background.paper', 
  boxShadow: 24, 
  p: 4, 
  borderRadius: 2,
};

export default function ModalEditarUsuario({ open, onClose, usuario, onEditSuccess }) {
  // 🎯 Estado inicial completo con todas las propiedades del nuevo esquema Resident
  const [formData, setFormData] = useState({ 
    first_name: '', 
    last_name: '', 
    user_name: '',
    correo: '', 
    role: '',
    tagId: ''
  });
  const [loading, setLoading] = useState(false);

  // Sincronizamos los datos del usuario seleccionado cuando se abre el modal
  useEffect(() => {
    if (usuario) {
      setFormData({
        first_name: usuario.first_name || '',
        last_name: usuario.last_name || '',
        user_name: usuario.user_name || '',
        correo: usuario.correo || '',
        role: usuario.role || '',
        tagId: usuario.tagId || '',
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 🎯 Apunta al endpoint dinámico de actualización
      const res = await fetch(`/api/usuarios/${usuario.id}`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error al actualizar el registro del residente');
      
      if (typeof onEditSuccess === 'function') onEditSuccess();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Editar Información del Residente
        </Typography>

        <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          
          {/* Fila horizontal para Nombres y Apellidos */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Nombre(s)"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Apellido(s)"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              fullWidth
            />
          </Stack>

          {/* Nombre de usuario exclusivo del nuevo esquema */}
          <TextField
            label="Nombre de Usuario (Username)"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            required
            fullWidth
          />

          <TextField
            label="Correo Electrónico"
            name="correo"
            type="email"
            value={formData.correo}
            onChange={handleChange}
            required
            fullWidth
          />

          {/* Campo opcional para el control del tag de acceso físico */}
          <TextField
            label="ID de Tag / Código de Acceso (Opcional)"
            name="tagId"
            value={formData.tagId}
            onChange={handleChange}
            fullWidth
            placeholder="Ej: 102030"
          />

          <FormControl fullWidth>
            <InputLabel id="edit-role-label">Rol</InputLabel>
            <Select
              labelId="edit-role-label"
              name="role"
              value={formData.role}
              label="Rol"
              onChange={handleChange}
              required
            >
              <MenuItem value="RESIDENTE">Residente</MenuItem>
              <MenuItem value="ADMINISTRADOR">Administrador</MenuItem>
            </Select>
          </FormControl>

          {/* Botonera de Acciones */}
          <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
            <Button onClick={onClose} color="inherit" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Stack>

        </Stack>
      </Box>
    </Modal>
  );
}