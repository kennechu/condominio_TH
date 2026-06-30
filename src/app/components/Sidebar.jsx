"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import PaymentsIcon from "@mui/icons-material/Payments";
import Link from "next/link";

import { useRouter, usePathname } from "next/navigation";

const drawerWidth = 240;

const MENU_ITEMS = [
    { texto: "Usuarios", ruta: "/usuarios", icono: <PeopleIcon /> },
    { texto: "Departamentos", ruta: "/departamentos", icono: <BusinessIcon /> },
    { texto: "Pagos y Cuotas", ruta: "/pagos", icono: <PaymentsIcon /> },
];

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Box sx={{ display: "flex" }}>
            {/* Barra superior del panel */}
            <AppBar
                position="fixed"
                sx={{
                    width: `calc(100% - ${drawerWidth}px)`,
                    ml: `${drawerWidth}px`,
                    bgcolor: "background.paper",
                    color: "text.primary",
                    boxShadow: "none",
                    borderBottom: "1px solid",
                    borderColor: "neutral.light",
                }}
            >
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" fontWeight="bold">
                        Panel de Administración
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Menú de navegación lateral */}
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        bgcolor: "neutral.dark",
                        color: "#ffffff",
                        borderRight: "none",
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                {/* 🎯 SECCIÓN DEL LOGOTIPO ACTUALIZADA */}
                <Toolbar sx={{ bgcolor: "#00265a", justifyContent: "center", py: 1 }}>
                    <Link href="/" passHref style={{ textDecoration: "none", display: "flex", justifyContent: "center", width: "100%" }}>
                        <Box
                            component="img"
                            src="/img/logo.png"// 🛠️ Next.js sirve la carpeta src/app/resources de forma pública o relativa según tu config de alias
                            alt="Ribera Town Houses"
                            sx={{
                                maxHeight: "45px",  // Ajusta la altura máxima para que quepa perfecto en el Toolbar
                                maxWidth: "90%",    // Evita que se desborde del ancho del menú
                                objectFit: "contain",
                                cursor: "pointer",
                                transition: "transform 0.2s ease-in-out, opacity 0.2s",
                                "&:hover": {
                                    opacity: 0.85,
                                    transform: "scale(1.02)" // Efecto sutil de aumento al pasar el mouse
                                },
                            }}
                        />
                    </Link>
                </Toolbar>
                <Divider sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />

                <List sx={{ mt: 2 }}>
                    {MENU_ITEMS.map((item) => {
                        const activo = pathname.startsWith(item.ruta);

                        return (
                            <ListItem key={item.texto} disablePadding>
                                <ListItemButton
                                    onClick={() => router.push(item.ruta)}
                                    sx={{
                                        mx: 1,
                                        borderRadius: 1,
                                        mb: 0.5,
                                        bgcolor: activo ? "primary.main" : "transparent",
                                        color: activo ? "primary.contrastText" : "rgba(255, 255, 255, 0.7)",
                                        "&:hover": {
                                            bgcolor: activo ? "primary.main" : "rgba(255, 255, 255, 0.05)",
                                            color: "white",
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ color: activo ? "inherit" : "rgba(255, 255, 255, 0.4)" }}>
                                        {item.icono}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="body1"
                                                sx={{ fontWeight: activo ? "bold" : "normal", fontSize: "0.95rem" }}
                                            >
                                                {item.texto}
                                            </Typography>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Drawer>
        </Box>
    );
}