// backend/src/database.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de PostgreSQL para Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Función para inicializar las tablas
async function initializeDatabase() {
  try {
    // Tabla de usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de casos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cases (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        descripcion TEXT NOT NULL,
        estado VARCHAR(20) NOT NULL CHECK(estado IN ('PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'ARCHIVADO')),
        vencimiento DATE,
        creado_por INTEGER NOT NULL,
        asignado_a INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creado_por) REFERENCES users (id),
        FOREIGN KEY (asignado_a) REFERENCES users (id)
      )
    `);

    console.log('✅ Tablas creadas exitosamente');
    await insertInitialData();
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
  }
}

// Insertar datos iniciales
async function insertInitialData() {
  try {
    // Insertar usuarios de prueba
    const users = [
      { username: 'abogado1', password: '123', email: 'abogado1@legal.com', nombre: 'Abogado Principal' },
      { username: 'abogado2', password: '123', email: 'abogado2@legal.com', nombre: 'Abogado Secundario' },
      { username: 'asistente', password: '123', email: 'asistente@legal.com', nombre: 'Asistente Legal' }
    ];

    for (const user of users) {
      const result = await pool.query(
        `INSERT INTO users (username, password, email, nombre) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (username) DO NOTHING`,
        [user.username, user.password, user.email, user.nombre]
      );
      
      if (result.rowCount && result.rowCount > 0) {
        console.log(`✅ Usuario creado: ${user.username}`);
      }
    }

    // Insertar casos de prueba
    const cases = [
      {
        nombre: 'Caso Corporativo ABC',
        descripcion: 'Fusión empresarial con due diligence',
        estado: 'EN_PROCESO',
        vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        creado_por: 1,
        asignado_a: 1
      },
      {
        nombre: 'Litigio Laboral XYZ',
        descripcion: 'Demanda por despido injustificado',
        estado: 'PENDIENTE', 
        vencimiento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        creado_por: 1,
        asignado_a: 3
      }
    ];

    for (const caseItem of cases) {
      const result = await pool.query(
        `INSERT INTO cases (nombre, descripcion, estado, vencimiento, creado_por, asignado_a) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (nombre) DO NOTHING`,
        [caseItem.nombre, caseItem.descripcion, caseItem.estado, caseItem.vencimiento, caseItem.creado_por, caseItem.asignado_a]
      );
      
      if (result.rowCount && result.rowCount > 0) {
        console.log(`✅ Caso creado: ${caseItem.nombre}`);
      }
    }

  } catch (error) {
    console.error('❌ Error insertando datos iniciales:', error);
  }
}

// Función para hacer consultas
export const dbQuery = (sql: string, params: any[] = []): Promise<any> => {
  return pool.query(sql, params);
};

// Función para ejecutar INSERT, UPDATE, DELETE
export const dbRun = (sql: string, params: any[] = []): Promise<any> => {
  return pool.query(sql, params);
};

// Inicializar la base de datos al importar
initializeDatabase();

export default pool;