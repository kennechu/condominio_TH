import { NextResponse } from 'next/server';
import pool from '@/app/lib/db'; // Reutiliza la misma importación exacta que ya te funcionaba aquí

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterMes = searchParams.get('mes');
    const filterTorre = searchParams.get('torre');
    const filterDepto = searchParams.get('depto');

    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear(); // 2026

    // --- 1. CONSULTAS PARA LOS CATÁLOGOS DE LOS FILTROS ---
    const [torresRows] = await pool.query(
      "SELECT DISTINCT tower FROM department WHERE tower IS NOT NULL AND tower != '' ORDER BY tower ASC"
    ).catch(() => pool.query("SELECT DISTINCT tower FROM Department WHERE tower IS NOT NULL AND tower != '' ORDER BY tower ASC"));

    const [deptosRows] = await pool.query(
      "SELECT DISTINCT deptNum FROM department WHERE deptNum IS NOT NULL ORDER BY deptNum ASC"
    ).catch(() => pool.query("SELECT DISTINCT deptNum FROM Department WHERE deptNum IS NOT NULL ORDER BY deptNum ASC"));

    // Mapeamos los arreglos usando los nuevos campos en inglés
    const torres = torresRows.map(row => row.tower);
    const departamentos = deptosRows.map(row => row.deptNum);


    // --- 2. TOTAL RESIDENTES ---
    const [residenteCount] = await pool.query("SELECT COUNT(*) as total FROM resident WHERE role = 'RESIDENTE'")
      .catch(() => pool.query("SELECT COUNT(*) as total FROM Resident WHERE role = 'RESIDENTE'"));


    // --- 3. OCUPACIÓN DE DEPARTAMENTOS ---
    let deptoConditions = [];
    let deptoParams = [];
    if (filterTorre) { deptoConditions.push("tower = ?"); deptoParams.push(filterTorre); }
    if (filterDepto) { deptoConditions.push("deptNum = ?"); deptoParams.push(parseInt(filterDepto, 10)); }
    const deptoWhere = deptoConditions.length > 0 ? `WHERE ${deptoConditions.join(' AND ')}` : '';

    const [deptoStats] = await pool.query(`
      SELECT COUNT(id) as total, SUM(CASE WHEN residentId IS NOT NULL THEN 1 ELSE 0 END) as ocupados 
      FROM department ${deptoWhere}
    `, deptoParams).catch(() => pool.query(`
      SELECT COUNT(id) as total, SUM(CASE WHEN residentId IS NOT NULL THEN 1 ELSE 0 END) as ocupados 
      FROM Department ${deptoWhere}
    `, deptoParams));


    // --- 4. INGRESOS LIQUIDADOS (MÉTRICA DINÁMICA ACTUALIZADA) ---
    let ingresosConditions = ["p.status = 'APROBADO'"];
    let ingresosParams = [];

    // Si el usuario filtra por un mes específico, acotamos por tiempo
    if (filterMes) {
      ingresosConditions.push("p.month = ?");
      ingresosParams.push(parseInt(filterMes, 10));
      ingresosConditions.push("p.year = ?");
      ingresosParams.push(anioActual);
    }
    // Si no hay filtro de mes, se ignora el periodo para acumular el gran total histórico

    // Filtros espaciales añadidos dinámicamente si el usuario los selecciona
    if (filterTorre) {
      ingresosConditions.push("d.tower = ?");
      ingresosParams.push(filterTorre);
    }
    if (filterDepto) {
      ingresosConditions.push("d.deptNum = ?");
      ingresosParams.push(parseInt(filterDepto, 10));
    }

    const queryIngresos = `
      SELECT SUM(p.amount) as total 
      FROM payments p
      INNER JOIN department d ON p.departamentId = d.id
      WHERE ${ingresosConditions.join(' AND ')}
    `;
    
    const [ingresosMes] = await pool.query(queryIngresos, ingresosParams)
      .catch(() => 
        pool.query(`
          SELECT SUM(p.amount) as total 
          FROM Payments p
          INNER JOIN Department d ON p.departamentId = d.id
          WHERE ${ingresosConditions.join(' AND ')}
        `, ingresosParams)
      );


    // --- 5. CARTERA VENCIDA / MOROSIDAD ---
    let morosidadConditions = ["p.status = 'PENDIENTE'"];
    let morosidadParams = [];
    
    if (filterMes) { morosidadConditions.push("p.month = ?"); morosidadParams.push(parseInt(filterMes, 10)); }
    if (filterTorre) { morosidadConditions.push("d.tower = ?"); morosidadParams.push(filterTorre); }
    if (filterDepto) { morosidadConditions.push("d.deptNum = ?"); morosidadParams.push(parseInt(filterDepto, 10)); }

    const queryMorosidad = `
      SELECT COUNT(p.id) as total, SUM(p.amount) as montoTotal 
      FROM payments p
      INNER JOIN department d ON p.departamentId = d.id
      WHERE ${morosidadConditions.join(' AND ')}
    `;
    
    const [morosidadCount] = await pool.query(queryMorosidad, morosidadParams)
      .catch(() => 
        pool.query(`
          SELECT COUNT(p.id) as total, SUM(p.amount) as montoTotal 
          FROM Payments p
          INNER JOIN Department d ON p.departamentId = d.id
          WHERE ${morosidadConditions.join(' AND ')}
        `, morosidadParams)
      );


    // 📦 DEVOLVEMOS TODO EN UN SOLO PAQUETE HACIA EL FRONTEND
    return NextResponse.json({
      catalogos: { torres, departamentos },
      metrics: {
        residentes: residenteCount[0].total || 0,
        departamentos: {
          total: deptoStats[0].total || 0,
          ocupados: deptoStats[0].ocupados || 0
        },
        ingresosMesActual: parseFloat(ingresosMes[0].total || 0), // Mantiene la llave que espera tu Front, pero con datos dinámicos globales
        morosidad: {
          recibosPendientes: morosidadCount[0].total || 0,
          montoPendiente: parseFloat(morosidadCount[0].montoTotal || 0)
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error("❌ ERROR GENERAL EN ENDPOINT UNIFICADO:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}