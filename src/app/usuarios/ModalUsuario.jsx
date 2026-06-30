'use client';
import { useState } from 'react';

// Importaciones directas y seguras para evitar problemas de hidratación bajo Turbopack:
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

function ModalUsuario({ open, onClose, onUsuarioCreado }) {
  // 🎯 Estado inicial adaptado al nuevo modelo en inglés (Resident)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    correo: '',
    user_name: '',
    password: '',
    role: 'RESIDENTE',
    tagId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 🎯 Apunta a la ruta del API unificada (ej: /api/residentes o /api/residents)
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear el residente');
      }

      // Limpieza del formulario restableciendo el estado inicial en inglés
      setFormData({ 
        first_name: '', 
        last_name: '', 
        correo: '', 
        user_name: '', 
        password: '', 
        role: 'RESIDENTE', 
        tagId: '' 
      });
      
      onUsuarioCreado();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight="bold">Registrar Nuevo Residente</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            {/* Campos de Nombre y Apellido en una fila horizontal */}
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
            
            <TextField
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="ID de Tag / Código de Acceso (Opcional)"
              name="tagId"
              value={formData.tagId}
              onChange={handleChange}
              fullWidth
              placeholder="Ej: 102030"
            />
            
            <FormControl fullWidth>
              <InputLabel id="role-label">Rol</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={formData.role}
                label="Rol"
                onChange={handleChange}
              >
                <MenuItem value="RESIDENTE">Residente</MenuItem>
                <MenuItem value="ADMINISTRADOR">Administrador</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Residente'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ModalUsuario;