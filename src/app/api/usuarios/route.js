import { NextResponse } from 'next/server';
import pool from '../../lib/db';

// 1. GET: Listar usuarios
export async function GET() {
  try {
    // 🎯 Seleccionamos los campos exactos del nuevo modelo Resident
    const queryListar = `
      SELECT id, first_name, last_name, correo, user_name, role, tagId, creationDate 
      FROM resident 
      ORDER BY last_name ASC, first_name ASC
    `;
    
    // Ejecución con soporte por si tu MySQL real usa inicial mayúscula
    const [residents] = await pool.query(queryListar).catch(() => 
      pool.query(`
        SELECT id, first_name, last_name, correo, user_name, role, tagId, creationDate 
        FROM Resident 
        ORDER BY last_name ASC, first_name ASC
      `)
    );

    return NextResponse.json(residents, { status: 200 });
  } catch (error) {
    console.error("❌ Error al obtener residentes:", error);
    return NextResponse.json({ error: 'Error interno al cargar residentes.' }, { status: 500 });
  }
}

// 2. POST: Crear usuario
export async function POST(request) {
  try {
    const body = await request.json();
    const { first_name, last_name, correo, user_name, password, role, tagId } = body;

    // 🎯 Validación con los nuevos campos obligatorios según el esquema
    if (!first_name || !last_name || !correo || !user_name || !password || !role) {
      return NextResponse.json({ error: 'Campos obligatorios faltantes.' }, { status: 400 });
    }

    // Limpieza de datos básicos
    const emailFormateado = correo.toLowerCase().trim();
    const usernameFormateado = user_name.trim();

    // Validar si el correo ya existe
    const [existeCorreo] = await pool.query('SELECT id FROM resident WHERE correo = ?', [emailFormateado])
      .catch(() => pool.query('SELECT id FROM Resident WHERE correo = ?', [emailFormateado]));
      
    if (existeCorreo.length > 0) {
      return NextResponse.json({ error: 'El correo electrónico ya está registrado.' }, { status: 400 });
    }

    // Generar el UUID único para el residente
    const idResident = crypto.randomUUID();

    // 🎯 Insertar los registros usando las columnas en inglés
    const queryInsertar = `
      INSERT INTO resident (id, first_name, last_name, correo, user_name, password, role, tagId) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query(queryInsertar, [
      idResident, 
      first_name.trim(), 
      last_name.trim(), 
      emailFormateado, 
      usernameFormateado, 
      password, // Idealmente encriptada en el futuro con bcrypt
      role, 
      tagId ? tagId.trim() : null // tagId es opcional en el esquema
    ]).catch(() => 
      pool.query(`
        INSERT INTO Resident (id, first_name, last_name, correo, user_name, password, role, tagId) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [idResident, first_name.trim(), last_name.trim(), emailFormateado, usernameFormateado, password, role, tagId ? tagId.trim() : null])
    );

    // Responder con los datos del nuevo residente creado (excluyendo el password por seguridad)
    return NextResponse.json({ 
      id: idResident, 
      first_name, 
      last_name, 
      correo: emailFormateado, 
      user_name: usernameFormateado, 
      role,
      tagId: tagId || null
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Error al crear residente:", error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}