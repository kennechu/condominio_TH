import { NextResponse } from 'next/server';
import pool from '@/app/lib/db'; // Mantenemos tu alias de base de datos

// 📝 PATCH: Actualizar o cambiar el residente de un departamento específico
export async function PATCH(request, { params }) {
  try {
    const { id } = await params; // Recibe el UUID del departamento
    const body = await request.json();
    const { residentId } = body; 

    // Validar si el residentId enviado es un string vacío, lo normalizamos a NULL
    const nuevoResidente = residentId && residentId.trim() !== '' ? residentId.trim() : null;

    // Query adaptada al nuevo modelo Department en inglés
    const queryActualizar = `
      UPDATE department 
      SET residentId = ? 
      WHERE id = ?
    `;
    
    const [result] = await pool.query(queryActualizar, [nuevoResidente, id]).catch(() => 
      // Soporte por si tu MySQL real mapeó la tabla con Inicial Mayúscula (Department)
      pool.query(`UPDATE Department SET residentId = ? WHERE id = ?`, [nuevoResidente, id])
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Departamento no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: nuevoResidente 
        ? 'Residente asignado al departamento con éxito.' 
        : 'El departamento ha sido liberado (quedó desocupado).' 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error al actualizar residente del departamento:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}