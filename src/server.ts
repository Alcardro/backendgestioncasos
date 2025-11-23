// backend/src/server.ts - PRUEBA 4 (todas las rutas)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import './database';
import authRoutes from './routes/authRoutes';
import caseRoutes from './routes/caseRoutes'; // ✅ AGREGAR case routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes); // ✅ AGREGAR case routes

app.get('/api/health', (req, res) => {
  res.json({ 
    message: '✅ PRUEBA 4: Todas las rutas agregadas - BACKEND COMPLETO',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 PRUEBA 4 ejecutándose en: http://localhost:${PORT}`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/login`);
  console.log(`📋 Cases: http://localhost:${PORT}/api/cases`);
});