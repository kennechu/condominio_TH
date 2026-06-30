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
import TablaUsuarios from './TablaUsuarios';
import ModalUsuario from './ModalUsuario';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/usuarios');
      if (!res.ok) throw new Error('No se pudo obtener la lista de usuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Control de Usuarios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra a los residentes, administradores y personal del condominio.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{ height: 'fit-content' }}
        >
          Nuevo Usuario
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TablaUsuarios 
          usuarios={usuarios}
          refreshUsuarios={cargarUsuarios}
          />
      )}

      <ModalUsuario
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUsuarioCreado={cargarUsuarios}
      />
    </Container>
  );
}