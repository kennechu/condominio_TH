'use client';
import { useState, useEffect, useCallback } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';

import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const NOMBRE_MESES = {
  1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril', 5: 'Mayo', 6: 'Junio',
  7: 'Julio', 8: 'Agosto', 9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Catálogos dinámicos
  const [listaTorres, setListaTorres] = useState([]);
  const [listaDeptos, setListaDeptos] = useState([]);

  // Filtros
  const [mes, setMes] = useState('');
  const [torre, setTorre] = useState('');
  const [depto, setDepto] = useState('');

  // Una sola función que trae métricas y rellena los filtros si están disponibles
  const cargarDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (mes) queryParams.append('mes', mes);
      if (torre) queryParams.append('torre', torre);
      if (depto) queryParams.append('depto', depto);

      const res = await fetch(`/api/dashboard/metrics?${queryParams.toString()}`);
      if (!res.ok) throw new Error('No se pudo sincronizar el panel de control.');
      
      const data = await res.json();
      
      setMetrics(data.metrics);
      
      // Rellenamos los filtros dinámicos solo si vienen en la respuesta
      if (data.catalogos) {
        setListaTorres(data.catalogos.torres || []);
        setListaDeptos(data.catalogos.departamentos || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mes, torre, depto]);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  const renderCard = (title, value, subtitle, icon, color) => (
    <Grid xs={12} sm={6} md={3}>
      <Paper variant="outlined" sx={{ p: 3, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
            {title}
          </Typography>
          <Box sx={{ color: `${color}.main`, display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Paper>
    </Grid>
  );

  const mesActualLabel = mes ? NOMBRE_MESES[mes] : new Date().toLocaleString('es-MX', { month: 'long' });

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Resumen General — Ribera Town Houses
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitorea el estado financiero y operativo aplicando filtros dinámicos directos de la base de datos.
        </Typography>
      </Box>

      {/* 📊 BARRA DE FILTROS */}
      <Stack sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4, width: '100%' }}>
        <FormControl fullWidth size="small">
          <InputLabel>Filtrar por Mes</InputLabel>
          <Select value={mes} label="Filtrar por Mes" onChange={(e) => setMes(e.target.value)}>
            <MenuItem value=""><em>Mes Actual</em></MenuItem>
            {Object.entries(NOMBRE_MESES).map(([num, nombre]) => (
              <MenuItem key={num} value={num}>{nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Torre / Bloque</InputLabel>
          <Select value={torre} label="Torre / Bloque" onChange={(e) => setTorre(e.target.value)}>
            <MenuItem value=""><em>Todas las Torres</em></MenuItem>
            {listaTorres.map((t) => (
              <MenuItem key={t} value={t}>Torre {t}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>No. Departamento</InputLabel>
          <Select value={depto} label="No. Departamento" onChange={(e) => setDepto(e.target.value)}>
            <MenuItem value=""><em>Todos los Deptos</em></MenuItem>
            {listaDeptos.map((num) => (
              <MenuItem key={num} value={num}>{num}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading && !metrics ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : metrics ? (
        <Grid container spacing={3}>
          {renderCard("Residentes Activos", metrics.residentes, "Cuentas globales registradas", <PeopleIcon />, "primary")}
          {renderCard("Inmuebles Filtrados", `${metrics.departamentos.ocupados} / ${metrics.departamentos.total}`, "Relación de departamentos ocupados", <BusinessIcon />, "info")}
          {renderCard(`Ingresos de ${mesActualLabel}`, `$${metrics.ingresosMesActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, "Total recolectado en el universo seleccionado", <AttachMoneyIcon />, "success")}
          {renderCard("Cartera Vencida", `$${metrics.morosidad.montoPendiente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, `${metrics.morosidad.recibosPendientes} recibos pendientes de pago`, <WarningAmberIcon />, "error")}
        </Grid>
      ) : null}
    </Container>
  );
}