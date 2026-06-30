import { NextResponse } from 'next/server';
import pool from '../../lib/db'; // Mantenemos tu importación relativa intacta

// 1. GET: Listar todos los pagos emparejados con su departamento y residente
export async function GET() {
  try {
    // 🎯 Consulta adaptada por completo a los nuevos nombres en inglés y campos divididos
    const querySQL = `
      SELECT 
        p.id, p.amount, p.month, p.year, p.status, p.invoiceUrl, p.comment, p.paymentDate, p.creationDate,
        d.tower, d.deptNum,
        CONCAT(r.first_name, ' ', r.last_name) AS resident_name
      FROM payments p
      JOIN department d ON p.departamentId = d.id
      JOIN resident r ON d.residentId = r.id
      ORDER BY p.year DESC, p.month DESC, d.tower ASC, d.deptNum ASC
    `;
    
    const [pagos] = await pool.query(querySQL).catch(() => 
      // Soporte por si las tablas reales de MySQL se generaron con iniciales Mayúsculas
      pool.query(`
        SELECT 
          p.id, p.amount, p.month, p.year, p.status, p.invoiceUrl, p.comment, p.paymentDate, p.creationDate,
          d.tower, d.deptNum,
          CONCAT(r.first_name, ' ', r.last_name) AS resident_name
        FROM Payments p
        JOIN Department d ON p.departamentId = d.id
        JOIN Resident r ON d.residentId = r.id
        ORDER BY p.year DESC, p.month DESC, d.tower ASC, d.deptNum ASC
      `)
    );

    return NextResponse.json(pagos, { status: 200 });
  } catch (error) {
    console.error("❌ Error al obtener pagos:", error);
    return NextResponse.json(
      { error: 'Error interno al cargar el historial de pagos.' },
      { status: 500 }
    );
  }
}

// POST: Registrar una nueva cuota para un departamento (Protegido contra departamentos desocupados)
export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, month, year, departamentId, status, comment, invoiceUrl } = body;

    // 1. Validación básica de campos obligatorios
    if (!amount || !month || !year || !departamentId) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }

    // 2. 🛡️ CONTROL CLAVE: Verificar que el departamento cuente con un residente asignado
    const [deptoCheck] = await pool.query(
      'SELECT residentId, tower, deptNum FROM department WHERE id = ?',
      [departamentId]
    ).catch(() => 
      pool.query('SELECT residentId, tower, deptNum FROM Department WHERE id = ?', [departamentId])
    );

    if (deptoCheck.length === 0) {
      return NextResponse.json({ error: 'El departamento especificado no existe.' }, { status: 404 });
    }

    // Si el residentId viene como NULL, rechazamos el registro de la cuota de inmediato
    if (!deptoCheck[0].residentId) {
      return NextResponse.json({ 
        error: `No es posible generar cuotas para la Torre ${deptoCheck[0].tower} - Depto ${deptoCheck[0].deptNum} porque se encuentra catalogado como Disponible / Desocupado.` 
      }, { status: 400 });
    }

    const idPago = crypto.randomUUID();
    const statusInicial = status || 'PENDIENTE';
    const paymentDate = statusInicial === 'APROBADO' ? new Date() : null;
    const creationDate = new Date();

    // 3. Insert seguro si superó la validación superior
    const queryInsert = `
      INSERT INTO payments (
        id, amount, month, year, status, invoiceUrl, comment, paymentDate, creationDate, departamentId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(queryInsert, [
      idPago,
      parseFloat(amount),
      parseInt(month, 10),
      parseInt(year, 10),
      statusInicial,
      invoiceUrl || null,
      comment || null,
      paymentDate,
      creationDate,
      departamentId
    ]).catch(() => 
      pool.query(`
        INSERT INTO Payments (
          id, amount, month, year, status, invoiceUrl, comment, paymentDate, creationDate, departamentId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [idPago, parseFloat(amount), parseInt(month, 10), parseInt(year, 10), statusInicial, invoiceUrl || null, comment || null, paymentDate, creationDate, departamentId])
    );

    return NextResponse.json({ id: idPago, message: 'Registro de pago creado con éxito.' }, { status: 201 });
  } catch (error) {
    console.error("❌ Error al registrar pago:", error);
    return NextResponse.json({ error: 'Error interno del servidor al crear el pago.' }, { status: 500 });
  }
}