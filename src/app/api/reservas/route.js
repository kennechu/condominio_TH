import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// 1. GET: Obtener las reservas (útil para el calendario o agenda)
// Ejemplo: /api/reservas?fecha=2026-06-27 o /api/reservas (trae todas)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaParam = searchParams.get('fecha'); // Formato esperado: YYYY-MM-DD

    const donde = {};
    if (fechaParam) {
      // Filtramos las que coincidan exactamente con el día seleccionado
      donde.fecha = new Date(fechaParam);
    }

    const reservas = await prisma.reserva.findMany({
      where: donde,
      include: {
        areaComun: true,
        departamento: {
          select: {
            torre: true,
            numero: true,
          }
        }
      },
      orderBy: { horaInicio: 'asc' },
    });

    return NextResponse.json(reservas, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener las reservas' },
      { status: 500 }
    );
  }
}

// 2. POST: Solicitar una nueva reserva con validación de horarios
export async function POST(request) {
  try {
    const body = await request.json();
    const { departamentoId, areaComunId, fecha, horaInicio, horaFin } = body;

    // Validación de campos obligatorios
    if (!departamentoId || !areaComunId || !fecha || !horaInicio || !horaFin) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios para procesar la reserva' },
        { status: 400 }
      );
    }

    // Convertimos los strings recibidos a objetos Date válidos
    const fechaReserva = new Date(fecha);
    const inicio = new Date(horaInicio);
    const fin = new Date(horaFin);

    // Validación lógica temporal básica
    if (inicio >= fin) {
      return NextResponse.json(
        { error: 'La hora de inicio debe ser menor a la hora de finalización' },
        { status: 400 }
      );
    }

    // 🛡️ ALGORITMO ANTICRUCHES: Buscar si ya existe una reserva activa que se empalme
    // Se empalma si: un horario existente empieza antes de que termine el nuevo,
    // Y termina después de que empiece el nuevo.
    const reservaExistente = await prisma.reserva.findFirst({
      where: {
        areaComunId: areaComunId,
        fecha: fechaReserva,
        estatus: { in: ['PENDIENTE', 'APROBADA'] }, // Ignoramos las canceladas
        AND: [
          { horaInicio: { lt: fin } },
          { horaFin: { gt: inicio } }
        ]
      },
      include: {
        departamento: true
      }
    });

    if (reservaExistente) {
      const deptoConflictivo = `${reservaExistente.departamento.torre}-${reservaExistente.departamento.numero}`;
      return NextResponse.json(
        { 
          error: `El horario solicitado no está disponible. Ya se encuentra apartado por el departamento ${deptoConflictivo}.` 
        },
        { status: 400 }
      );
    }

    // Si pasó la validación, procedemos a crear la reserva
    const nuevaReserva = await prisma.reserva.create({
      data: {
        fecha: fechaReserva,
        horaInicio: inicio,
        horaFin: fin,
        departamentoId,
        areaComunId,
        estatus: 'PENDIENTE', // Por defecto entra como pendiente de aprobación
      },
    });

    return NextResponse.json(nuevaReserva, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error interno del servidor al crear la reserva' },
      { status: 500 }
    );
  }
}