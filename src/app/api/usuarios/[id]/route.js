import { NextResponse } from 'next/server';
import pool from '@/app/lib/db'; // Mantenemos tu importación con alias intacta

// 📝 PATCH: Editar Residente (Campos nuevos en inglés)
export async function PATCH(request, { params }) {
  try {
    const { id } = await params; // Recibe el UUID del residente
    const { first_name, last_name, correo, role, tagId } = await request.json();

    // Query adaptada a los nuevos campos de la tabla Resident
    const queryActualizar = `
      UPDATE resident 
      SET first_name = ?, last_name = ?, correo = ?, role = ?, tagId = ? 
      WHERE id = ?
    `;
    
    const [result] = await pool.query(queryActualizar, [
      first_name.trim(), 
      last_name.trim(), 
      correo.toLowerCase().trim(), 
      role, 
      tagId ? tagId.trim() : null, 
      id
    ]).catch(() => 
      pool.query(`UPDATE Resident SET first_name = ?, last_name = ?, correo = ?, role = ?, tagId = ? WHERE id = ?`, [
        first_name.trim(), 
        last_name.trim(), 
        correo.toLowerCase().trim(), 
        role, 
        tagId ? tagId.trim() : null, 
        id
      ])
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Residente no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Residente actualizado con éxito' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ❌ DELETE: Eliminar Residente de forma segura usando su UUID
export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // Ahora llega de forma estricta el UUID del Residente

    // 1. 🛡️ DESVINCULAR DE LA TABLA DEPARTMENT (Acción manual del SetNull)
    // Buscamos cualquier inmueble asociado a este residentId y limpiamos la columna poniéndola en NULL
    await pool.query(
      "UPDATE department SET residentId = NULL WHERE residentId = ?", 
      [id]
    ).catch(() => 
      pool.query("UPDATE Department SET residentId = NULL WHERE residentId = ?", [id])
    );

    // 2. 🎯 ELIMINAR EL REGISTRO EN LA TABLA RESIDENT
    // Al haber limpiado la referencia superior en la línea de arriba, MySQL dará luz verde de inmediato
    const queryBorrarResident = `DELETE FROM resident WHERE id = ?`;
    const [result] = await pool.query(queryBorrarResident, [id])
      .catch(() => pool.query(`DELETE FROM Resident WHERE id = ?`, [id]));

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'El residente no existe o ya fue eliminado' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Residente eliminado y departamentos desvinculados con éxito.' 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ ERROR CRÍTICO AL BORRAR RESIDENTE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}