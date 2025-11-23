"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
require("./database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const caseRoutes_1 = __importDefault(require("./routes/caseRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000; // ✅ Railway asigna puerto automáticamente
// CORS para producción - REEMPLAZA con tu URL de Vercel
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'https://tu-frontend.vercel.app' // ← CAMBIA por tu URL real de Vercel
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/cases', caseRoutes_1.default);
// Health check endpoint (CRÍTICO para Railway)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend deployed on Railway',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Manejar rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});
// Iniciar servidor - IMPORTANTE para Railway
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health: http://0.0.0.0:${PORT}/api/health`);
});
