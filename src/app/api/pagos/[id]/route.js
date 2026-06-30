import { NextResponse } from 'next/server';
import pool from '../../../lib/db'; // Mantenemos tu importación relativa intacta

// 📝 PATCH: Editar un Pago específico
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { 
      amount, 
      month, 
      year, 
      status, 
      invoiceUrl, 
      comment, 
      paymentDate 
    } = body;

    // 🎯 SOLUCIÓN: Si viene una fecha, la convertimos al formato plano YYYY-MM-DD HH:mm:ss que MySQL exige
    let fechaFormateada = null;
    if (paymentDate) {
      const d = new Date(paymentDate);
      // Validamos que sea una fecha real antes de formatear
      if (!isNaN(d.getTime())) {
        fechaFormateada = d.toISOString().slice(0, 19).replace('T', ' ');
      }
    }

    const queryActualizar = `
      UPDATE payments 
      SET 
        amount = COALESCE(?, amount), 
        month = COALESCE(?, month), 
        year = COALESCE(?, year), 
        status = COALESCE(?, status), 
        invoiceUrl = COALESCE(?, invoiceUrl), 
        comment = COALESCE(?, comment), 
        paymentDate = COALESCE(?, paymentDate) 
      WHERE id = ?
    `;
    
    const parametros = [
      amount !== undefined ? amount : null,
      month !== undefined ? month : null,
      year !== undefined ? year : null,
      status !== undefined ? status : null,
      invoiceUrl !== undefined ? invoiceUrl : null,
      comment !== undefined ? comment : null,
      fechaFormateada, // 👈 Pasamos la fecha limpia sin la 'T' ni la 'Z'
      id
    ];

    const [result] = await pool.query(queryActualizar, parametros)
      .catch(() => 
        pool.query(`
          UPDATE Payments 
          SET 
            amount = COALESCE(?, amount), 
            month = COALESCE(?, month), 
            year = COALESCE(?, year), 
            status = COALESCE(?, status), 
            invoiceUrl = COALESCE(?, invoiceUrl), 
            comment = COALESCE(?, comment), 
            paymentDate = COALESCE(?, paymentDate) 
          WHERE id = ?
        `, parametros)
      );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Pago actualizado con éxito' }, { status: 200 });
  } catch (error) {
    console.error("❌ Error al actualizar el pago:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ❌ DELETE: Eliminar un Pago de forma directa usando su UUID
export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // Recibe el UUID del Pago

    // En tu modelo, 'Payments' es hijo de 'Department' (un departamento tiene muchos pagos), 
    // por lo que puedes borrar un pago de forma directa sin romper restricciones del padre.
    const queryBorrar = `DELETE FROM payments WHERE id = ?`;
    
    const [result] = await pool.query(queryBorrar, [id])
      .catch(() => pool.query(`DELETE FROM Payments WHERE id = ?`, [id]));

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'El pago no existe o ya fue eliminado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Pago eliminado con éxito.' }, { status: 200 });

  } catch (error) {
    console.error("❌ ERROR CRÍTICO AL BORRAR PAGO:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}