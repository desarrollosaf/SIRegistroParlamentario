import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors'
import path from 'path';
import eventos from "../routes/eventos";
import reportes from "../routes/reporte";
import estadistico from "../routes/estadistico";
import user from "../routes/user";
import catalogos from "../routes/catalogos";
import diputados from "../routes/diputados";
import iniciativas from "../routes/iniciativas";
import diputadoRoutes from "../routes/diputado";
import { verifyToken } from '../middlewares/auth';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Comision from './comisions';
import AnfitrionAgenda from './anfitrion_agendas';
import Agenda from './agendas';
import Sedes from './sedes';

class Server {

    private app: Application
    private port: string

    private httpServer: http.Server;
    private io: SocketIOServer;

    private asistenciasAbiertas: Map<string, { idAgenda: string; safId?: string; idComisiones: string[] }> = new Map();
    private votacionesAbiertas: Map<string, { idAgenda: string; punto: any; idPunto?: any; idReserva?: string | null; idIniciativa?: string | null; safId?: string; idComisiones: string[] }> = new Map();

    // Mapa SAF-ID → UUID de registrocomisiones para comisiones
    private safIdToUUID: Map<string, string> = new Map();

    // Sesiones activas: clave = idAgenda para comisiones, 'sesion-plenaria' para sesión
    private sesionesActivas: Map<string, {
        idAgenda: string;
        titulo: string;
        fecha: string;
        esComision: boolean;
        idComision?: string;
        idComisiones: string[];   // todos los UUIDs (incluye conjuntas)
        ordenDia: any[];
        iniciadaEn: string;
    }> = new Map();

    constructor(){
        this.app = express()
        this.port = process.env.PORT || '3013'
        this.httpServer = http.createServer(this.app);
        this.io = new SocketIOServer(this.httpServer, {
        cors: {
            origin: [
                'https://parlamentario.congresoedomex.gob.mx',
                'https://parlamentario2.congresoedomex.gob.mx',
                'https://nuevapagina.congresoedomex.gob.mx',
                'http://localhost:4200',
                'http://localhost:8100',
                'http://localhost',
                'https://localhost',
                'capacitor://localhost',
                'ionic://localhost',
            ],
            credentials: true
        }
        });

        this.setupSocket();

        this.midlewares();
        this.router();
        this.DBconnetc();
        this.listen();
    }

    /** Resuelve el SAF commission ID a uno o varios UUIDs de registrocomisiones.
     *  Primero intenta el caché, luego consulta AnfitrionAgenda por idAgenda. */
    private async resolveUUIDs(idComisionSAF: string, idAgenda: string): Promise<string[]> {
        const cached = this.safIdToUUID.get(idComisionSAF);
        if (cached) return [cached];
        try {
            const anfitriones = await AnfitrionAgenda.findAll({
                where: { agenda_id: idAgenda },
                attributes: ['autor_id'],
                raw: true,
            }) as any[];
            const uuids = anfitriones.map((a: any) => a.autor_id as string).filter(Boolean);
            if (uuids.length > 0) {
                this.safIdToUUID.set(idComisionSAF, uuids[0]);
                return uuids;
            }
        } catch {}
        return [idComisionSAF];
    }

    /** Busca en un mapa todos los UUIDs cuyo safId coincide con el SAF commission ID. */
    private findUUIDsBySafId(safId: string, map: Map<string, { safId?: string }>): string[] {
        const uuids: string[] = [];
        for (const [uuid, info] of map.entries()) {
            if (info.safId === safId || uuid === safId) {
                uuids.push(uuid);
            }
        }
        // Fallback: caché
        const cached = this.safIdToUUID.get(safId);
        if (cached && !uuids.includes(cached)) uuids.push(cached);
        if (uuids.length === 0) uuids.push(safId);
        return uuids;
    }

