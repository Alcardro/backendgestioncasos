"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/authRoutes.ts - VERSIÓN CORREGIDA
const express_1 = require("express");
const router = (0, express_1.Router)();
// Ruta de login simple para probar
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('📨 Login attempt:', username);
    if (username === 'abogado1' && password === '123') {
        res.json({
            message: 'Login exitoso',
            token: 'jwt-token-temporary',
            user: {
                id: 1,
                username: 'abogado1',
                email: 'abogado1@legal.com',
                nombre: 'Abogado Principal'
            }
        });
    }
    else {
        res.status(401).json({ error: 'Credenciales incorrectas' });
    }
});
exports.default = router;
