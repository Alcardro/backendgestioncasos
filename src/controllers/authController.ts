// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'legal-tech-secret-key-produccion-2024';

// Datos de usuarios temporal para pruebas (eliminar cuando la BD funcione)
const temporaryUsers = [
  { 
    id: 1, 
    username: 'abogado1', 
    password: '123', 
    email: 'abogado1@legal.com', 
    nombre: 'Abogado Principal' 
  },
  { 
    id: 2, 
    username: 'abogado2', 
    password: '123', 
    email: 'abogado2@legal.com', 
    nombre: 'Abogado Secundario' 
  },
  { 
    id: 3, 
    username: 'asistente', 
    password: '123', 
    email: 'asistente@legal.com', 
    nombre: 'Asistente Legal' 
  }
];

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    console.log('🔐 Login attempt for user:', username);

    // Validar que vengan los datos
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Usuario y contraseña son requeridos' 
      });
    }

    // BUSCAR USUARIO - Primero intenta con datos temporales
    let user = temporaryUsers.find(u => u.username === username);

    // Si no encuentra en datos temporales, intenta con la base de datos
    if (!user) {
      try {
        // Esto fallará si la BD no está configurada, pero no romperá la app
        const db = require('../database');
        const users = await db.dbQuery('SELECT * FROM users WHERE username = ?', [username]);
        
        if (users.length > 0) {
          user = users[0];
        }
      } catch (dbError) {
        console.log('⚠️  Database not available, using temporary users');
      }
    }

    // Verificar si se encontró el usuario
    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario o contraseña incorrectos' 
      });
    }

    // VERIFICAR CONTRASEÑA
    let isPasswordValid = false;
    
    // Intentar con bcrypt primero (si la contraseña está hasheada)
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      // Si bcrypt falla, comparar directamente (para datos temporales)
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Usuario o contraseña incorrectos' 
      });
    }

    // CREAR TOKEN JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Preparar respuesta del usuario (sin contraseña)
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      nombre: user.nombre
    };

    console.log('✅ Login successful for user:', username);

    res.json({
      message: 'Login exitoso',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    
    // Manejo seguro del error sin problemas de tipo
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

// Controlador de verificación de token (opcional)
export const verifyToken = (req: Request, res: Response) => {
  res.json({
    valid: true,
    message: 'Token válido'
  });
};