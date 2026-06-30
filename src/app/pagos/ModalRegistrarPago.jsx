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
import FormHelperText from '@mui/material/FormHelperText';

const MESES = [
  { valor: 1, nombre: 'Enero' }, { valor: 2, nombre: 'Febrero' }, { valor: 3, nombre: 'Marzo' },
  { valor: 4, nombre: 'Abril' }, { valor: 5, nombre: 'Mayo' }, { valor: 6, nombre: 'Junio' },
  { valor: 7, nombre: 'Julio' }, { valor: 8, nombre: 'Agosto' }, { valor: 9, nombre: 'Septiembre' },
  { valor: 10, nombre: 'Octubre' }, { valor: 11, nombre: 'Noviembre' }, { valor: 12, nombre: 'Diciembre' }
];

export default function ModalRegistrarPago({ open, onClose, onPagoCreado }) {
  const [formData, setFormData] = useState({
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    departamentId: '',
    status: 'PENDIENTE',
    comment: ''
  });
  
  const [departamentos, setDepartamentos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deptoInvalido, setDeptoInvalido] = useState(false); // 🎯 Estado de control para bloqueo visual

  useEffect(() => {
    if (open) {
      fetch('/api/departamentos')
        .then((res) => res.json())
        .then((data) => setDepartamentos(data))
        .catch(() => setError('No se pudieron cargar los departamentos.'));
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 🎯 VALIDACIÓN VISUAL AL CAMBIAR DE DEPARTAMENTO
    if (name === 'departamentId') {
      const deptoSeleccionado = departamentos.find(d => d.id === value);
      // Si no tiene residentId o viene vacío, activamos la bandera de invalidez
      if (deptoSeleccionado && !deptoSeleccionado.residentId) {
        setDeptoInvalido(true);
      } else {
        setDeptoInvalido(false);
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (deptoInvalido) return; // Parche extra de seguridad en Front

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar la cuota');
      }

      setFormData({
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        departamentId: '',
        status: 'PENDIENTE',
        comment: ''
      });
      setDeptoInvalido(false);
      onPagoCreado();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight="bold">Generar Cuota de Mantenimiento</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            {/* 🎯 Alerta dinámica en caso de seleccionar un departamento vacío */}
            {deptoInvalido && (
              <Alert severity="warning" sx={{ fontWeight: 500 }}>
                Este departamento está desocupado. Debe asignarle un residente responsable desde el módulo de propiedades antes de poder fincarle cuotas.
              </Alert>
            )}

            <FormControl fullWidth required error={deptoInvalido}>
              <InputLabel id="depto-label">Departamento</InputLabel>
              <Select
                labelId="depto-label"
                name="departamentId"
                value={formData.departamentId}
                label="Departamento"
                onChange={handleChange}
              >
                {departamentos.map((depto) => (
                  <MenuItem key={depto.id} value={depto.id}>
                    Torre {depto.tower} - Depto {depto.deptNum} {!depto.residentId ? '⚠️ (Desocupado)' : ''}
                  </MenuItem>
                ))}
              </Select>
              {deptoInvalido && <FormHelperText>Unidad sin habitante asignado.</FormHelperText>}
            </FormControl>

            <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }}>
              <TextField
                label="Monto ($)"
                name="amount"
                type="number"
                slotProps={{ htmlInput: { step: "0.01" } }}
                value={formData.amount}
                onChange={handleChange}
                required
                fullWidth
                disabled={deptoInvalido}
              />
              <TextField
                label="Año"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                required
                fullWidth
                disabled={deptoInvalido}
              />
            </Stack>

            <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }}>
              <FormControl fullWidth required disabled={deptoInvalido}>
                <InputLabel id="mes-label">Mes correspondiente</InputLabel>
                <Select
                  labelId="mes-label"
                  name="month"
                  value={formData.month}
                  label="Mes correspondiente"
                  onChange={handleChange}
                >
                  {MESES.map((m) => (
                    <MenuItem key={m.valor} value={m.valor}>
                      {m.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={deptoInvalido}>
                <InputLabel id="estatus-label">Estatus Inicial</InputLabel>
                <Select
                  labelId="estatus-label"
                  name="status"
                  value={formData.status}
                  label="Estatus Inicial"
                  onChange={handleChange}
                >
                  <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                  <MenuItem value="REVISION">En Revisión</MenuItem>
                  <MenuItem value="APROBADO">Aprobado</MenuItem>
                  <MenuItem value="RECHAZADO">Rechazado</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="Comentario / Notas adicionales"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              multiline
              rows={2}
              fullWidth
              placeholder="Ej: Pago adelantado, etc."
              disabled={deptoInvalido}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          {/* 🎯 El botón de guardar se congela si se selecciona el departamento prohibido */}
          <Button type="submit" variant="contained" disabled={loading || deptoInvalido}>
            {loading ? 'Guardando...' : 'Generar Cuota'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}