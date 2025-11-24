"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCase = exports.getCases = void 0;
const database_1 = require("../database");
// Obtener todos los casos
const getCases = async (req, res) => {
    try {
        const cases = await (0, database_1.dbQuery)(`
      SELECT c.*, u1.nombre as creado_por_nombre, u2.nombre as asignado_a_nombre 
      FROM cases c
      LEFT JOIN users u1 ON c.creado_por = u1.id
      LEFT JOIN users u2 ON c.asignado_a = u2.id
      ORDER BY c.created_at DESC
    `);
        res.json(cases);
    }
    catch (error) {
        console.error('Error obteniendo casos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getCases = getCases;
// Crear nuevo caso
const createCase = async (req, res) => {
    try {
        const { nombre, descripcion, estado, vencimiento, creado_por, asignado_a } = req.body;
        // Validaciones básicas
        if (!nombre || !descripcion || !estado || !creado_por) {
            return res.status(400).json({ error: 'Nombre, descripción, estado y creado_por son requeridos' });
        }
        const result = await (0, database_1.dbRun)(`INSERT INTO cases (nombre, descripcion, estado, vencimiento, creado_por, asignado_a) 
       VALUES (?, ?, ?, ?, ?, ?)`, [nombre, descripcion, estado, vencimiento || null, creado_por, asignado_a || null]);
        // Obtener el caso recién creado con información de usuarios
        const newCase = await (0, database_1.dbQuery)(`
      SELECT c.*, u1.nombre as creado_por_nombre, u2.nombre as asignado_a_nombre 
      FROM cases c
      LEFT JOIN users u1 ON c.creado_por = u1.id
      LEFT JOIN users u2 ON c.asignado_a = u2.id
      WHERE c.id = ?
    `, [result.id]);
        res.status(201).json(newCase[0]);
    }
    catch (error) {
        console.error('Error creando caso:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.createCase = createCase;
