"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
//import './database';
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const caseRoutes_1 = __importDefault(require("./routes/caseRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Validación robusta del puerto
const getPort = () => {
    const envPort = process.env.PORT;
    if (envPort) {
        const port = parseInt(envPort, 10);
        if (!isNaN(port) && port > 0 && port < 65536) {
            return port;
        }
    }
    return 3000; // Puerto por defecto
};
const PORT = getPort();
// CORS para producción - REEMPLAZA con tu URL real de Vercel
const allowedOrigins = [
    'http://localhost:3000',
    'https://tu-frontend.vercel.app' // ← CAMBIA por tu URL real
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permitir requests sin origin (como mobile apps o curl)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/cases', caseRoutes_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend deployed on Railway',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: PORT
    });
});
// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({
        message: 'Legal Tech API',
        version: '1.0.0',
        status: 'running'
    });
});
// Manejar rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});
// Manejo de errores global
app.use((error, req, res, next) => {
    console.error('❌ Global error handler:', error);
    res.status(500).json({
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
});
// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health: http://0.0.0.0:${PORT}/api/health`);
    console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
});
