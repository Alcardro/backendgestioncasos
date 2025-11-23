// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import { dbQuery } from '../database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'legal-tech-secret-key';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validar que vengan los datos
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Buscar usuario en la base de datos
    const users = await dbQuery('SELECT * FROM users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const user = users[0];

    // En una app real, aquí compararíamos con bcrypt
    // Por simplicidad, comparamos directamente para la prueba
    if (password !== user.password) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Crear token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Devolver respuesta sin la contraseña
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};