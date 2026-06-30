'use client';
import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

export default function ModalAsignarResidente({ open, onClose, depto, onAsignacionExitosa }) {
  const [residentId, setResidentId] = useState('');
  const [residentes, setResidentes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar los residentes disponibles al abrir el modal
  useEffect(() => {
    if (open) {
      fetch('/api/usuarios') // API global de residentes
        .then((res) => res.json())
        .then((data) => setResidentes(data))
        .catch(() => setError('No se pudieron cargar los residentes.'));
      
      // Inicializar el select con el residente actual si existe
      setResidentId(depto?.residentId || '');
    }
  }, [open, depto]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const res = await fetch(`/api/departamentos/${depto.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ residentId: residentId || null })
    });

    if (!res.ok) throw new Error('Error al actualizar la asignación.');

    // 🎯 EL BLINDAJE: Solo ejecuta la función si realmente existe y es ejecutable
    if (typeof onAsignacionExitosa === 'function') {
      onAsignacionExitosa();
    }

    onClose();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle fontWeight="bold">Asignar / Cambiar Residente</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <Typography variant="body2" color="text.secondary">
              Modifica el residente responsable para la <strong>Torre {depto?.tower} - Depto {depto?.deptNum}</strong>. Útil para cambios recurrentes de inquilinos en arrendamiento.
            </Typography>

            <FormControl fullWidth>
              <InputLabel id="change-resident-label">Residente Responsable</InputLabel>
              <Select
                labelId="change-resident-label"
                value={residentId}
                label="Residente Responsable"
                onChange={(e) => setResidentId(e.target.value)}
              >
                <MenuItem value="">
                  <em>Ninguno (Marcar como desocupado / disponible)</em>
                </MenuItem>
                {residentes.map((res) => (
                  <MenuItem key={res.id} value={res.id}>
                    {`${res.first_name || ''} ${res.last_name || ''}`.trim()} ({res.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit" disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Actualizar Contrato'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}