    private setupSocket() {
        this.io.on('connection', (socket) => {
        console.log('Socket conectado:', socket.id);

        socket.on('unirse-sesion', (idComision: string) => {
            socket.join(`proyeccion-${idComision}`);
        });

        socket.on('terminar-votacion', (data: { idComision: string }) => {
            this.io.to(`proyeccion-${data.idComision}`).emit('votacion-terminada');
        });

        socket.on('terminar-asistencia', (data: { idComision: string }) => {
            this.io.to(`proyeccion-${data.idComision}`).emit('asistencia-terminada');
        });

        socket.on('iniciar-proyeccion', (data: { idComision: string, params: any }) => {
            this.io.to(`proyeccion-${data.idComision}`).emit('proyeccion-iniciada', data.params);
        });

        // El diputado se une a la sala general y a su sala personal
        socket.on('unirse-diputado', (data?: { integranteId?: string }) => {
            socket.join('sala-diputados');
            if (data?.integranteId) {
                socket.join(`diputado-${data.integranteId}`);
            }
        });

        // Eventos para el panel del diputado
        socket.on('abrir-asistencia', async (data: { idComision: string, idAgenda: string }) => {
            // Obtener UUIDs desde la sesión activa (fuente más confiable)
            const sesion = this.sesionesActivas.get(data.idAgenda);
            const uuids = sesion?.idComisiones?.length
                ? sesion.idComisiones
                : await this.resolveUUIDs(data.idComision, data.idAgenda);

            for (const uuid of uuids) {
                this.asistenciasAbiertas.set(uuid, { idAgenda: data.idAgenda, safId: data.idComision, idComisiones: uuids });
            }
            this.io.to(`proyeccion-${data.idComision}`).emit('asistencia-abierta', { idAgenda: data.idAgenda });
            for (const uuid of uuids) {
                this.io.to('sala-diputados').emit('asistencia-abierta', { idAgenda: data.idAgenda, idComision: uuid });
            }
        });

        socket.on('cerrar-asistencia', (data: { idComision: string }) => {
            const uuids = this.findUUIDsBySafId(data.idComision, this.asistenciasAbiertas);
            for (const uuid of uuids) {
                this.asistenciasAbiertas.delete(uuid);
            }
            this.io.to(`proyeccion-${data.idComision}`).emit('asistencia-cerrada');
            for (const uuid of uuids) {
                this.io.to('sala-diputados').emit('asistencia-cerrada', { idComision: uuid });
            }
        });

        socket.on('abrir-votacion', async (data: { idComision: string, idAgenda: string, punto: any, idPunto?: any, idReserva?: string | null, idIniciativa?: string | null }) => {
            // Obtener UUIDs desde la sesión activa (fuente más confiable)
            const sesion = this.sesionesActivas.get(data.idAgenda);
            const uuids = sesion?.idComisiones?.length
                ? sesion.idComisiones
                : await this.resolveUUIDs(data.idComision, data.idAgenda);

            for (const uuid of uuids) {
                this.votacionesAbiertas.set(uuid, {
                    idAgenda: data.idAgenda,
                    punto: data.punto,
                    idPunto: data.idPunto ?? null,
                    idReserva: data.idReserva ?? null,
                    idIniciativa: data.idIniciativa ?? null,
                    safId: data.idComision,
                    idComisiones: uuids,
                });
            }
            this.io.to(`proyeccion-${data.idComision}`).emit('votacion-abierta', { idAgenda: data.idAgenda, punto: data.punto });
            for (const uuid of uuids) {
                this.io.to('sala-diputados').emit('votacion-abierta', { idAgenda: data.idAgenda, punto: data.punto, idComision: uuid, idPunto: data.idPunto, idReserva: data.idReserva, idIniciativa: data.idIniciativa });
            }
        });

        socket.on('cerrar-votacion', (data: { idComision: string }) => {
            const uuids = this.findUUIDsBySafId(data.idComision, this.votacionesAbiertas);
            for (const uuid of uuids) {
                this.votacionesAbiertas.delete(uuid);
            }
            this.io.to(`proyeccion-${data.idComision}`).emit('votacion-cerrada');
            for (const uuid of uuids) {
                this.io.to('sala-diputados').emit('votacion-cerrada', { idComision: uuid });
            }
        });

        // ── Sesiones activas ────────────────────────────────────────────
        socket.on('iniciar-sesion', async (data: {
            idAgenda: string;
            titulo: string;
            fecha: string;
            esComision: boolean;
            idComision?: string;
            ordenDia: any[];
        }) => {
            const clave = data.esComision ? data.idAgenda : 'sesion-plenaria';

            // Para sesión plenaria solo puede haber una activa
            if (!data.esComision && this.sesionesActivas.has('sesion-plenaria')) {
                socket.emit('sesion-rechazada', {
                    motivo: 'Ya existe una sesión plenaria activa',
                    sesionActiva: this.sesionesActivas.get('sesion-plenaria')
                });
                return;
            }

            let idComisionUUID: string | undefined = undefined;
            const idComisiones: string[] = [];

            // autor_id en anfitrion_agendas ya es el UUID de la comisión en registrocomisiones
            if (data.esComision && data.idAgenda) {
                try {
                    const anfitriones = await AnfitrionAgenda.findAll({
                        where: { agenda_id: data.idAgenda },
                        attributes: ['autor_id'],
                        raw: true,
                    }) as any[];
                    for (const a of anfitriones) {
                        if (a.autor_id && !idComisiones.includes(a.autor_id)) {
                            idComisiones.push(a.autor_id);
                        }
                    }
                    if (idComisiones.length > 0) {
                        idComisionUUID = idComisiones[0];
                        // Poblar cache SAF→UUID para que cerrar-* pueda resolverlo
                        if (data.idComision) this.safIdToUUID.set(data.idComision, idComisiones[0]);
                    }
                } catch {}
            }

            // Fallback: si no hubo anfitriones, intentar resolver por nombre
            if (idComisiones.length === 0 && data.esComision && data.titulo) {
                try {
                    const com = await Comision.findOne({ where: { nombre: data.titulo } }) as any;
                    if (com?.id) {
                        idComisionUUID = com.id;
                        if (data.idComision) this.safIdToUUID.set(data.idComision, com.id);
                        idComisiones.push(com.id);
                    }
                } catch {}
            }

            let sedeNombre: string | null = null;
            if (data.idAgenda) {
                try {
                    const agenda = await Agenda.findByPk(data.idAgenda, {
                        include: [{ model: Sedes, as: 'sede', attributes: ['sede'] }],
                        attributes: ['id'],
                    }) as any;
                    sedeNombre = agenda?.sede?.sede ?? null;
                } catch {}
            }

            const sesion = {
                idAgenda: data.idAgenda,
                titulo: data.titulo,
                fecha: data.fecha,
                esComision: data.esComision,
                idComision: idComisionUUID,
                idComisiones,
                ordenDia: data.ordenDia,
                sede: sedeNombre,
                iniciadaEn: new Date().toISOString()
            };

            this.sesionesActivas.set(clave, sesion);

            // Notifica a todos los diputados conectados
            this.io.to('sala-diputados').emit('sesion-iniciada', { clave, ...sesion });
            // Notifica a la sala de proyección si aplica
            this.io.to(`proyeccion-${data.idAgenda}`).emit('sesion-iniciada', { clave, ...sesion });

            // Confirma al que inició
            socket.emit('sesion-confirmada', { clave, ...sesion });
        });

        socket.on('terminar-sesion', async (data: { idAgenda: string; esComision: boolean }) => {
            const clave = data.esComision ? data.idAgenda : 'sesion-plenaria';
            const sesionPrevia = this.sesionesActivas.get(clave);
            this.sesionesActivas.delete(clave);

            let idComisiones: string[] = sesionPrevia?.idComisiones ?? [];

            // Si no hay UUIDs guardados (sesión iniciada con código viejo), consultar directo
            if (idComisiones.length === 0 && data.esComision && data.idAgenda) {
                try {
                    const anfitriones = await AnfitrionAgenda.findAll({
                        where: { agenda_id: data.idAgenda },
                        attributes: ['autor_id'],
                        raw: true,
                    }) as any[];
                    idComisiones = anfitriones.map((a: any) => a.autor_id as string).filter(Boolean);
                } catch {}
            }

            const payload = {
                clave,
                idAgenda: data.idAgenda,
                esComision: data.esComision,
                idComision: sesionPrevia?.idComision ?? idComisiones[0] ?? undefined,
                idComisiones,
            };
            this.io.to('sala-diputados').emit('sesion-terminada', payload);
            this.io.to(`proyeccion-${data.idAgenda}`).emit('sesion-terminada', payload);
        });

        // Un cliente recién conectado pregunta qué sesiones están activas
        socket.on('get-sesiones-activas', async () => {
            const entries = Array.from(this.sesionesActivas.entries());
            const lista = await Promise.all(entries.map(async ([clave, s]) => {
                let sede: string | null = null;
                if (s.idAgenda) {
                    try {
                        const agenda = await Agenda.findByPk(s.idAgenda, {
                            include: [{ model: Sedes, as: 'sede', attributes: ['sede'] }],
                            attributes: ['id'],
                        }) as any;
                        sede = agenda?.sede?.sede ?? null;
                    } catch {}
                }
                return { clave, ...s, sede };
            }));
            socket.emit('sesiones-activas', lista);
        });

        // Consulta el estado actual de asistencias y votaciones abiertas
        socket.on('get-estado-eventos', () => {
            const asistencias = Array.from(this.asistenciasAbiertas.entries()).map(([idComision, data]) => ({ idComision, ...data }));
            const votaciones = Array.from(this.votacionesAbiertas.entries()).map(([idComision, data]) => ({ idComision, ...data }));
            socket.emit('estado-eventos', { asistencias, votaciones });
        });

        socket.on('disconnect', () => {
            console.log('Socket desconectado:', socket.id);
        });
        });
        this.app.set('io', this.io);
        this.app.set('asistenciasAbiertas', this.asistenciasAbiertas);
        this.app.set('votacionesAbiertas', this.votacionesAbiertas);
        this.app.set('sesionesActivas', this.sesionesActivas);
    }

