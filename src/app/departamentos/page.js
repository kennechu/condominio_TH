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

import TablaDepartamentos from './TablaDepartamentos';
import ModalDepartamento from './ModalDepartamento';

// Definimos la función de la página
function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarDepartamentos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // 🎯 Apunta a la API unificada de departamentos
      const res = await fetch('/api/departamentos'); // O /api/departments si renombraste la carpeta
      if (!res.ok) throw new Error('No se pudo obtener la lista de departamentos');
      const data = await res.json();
      setDepartamentos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDepartamentos();
  }, [cargarDepartamentos]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Inventario de Departamentos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Asigna y administra las propiedades de Ribera Town Houses vinculándolas a sus respectivos residentes.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{ height: 'fit-content' }}
        >
          Nuevo Departamento
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TablaDepartamentos 
    departamentos={departamentos} 
    refreshDepartamentos={cargarDepartamentos} 
  />
      )}

      <ModalDepartamento
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onDeptoCreado={cargarDepartamentos}
      />
    </Container>
  );
}

// 🎯 LA LÍNEA CRUCIAL: Asegúrate de que esté al final absoluto del archivo
export default DepartamentosPage;