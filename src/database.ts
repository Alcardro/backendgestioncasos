// backend/src/database.ts
import sqlite3 from 'sqlite3';
import path from 'path';

// Configurar SQLite para crear tablas si no existen
const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
  } else {
    console.log('✅ Conectado a la base de datos SQLite.');
    initializeDatabase();
  }
});

// Función para inicializar las tablas
function initializeDatabase() {
  // Tabla de usuarios
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de casos
  db.run(`CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    estado TEXT NOT NULL CHECK(estado IN ('PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'ARCHIVADO')),
    vencimiento DATE,
    creado_por INTEGER NOT NULL,
    asignado_a INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creado_por) REFERENCES users (id),
    FOREIGN KEY (asignado_a) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('❌ Error creando tabla cases:', err.message);
    } else {
      console.log('✅ Tabla "cases" lista.');
      insertInitialData();
    }
  });
}

// Insertar datos iniciales para probar
function insertInitialData() {
  // Insertar usuarios de prueba
  const users = [
    { username: 'abogado1', password: '123', email: 'abogado1@legal.com', nombre: 'Abogado Principal' },
    { username: 'abogado2', password: '123', email: 'abogado2@legal.com', nombre: 'Abogado Secundario' },
    { username: 'asistente', password: '123', email: 'asistente@legal.com', nombre: 'Asistente Legal' }
  ];

  users.forEach(user => {
    db.run(
      `INSERT OR IGNORE INTO users (username, password, email, nombre) VALUES (?, ?, ?, ?)`,
      [user.username, user.password, user.email, user.nombre],
      function(err) {
        if (err) {
          console.error('❌ Error insertando usuario:', err.message);
        } else if (this.changes > 0) {
          console.log(`✅ Usuario creado: ${user.username}`);
        }
      }
    );
  });

  // Insertar casos de prueba después de un delay para asegurar que los usuarios existen
  setTimeout(() => {
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
      },
      {
        nombre: 'Propiedad Intelectual',
        descripcion: 'Registro de marca y patentes',
        estado: 'COMPLETADO',
        vencimiento: null,
        creado_por: 2,
        asignado_a: 2
      }
    ];

    cases.forEach(caseItem => {
      db.run(
        `INSERT OR IGNORE INTO cases (nombre, descripcion, estado, vencimiento, creado_por, asignado_a) VALUES (?, ?, ?, ?, ?, ?)`,
        [caseItem.nombre, caseItem.descripcion, caseItem.estado, caseItem.vencimiento, caseItem.creado_por, caseItem.asignado_a],
        function(err) {
          if (err) {
            console.error('❌ Error insertando caso:', err.message);
          } else if (this.changes > 0) {
            console.log(`✅ Caso creado: ${caseItem.nombre}`);
          }
        }
      );
    });
  }, 1000);
}

// Función para hacer consultas más fácil
export const dbQuery = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Función para ejecutar INSERT, UPDATE, DELETE
export const dbRun = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

export default db;