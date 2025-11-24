// backend/src/routes/authRoutes.ts - VERSIÓN CORREGIDA
import { Router } from 'express';
import { login } from '../controllers/authController';

const router = Router();

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
  } else {
    res.status(401).json({ error: 'Credenciales incorrectas' });
  }
});

export default router;