    listen(){
        this.httpServer.listen(this.port, () => {
            console.log("La aplicación se esta corriendo exitosamente en el puerto => "+ this.port)
        })
    }

    router(){
       this.app.use(eventos);
       this.app.use(user);
       this.app.use(diputados);
       this.app.use(catalogos);
       this.app.use(reportes);
       this.app.use(iniciativas);
       this.app.use(estadistico);
       this.app.use(diputadoRoutes);
    }

    
    midlewares(){
       this.app.use(express.json())
       this.app.use(cors({
           origin: function (origin, callback) {
                const allowedOrigins = [
                    'https://parlamentario.congresoedomex.gob.mx',
                    'https://parlamentario2.congresoedomex.gob.mx',
                    'https://nuevapagina.congresoedomex.gob.mx',
                    'https://congresoedomex.gob.mx',
                    'https://www.congresoedomex.gob.mx',
                    'capacitor://localhost',
                    'ionic://localhost',
                    'https://localhost',
                ];
                const isLocalhost = !origin || /^https?:\/\/localhost(:\d+)?$/.test(origin);
                if (isLocalhost || allowedOrigins.includes(origin ?? '')) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true
        }));

        this.app.use(cookieParser());
        this.app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

        this.app.use((req: Request, res: Response, next: NextFunction) => {
            const publicPaths = [
                '/api/user/login',
                '/api/eventos/gettipos/',
                '/api/diputados/cargo/',
                '/api/eventos/savereserva/',
                '/api/eventos/eliminarreserva/',
                '/api/diputados/getinfiniciativa/',
                '/api/eventos/asintenciapdf/',
                '/api/diputados/getinfiniciativa/',
                '/api/eventos/votacionpunto/',
                '/api/reporte/iniciativas/general/',
                '/api/reporte/iniciativas/en-estudio/',
                '/api/reporte/iniciativas/aprobadas/',
                '/api/reporte/iniciativas/grupo-diputado/',
                '/api/reporte/iniciativas/totales-periodo/',
                '/api/reporte/iniciativas/integrantes/',
                '/api/reporte/iniciativas/estadisticas/',
                '/api/iniciativas/iniciativas/',
                '/api/estadistico/iniciativas/resumen',
                '/api/estadistico/diputado/iniciativas',
                '/api/estadistico/comision/iniciativas',
                '/api/estadistico/getvotospunto/',
                '/api/estadistico/geteventos/',
                '/api/estadistico/getasistencia/',
                '/api/estadistico/ultimasesion/',
                '/api/estadistico/getordendia',
                '/api/estadistico/pdfordendia/',
                '/api/estadistico/comision/eventos/',
                '/api/eventos/getevento/',
                '/api/eventos/getpuntos/',
                '/api/eventos/getvotospunto/',
                '/api/estadistico/getordenes',
                '/api/diputado/crear-cuentas',
            ];

            const isPublic = publicPaths.some(path => req.originalUrl.startsWith(path)) ;

            if (isPublic) {
                return next();
            }

            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');

           return verifyToken(req, res, next);
        });

    }

    async DBconnetc(){
        try {
            
            console.log("Conexion de DB exitoso");

        } catch (error) {
            console.log("Conexion de DB errorena => "+error);
            
        }
    }

    
}


export default Server