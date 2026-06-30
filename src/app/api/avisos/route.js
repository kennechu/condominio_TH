import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET: Obtener todos los avisos ordenados por el más reciente
export async function GET() {
  try {
    const avisos = await prisma.aviso.findMany({
      orderBy: {
        fechaCreacion: 'desc',
      },
    });
    return NextResponse.json(avisos, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener los avisos' },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo aviso (Uso exclusivo de Administración)
export async function POST(request) {
  try {
    const body = await request.json();
    const { titulo, contenido } = body;

    // Validación básica
    if (!titulo || !contenido) {
      return NextResponse.json(
        { error: 'El título y el contenido son requeridos' },
        { status: 400 }
      );
    }

    const nuevoAviso = await prisma.aviso.create({
      data: {
        titulo,
        contenido,
      },
    });

    return NextResponse.json(nuevoAviso, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear el aviso' },
      { status: 500 }
    );
  }
}