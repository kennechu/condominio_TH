import { NextResponse } from 'next/server';
import pool from '../../lib/db'; // Mantenemos tu importación relativa intacta

// 1. GET: Listar todos los departamentos con el nombre de su residente
export async function GET() {
  try {
    // 🎯 Agregamos un LEFT JOIN para traer el nombre completo del residente si existe
    const queryListar = `
      SELECT 
        d.id, d.tower, d.deptNum, d.residentId,
        CONCAT(r.first_name, ' ', r.last_name) AS resident_name
      FROM department d
      LEFT JOIN resident r ON d.residentId = r.id
      ORDER BY d.tower ASC, d.deptNum ASC
    `;
    
    const [departamentos] = await pool.query(queryListar).catch(() => 
      // Soporte por si las tablas usan iniciales Mayúsculas
      pool.query(`
        SELECT 
          d.id, d.tower, d.deptNum, d.residentId,
          CONCAT(r.first_name, ' ', r.last_name) AS resident_name
        FROM Department d
        LEFT JOIN Resident r ON d.residentId = r.id
        ORDER BY d.tower ASC, d.deptNum ASC
      `)
    );
    
    return NextResponse.json(departamentos, { status: 200 });
  } catch (error) {
    console.error("❌ Error al obtener departamentos con residentes:", error);
    return NextResponse.json({ error: 'Error al obtener departamentos' }, { status: 500 });
  }
}

// 2. POST: Registrar un nuevo departamento
export async function POST(request) {
  try {
    const body = await request.json();
    const { tower, deptNum, residentId } = body;

    // 1. Validación basada en las nuevas propiedades del modelo Department
    if (!tower || !deptNum) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const torreFormateada = tower.toUpperCase().trim();
    const numeroFormateado = parseInt(deptNum, 10);
    const idResidente = residentId ? residentId.trim() : null; // residentId es opcional en el esquema (String?)

    // 2. Validar si ya existe la combinación única de Torre y Número (Tu regla @@unique([tower, deptNum]))
    const [existe] = await pool.query(
      'SELECT id FROM department WHERE tower = ? AND deptNum = ?',
      [torreFormateada, numeroFormateado]
    ).catch(() => 
      pool.query('SELECT id FROM Department WHERE tower = ? AND deptNum = ?', [torreFormateada, numeroFormateado])
    );

    if (existe.length > 0) {
      return NextResponse.json(
        { error: `El departamento ${torreFormateada}-${numeroFormateado} ya se encuentra registrado.` },
        { status: 400 }
      );
    }

    // 3. Insertar el departamento en la base de datos
    const idDepartment = crypto.randomUUID(); 
    
    const queryInsertar = `
      INSERT INTO department (id, tower, deptNum, residentId) 
      VALUES (?, ?, ?, ?)
    `;

    await pool.query(queryInsertar, [
      idDepartment, 
      torreFormateada, 
      numeroFormateado, 
      idResidente
    ]).catch(() => 
      pool.query(`
        INSERT INTO Department (id, tower, deptNum, residentId) 
        VALUES (?, ?, ?, ?)
      `, [idDepartment, torreFormateada, numeroFormateado, idResidente])
    );

    // Responder con el objeto creado en inglés
    return NextResponse.json({
      id: idDepartment,
      tower: torreFormateada,
      deptNum: numeroFormateado,
      residentId: idResidente
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Error en el servidor al crear departamento:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}