'use client';
import { useState, useEffect } from 'react';
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

export default function ModalDepartamento({ open, onClose, onDeptoCreado }) {
  // 🎯 Estado inicial adaptado al modelo Department de Prisma
  const [formData, setFormData] = useState({
    tower: '',
    deptNum: '',
    residentId: ''
  });
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargamos la lista unificada de residentes desde nuestra API adaptada
  useEffect(() => {
    if (open) {
      fetch('/api/usuarios') // O /api/residents si actualizaste la ruta
        .then((res) => res.json())
        .then((data) => setUsuarios(data))
        .catch(() => setError('No se pudieron cargar los usuarios residentes.'));
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/departamentos', { // O /api/departments
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear el departamento');
      }

      // Reiniciamos con las variables en inglés
      setFormData({ tower: '', deptNum: '', residentId: '' });
      onDeptoCreado();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight="bold">Registrar Nuevo Departamento</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField
              label="Torre / Bloque (Ej: A, B1)"
              name="tower" // 🎯 Cambió de 'torre' a 'tower'
              value={formData.tower}
              onChange={handleChange}
              required
              fullWidth
            />
            
            <TextField
              label="Número de Departamento"
              name="deptNum" // 🎯 Cambió de 'numero' a 'deptNum'
              type="number"
              value={formData.deptNum}
              onChange={handleChange}
              required
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel id="resident-label">Asignar a Residente (Opcional)</InputLabel>
              <Select
                labelId="resident-label"
                name="residentId" // 🎯 Cambió de 'usuarioId' a 'residentId'
                value={formData.residentId}
                label="Asignar a Residente (Opcional)"
                onChange={handleChange}
              >
                {/* Opción vacía por si el departamento aún no tiene dueño asignado */}
                <MenuItem value="">
                  <em>Sin asignar / Disponible</em>
                </MenuItem>
                
                {usuarios.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {/* 🎯 Concatenamos los nuevos campos de nombre y apuntamos a .role */}
                    {`${user.first_name || ''} ${user.last_name || ''}`.trim()} ({user.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Departamento'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}