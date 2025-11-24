"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/caseRoutes.ts - COMPLETO con todos los métodos
const express_1 = require("express");
const database_1 = require("../database");
const router = (0, express_1.Router)();
// Obtener todos los casos
router.get('/', async (req, res) => {
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
});
// Obtener un caso por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cases = await (0, database_1.dbQuery)(`
      SELECT c.*, u1.nombre as creado_por_nombre, u2.nombre as asignado_a_nombre 
      FROM cases c
      LEFT JOIN users u1 ON c.creado_por = u1.id
      LEFT JOIN users u2 ON c.asignado_a = u2.id
      WHERE c.id = ?
    `, [id]);
        if (cases.length === 0) {
            return res.status(404).json({ error: 'Caso no encontrado' });
        }
        res.json(cases[0]);
    }
    catch (error) {
        console.error('Error obteniendo caso:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Crear nuevo caso
router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion, estado, vencimiento, creado_por, asignado_a } = req.body;
        if (!nombre || !descripcion || !estado || !creado_por) {
            return res.status(400).json({ error: 'Nombre, descripción, estado y creado_por son requeridos' });
        }
        const result = await (0, database_1.dbRun)(`INSERT INTO cases (nombre, descripcion, estado, vencimiento, creado_por, asignado_a) 
       VALUES (?, ?, ?, ?, ?, ?)`, [nombre, descripcion, estado, vencimiento || null, creado_por, asignado_a || null]);
        // Obtener el caso recién creado
        const newCase = await (0, database_1.dbQuery)(`
      SELECT c.*, u1.nombre as creado_por_nombre, u2.nombre as asignado_a_nombre 
      FROM cases c
      LEFT JOIN users u1 ON c.creado_por = u1.id
      LEFT JOIN users u2 ON c.asignado_a = u2.id
      WHERE c.id = ?
    `, [result.lastID]);
        res.status(201).json(newCase[0]);
    }
    catch (error) {
        console.error('Error creando caso:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// ✅ NUEVO: Actualizar caso
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, estado, vencimiento, asignado_a } = req.body;
        console.log('✏️ Actualizando caso:', id, req.body);
        // Verificar que el caso existe
        const existingCase = await (0, database_1.dbQuery)('SELECT * FROM cases WHERE id = ?', [id]);
        if (existingCase.length === 0) {
            return res.status(404).json({ error: 'Caso no encontrado' });
        }
        // Construir la consulta dinámicamente
        const updates = [];
        const params = [];
        if (nombre !== undefined) {
            updates.push('nombre = ?');
            params.push(nombre);
        }
        if (descripcion !== undefined) {
            updates.push('descripcion = ?');
            params.push(descripcion);
        }
        if (estado !== undefined) {
            updates.push('estado = ?');
            params.push(estado);
        }
        if (vencimiento !== undefined) {
            updates.push('vencimiento = ?');
            params.push(vencimiento || null);
        }
        if (asignado_a !== undefined) {
            updates.push('asignado_a = ?');
            params.push(asignado_a || null);
        }
        // Siempre actualizar la fecha de modificación
        updates.push('updated_at = CURRENT_TIMESTAMP');
        if (updates.length === 1) { // Solo updated_at
            return res.status(400).json({ error: 'No hay campos para actualizar' });
        }
        params.push(id); // Para el WHERE
        const sql = `UPDATE cases SET ${updates.join(', ')} WHERE id = ?`;
        await (0, database_1.dbRun)(sql, params);
        // Obtener el caso actualizado
        const updatedCase = await (0, database_1.dbQuery)(`
      SELECT c.*, u1.nombre as creado_por_nombre, u2.nombre as asignado_a_nombre 
      FROM cases c
      LEFT JOIN users u1 ON c.creado_por = u1.id
      LEFT JOIN users u2 ON c.asignado_a = u2.id
      WHERE c.id = ?
    `, [id]);
        res.json(updatedCase[0]);
    }
    catch (error) {
        console.error('Error actualizando caso:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// ✅ NUEVO: Eliminar caso
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ Eliminando caso:', id);
        // Verificar que el caso existe
        const existingCase = await (0, database_1.dbQuery)('SELECT * FROM cases WHERE id = ?', [id]);
        if (existingCase.length === 0) {
            return res.status(404).json({ error: 'Caso no encontrado' });
        }
        await (0, database_1.dbRun)('DELETE FROM cases WHERE id = ?', [id]);
        res.json({ message: 'Caso eliminado exitosamente' });
    }
    catch (error) {
        console.error('Error eliminando caso:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
exports.default = router;
