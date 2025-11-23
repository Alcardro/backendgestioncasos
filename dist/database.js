"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbRun = exports.dbQuery = void 0;
// backend/src/database.ts
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dbPath = path_1.default.join(__dirname, '../../database.db');
console.log('📁 Database path:', dbPath);
// Eliminar base de datos existente si está corrupta (solo desarrollo)
if (fs_1.default.existsSync(dbPath) && process.env.NODE_ENV !== 'production') {
    console.log('🗑️ Removing existing database file...');
    fs_1.default.unlinkSync(dbPath);
}
const db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error conectando a SQLite:', err.message);
    }
    else {
        console.log('✅ Conectado a la base de datos SQLite.');
        initializeDatabase();
    }
});
function initializeDatabase() {
    // Tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
        if (err) {
            console.error('❌ Error creando tabla users:', err.message);
        }
        else {
            console.log('✅ Tabla "users" lista.');
            // Insertar usuarios de prueba
            const users = [
                { username: 'abogado1', password: '123', email: 'abogado1@legal.com', nombre: 'Abogado Principal' },
                { username: 'abogado2', password: '123', email: 'abogado2@legal.com', nombre: 'Abogado Secundario' },
                { username: 'asistente', password: '123', email: 'asistente@legal.com', nombre: 'Asistente Legal' }
            ];
            users.forEach(user => {
                db.run(`INSERT OR IGNORE INTO users (username, password, email, nombre) VALUES (?, ?, ?, ?)`, [user.username, user.password, user.email, user.nombre], function (err) {
                    if (err) {
                        console.error('❌ Error insertando usuario:', err.message);
                    }
                    else if (this.changes > 0) {
                        console.log(`✅ Usuario creado: ${user.username}`);
                    }
                });
            });
        }
    });
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
        }
        else {
            console.log('✅ Tabla "cases" lista.');
            // Insertar casos de prueba después de un delay
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
                    }
                ];
                cases.forEach(caseItem => {
                    db.run(`INSERT OR IGNORE INTO cases (nombre, descripcion, estado, vencimiento, creado_por, asignado_a) VALUES (?, ?, ?, ?, ?, ?)`, [caseItem.nombre, caseItem.descripcion, caseItem.estado, caseItem.vencimiento, caseItem.creado_por, caseItem.asignado_a], function (err) {
                        if (err) {
                            console.error('❌ Error insertando caso:', err.message);
                        }
                        else if (this.changes > 0) {
                            console.log(`✅ Caso creado: ${caseItem.nombre}`);
                        }
                    });
                });
            }, 1000);
        }
    });
}
// Función para hacer consultas
const dbQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
};
exports.dbQuery = dbQuery;
// Función para ejecutar INSERT, UPDATE, DELETE
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};
exports.dbRun = dbRun;
exports.default = db;
