import { ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventoService } from '../../../../service/evento.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SocketService } from '../../../../core/services/socket.service';

@Component({
  selector: 'app-proyeccion-votacion',
  imports: [CommonModule],
  templateUrl: './proyeccion-votacion.component.html',
  styleUrl: './proyeccion-votacion.component.scss'
})
export class ProyeccionVotacionComponent implements OnInit, OnDestroy {

  private _eventoService = inject(EventoService);
  private _socketService = inject(SocketService);
  private cdr = inject(ChangeDetectorRef);
  private aRouter = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private pollInterval: any = null;

  terminado: boolean = false;
  mensajeFin: string = '';

  // Contenido libre proyectado (imagen/video/mesa). Cuando está activo, tapa el tablero.
  contenidoCustom: any = null;
  videoEmbedUrl: SafeResourceUrl | null = null;

  idComision: string = '';
  idPunto: string = '';
  idReserva: string = '';
  modo: 'votacion' | 'asistencia' | 'contenido' = 'votacion';

  tituloEvento: string = '';
  fechaEvento: string = '';
  textoPunto: string = '';

  // Lista unificada: cada elemento tiene { diputado, partido, sentido }
  participantes: any[] = [];
  listaComisiones: any[] = [];
  esComision: boolean = false;

  columna1: any[] = [];
  columna2: any[] = [];
  columna3: any[] = [];

  cargando: boolean = true;

  // Factor fino que reduce texto/focos (además de la escala xl/lg/md/sm/xs) hasta que
  // la lista de diputados quepa completa sin scroll, sin importar cuántos sean ni la
  // resolución de la pantalla.
  fitScale = 1;

  @ViewChild('gridSesion') private gridSesionRef?: ElementRef<HTMLElement>;
  @ViewChild('gridComision') private gridComisionRef?: ElementRef<HTMLElement>;

  // Escala el tamaño de fuente raíz según la resolución real de la pantalla (vmin),
  // para que el tablero (dimensionado en rem) se vea proporcional en cualquier proyector/monitor.
  @HostListener('window:resize')
  ajustarEscalaPantalla(): void {
    const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;
    const fontSize = Math.min(34, Math.max(10, vmin * 1.48));
    document.documentElement.style.fontSize = `${fontSize}px`;
    this.ajustarFitScale();
  }

  /** Alto real del contenido (no acotado por el contenedor, a diferencia de
   *  scrollHeight que nunca puede ser menor que clientHeight). */
  private medirAltoContenido(el: HTMLElement): number {
    if (this.esComision) {
      const secciones = Array.from(el.querySelectorAll<HTMLElement>('.comision-seccion'));
      if (secciones.length === 0) return el.scrollHeight;
      return secciones.reduce((suma, s) => suma + s.getBoundingClientRect().height, 0);
    }
    const columnas = Array.from(el.querySelectorAll<HTMLElement>(':scope > .columna-votos'));
    if (columnas.length === 0) return el.scrollHeight;
    return Math.max(...columnas.map((c) => c.getBoundingClientRect().height));
  }

  /** Ajusta fitScale para que la lista use exactamente el espacio disponible sin
   *  scroll: reduce si no cabe, o crece si sobra espacio en blanco. */
  private ajustarFitScale(): void {
    const el = this.gridSesionRef?.nativeElement || this.gridComisionRef?.nativeElement;
    if (!el) return;

    this.fitScale = 1;
    this.cdr.detectChanges();

    const disponible = el.clientHeight;
    let intentos = 0;

    if (this.medirAltoContenido(el) > disponible + 1) {
      while (this.medirAltoContenido(el) > disponible + 1 && this.fitScale > 0.5 && intentos < 25) {
        this.fitScale = Math.max(0.5, this.fitScale - 0.04);
        this.cdr.detectChanges();
        intentos++;
      }
    } else {
      while (this.medirAltoContenido(el) <= disponible - 4 && this.fitScale < 1.6 && intentos < 25) {
        this.fitScale = Math.min(1.6, this.fitScale + 0.04);
        this.cdr.detectChanges();
        intentos++;
      }
      if (this.medirAltoContenido(el) > disponible + 1) {
        this.fitScale = Math.max(0.5, this.fitScale - 0.04);
        this.cdr.detectChanges();
      }
    }
  }

  ngOnInit(): void {
    this.ajustarEscalaPantalla();

    this.aRouter.queryParams.subscribe(params => {
      const decoded = this.decodificarParams(params['t'] || '');

      this.idComision = decoded['id'] || '';
      this.idPunto    = decoded['idPunto'] || '';
      this.idReserva  = decoded['idReserva'] || '';
      const modoDecoded = decoded['modo'];
      this.modo = modoDecoded === 'asistencia' ? 'asistencia'
                : modoDecoded === 'contenido' ? 'contenido'
                : 'votacion';

      if (this.idComision) {
        // Siempre conecta para escuchar contenido libre y eventos.
        this.conectarSocket();

        if (this.modo === 'contenido') {
          // No hay votación/asistencia: espera el contenido por socket (el servidor
          // reenvía el último proyectado al unirse a la sala).
          this.cargando = false;
        } else {
          this.cargarDatos();
          this.iniciarPolling();
        }
      }
    });
  }

  ngOnDestroy(): void {
    document.documentElement.style.fontSize = '';
    this.detenerPolling();
    this._socketService.offVotacionTerminada();
    this._socketService.offAsistenciaTerminada();
    this._socketService.offVotoRegistrado();
    this._socketService.offAsistenciaRegistrada();
    this._socketService.offVotosActualizadosMasivo();
    this._socketService.offAsistenciasActualizadasMasivo();
    this._socketService.offProyeccionIniciada();
    this._socketService.offContenidoProyectado();
    this._socketService.offContenidoLimpiado();
    this._socketService.disconnect();
  }

  private conectarSocket(): void {
    this._socketService.conectarYUnirse(this.idComision);

    this._socketService.onVotacionTerminada(() => {
      this.detenerPolling();
      this.terminado = true;
      this.cdr.detectChanges();
    });

    this._socketService.onAsistenciaTerminada(() => {
      this.detenerPolling();
      this.terminado = true;
      this.cdr.detectChanges();
    });

    // Actualización instantánea: un voto/asistencia cambió en el servidor.
    // Reemplaza tener que esperar al siguiente ciclo de polling (antes cada 3s).
    this._socketService.onVotoRegistrado((data) => {
      if (this.modo !== 'votacion') return;
      this.actualizarSentidoLocal(data.id_diputado, data.sentido_voto);
    });

    this._socketService.onAsistenciaRegistrada((data) => {
      if (this.modo !== 'asistencia') return;
      // El auto-registro del diputado siempre es sentido=1 (ASISTENCIA); el
      // admin puede mandar 0/2/3. Si no viene, asumimos 1 por compatibilidad.
      this.actualizarSentidoLocal(data.id_diputado, data.sentido ?? 1);
    });

    // Botones "marcar todos" (admin): afecta a todos a la vez, se recarga completo.
    this._socketService.onVotosActualizadosMasivo(() => {
      if (this.modo !== 'votacion') return;
      this.cargarDatos();
    });

    this._socketService.onAsistenciasActualizadasMasivo(() => {
      if (this.modo !== 'asistencia') return;
      this.cargarDatos();
    });

    this._socketService.onProyeccionIniciada((params) => {
      // Al iniciar una proyección de votación/asistencia se quita el contenido libre.
      this.contenidoCustom = null;
      this.videoEmbedUrl = null;
      this.mensajeFin = '';
      this.detenerPolling();
      this.terminado = false;
      this.idPunto   = params['idPunto']  || '';
      this.idReserva = params['idReserva'] || '';
      this.modo      = params['modo'] === 'asistencia' ? 'asistencia' : 'votacion';
      this.participantes = [];
      this.listaComisiones = [];
      this.textoPunto = '';
      this.cargando = true;
      this.cargarDatos();
      this.iniciarPolling();
      this.cdr.detectChanges();
    });

    // Contenido libre (imagen/video/mesa/idle): tapa el tablero mientras esté activo.
    this._socketService.onContenidoProyectado((contenido) => {
      this.detenerPolling();
      if (contenido?.tipo === 'idle') {
        // Estado neutro: tablero terminado / sin contenido (persiste al recargar).
        this.contenidoCustom = null;
        this.videoEmbedUrl = null;
        this.mensajeFin = contenido.mensaje || '';
        this.terminado = true;
      } else {
        this.mostrarContenidoCustom(contenido);
      }
      this.cdr.detectChanges();
    });

    this._socketService.onContenidoLimpiado(() => {
      // Compatibilidad: si llega, va a pantalla neutra (no regresa al evento anterior).
      this.detenerPolling();
      this.contenidoCustom = null;
      this.videoEmbedUrl = null;
      this.mensajeFin = '';
      this.terminado = true;
      this.cdr.detectChanges();
    });
  }

  private mostrarContenidoCustom(contenido: any): void {
    this.terminado = false;
    this.contenidoCustom = contenido;
    this.videoEmbedUrl = null;

    if (contenido?.tipo === 'video' && contenido.url) {
      const embed = this.aUrlEmbed(contenido.url);
      if (embed) {
        this.videoEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embed);
      }
    }
  }

  /** Convierte URLs de YouTube/Vimeo a su forma embebible; devuelve null si es un archivo de video directo. */
  private aUrlEmbed(url: string): string | null {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;

    const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;

    return null;
  }

  /** True si el contenido de video es un archivo directo (usa <video>) en vez de un embed. */
  get esVideoArchivo(): boolean {
    return this.contenidoCustom?.tipo === 'video' && !this.videoEmbedUrl;
  }

  private decodificarParams(token: string): Record<string, string> {
    try {
      const qs = atob(token);
      const result: Record<string, string> = {};
      new URLSearchParams(qs).forEach((value, key) => result[key] = value);
      return result;
    } catch {
      return {};
    }
  }

  private iniciarPolling(): void {
    // Respaldo por si se pierde algún evento de socket (reconexión, etc.) —
    // la actualización normal ya es instantánea vía voto-registrado/asistencia-registrada.
    this.pollInterval = setInterval(() => this.cargarDatos(), 30000);
  }

  private detenerPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private cargarDatos(): void {
    if (this.modo === 'asistencia') {
      this.cargarAsistencia();
    } else {
      this.cargarVotacion();
    }
  }

  private cargarAsistencia(): void {
    this._eventoService.getEvento(this.idComision).subscribe({
      next: (response: any) => {
        this.tituloEvento = response.titulo || '';
        this.fechaEvento = response.evento?.fecha || '';

        if (Array.isArray(response.integrantes) && response.integrantes.length > 0) {
          const primero = response.integrantes[0];

          if (primero.comision_id && primero.integrantes && Array.isArray(primero.integrantes)) {
            this.esComision = true;
            this.listaComisiones = response.integrantes.map((c: any) => ({
              id: c.comision_id,
              nombre: c.comision_nombre,
              integrantes: (c.integrantes || []).map((i: any) => ({
                ...i,
                diputado: i.alias ,
                sentido: i.sentido_voto ?? i.sentido ?? 0
              }))
            }));
            this.participantes = [];
          } else {
            this.esComision = false;
            this.participantes = response.integrantes.map((i: any) => ({
              ...i,
              diputado: i.alias,
              sentido: i.sentido_voto ?? i.sentido ?? 0
            }));
            this.distribuirColumnas(this.participantes);
          }
        } else {
          this.participantes = [];
          this.listaComisiones = [];
        }
        this.cargando = false;
        this.cdr.detectChanges();
        setTimeout(() => this.ajustarFitScale());
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error asistencia:', e);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private cargarVotacion(): void {
    if (!this.idPunto) { this.cargando = false; return; }

    // Carga el título del evento solo la primera vez
    if (!this.tituloEvento) {
      this._eventoService.getEvento(this.idComision).subscribe({
        next: (response: any) => {
          this.tituloEvento = response.titulo || '';
          this.fechaEvento = response.evento?.fecha || '';
        },
        error: () => {}
      });

      this._eventoService.getPuntos(this.idComision).subscribe({
        next: (response: any) => {
          const puntos: any[] = response.data || [];
          const p = puntos.find((x: any) => String(x.id) === String(this.idPunto));
          if (p) this.textoPunto = `${p.nopunto ? 'Punto ' + p.nopunto : 'Punto'}: ${p.punto}`;
          this.cdr.detectChanges();
        },
        error: () => {}
      });
    }

    const datos = {
      idPunto: Number(this.idPunto),
      idReserva: this.idReserva || null
    };

    this._eventoService.getIntegrantesVotosPunto(datos).subscribe({
      next: (response: any) => {
        if (Array.isArray(response.integrantes) && response.integrantes.length > 0) {
          const primero = response.integrantes[0];

          if (primero.comision_id && primero.integrantes && Array.isArray(primero.integrantes)) {
            this.esComision = true;
            this.listaComisiones = response.integrantes.map((c: any) => ({
              id: c.comision_id,
              nombre: c.comision_nombre,
              integrantes: (c.integrantes || []).map((i: any) => ({
                ...i,
                diputado: i.alias,
                sentido: i.sentido ?? 0
              }))
            }));
            this.participantes = [];
          } else {
            this.esComision = false;
            this.participantes = response.integrantes.map((i: any) => ({
              ...i,
              diputado: i.alias ,
              sentido: i.sentido ?? 0
            }));
            this.distribuirColumnas(this.participantes);
          }
        } else {
          this.participantes = [];
          this.listaComisiones = [];
        }
        this.cargando = false;
        this.cdr.detectChanges();
        setTimeout(() => this.ajustarFitScale());
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error votación:', e);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Actualiza el sentido de un participante ya cargado, sin volver a pedir la lista completa. */
  private actualizarSentidoLocal(idDiputado: string, sentido: number): void {
    let encontrado = false;

    if (this.esComision) {
      for (const comision of this.listaComisiones) {
        const integrante = comision.integrantes.find((i: any) => i.id_diputado === idDiputado);
        if (integrante) {
          integrante.sentido = sentido;
          encontrado = true;
        }
      }
    } else {
      const participante = this.participantes.find((p: any) => p.id_diputado === idDiputado);
      if (participante) {
        participante.sentido = sentido;
        encontrado = true;
        // columna1/2/3 referencian los mismos objetos (slice copia el array, no los items),
        // así que basta con mutar el de participantes — pero por si acaso, se busca también aquí.
      }
    }

    if (encontrado) this.cdr.detectChanges();
  }

  private distribuirColumnas(lista: any[]): void {
    const por = Math.ceil(lista.length / 3);
    this.columna1 = lista.slice(0, por);
    this.columna2 = lista.slice(por, por * 2);
    this.columna3 = lista.slice(por * 2);
  }

  distribuirColumnasComision(integrantes: any[]): { col1: any[], col2: any[], col3: any[] } {
    const por = Math.ceil(integrantes.length / 3);
    return {
      col1: integrantes.slice(0, por),
      col2: integrantes.slice(por, por * 2),
      col3: integrantes.slice(por * 2)
    };
  }

  getEscalaClase(): string {
    let filasEfectivas: number;

    if (this.esComision && this.listaComisiones.length > 0) {
      // Cada comisión aporta: ceil(integrantes/3) filas + 2 de overhead por encabezado
      filasEfectivas = this.listaComisiones.reduce((acc, c) => {
        return acc + Math.ceil(c.integrantes.length / 3) + 2;
      }, 0);
    } else {
      filasEfectivas = Math.ceil(this.totalParticipantes() / 3);
    }

    if (filasEfectivas <= 5)  return 'escala-xl';
    if (filasEfectivas <= 10) return 'escala-lg';
    if (filasEfectivas <= 18) return 'escala-md';
    if (filasEfectivas <= 28) return 'escala-sm';
    return 'escala-xs';
  }

  getColorSentido(sentido: number): string {
    if (this.modo === 'asistencia') {
      if (!this.esComision && (sentido === 2 || sentido === 3)) return 'presente';
      switch (sentido) {
        case 1: return 'presente';
        case 2: return 'remota';
        case 3: return 'justificada';
        default: return 'pendiente';
      }
    }
    switch (sentido) {
      case 1: return 'favor';
      case 2: return 'abstencion';
      case 3: return 'contra';
      default: return 'pendiente';
    }
  }

  contarPorTipo(tipo: number): number {
    if (this.esComision) {
      return this.listaComisiones.reduce((acc, c) => acc + c.integrantes.filter((i: any) => i.sentido === tipo).length, 0);
    }
    return this.participantes.filter(v => v.sentido === tipo).length;
  }

  contarPresentes(): number {
    if (this.esComision) {
      return this.listaComisiones.reduce((acc, c) => acc + c.integrantes.filter((i: any) => i.sentido === 1 || i.sentido === 2 || i.sentido === 3).length, 0);
    }
    return this.participantes.filter(v => v.sentido === 1 || v.sentido === 2 || v.sentido === 3).length;
  }

  totalParticipantes(): number {
    if (this.esComision) {
      return this.listaComisiones.reduce((acc, c) => acc + c.integrantes.length, 0);
    }
    return this.participantes.length;
  }

  get etiquetaHeader(): string {
    return this.modo === 'asistencia' ? 'Registro de Asistencia' : 'Registro de Votación';
  }

  /** Mensaje del estado neutro: el que envió el servidor, o uno por defecto según el modo. */
  get mensajeIdle(): string {
    if (this.mensajeFin) return this.mensajeFin;
    if (this.modo === 'asistencia') return 'Asistencia finalizada';
    if (this.modo === 'votacion') return 'Votación finalizada';
    return '';
  }

  // ── Mesa (contenido libre) ────────────────────────────────────────────────

  /** Nº de columnas de la mesa: busca entre 3 y 6 la distribución más pareja (~4 por fila). */
  getMesaColumnas(): number {
    const n = this.contenidoCustom?.integrantes?.length || 1;
    if (n <= 3) return n;

    let best = 4;
    let bestScore = -Infinity;
    for (let c = 3; c <= 6; c++) {
      const filas = Math.ceil(n / c);
      const ultimaFila = n - (filas - 1) * c;      // cuántas tarjetas quedan en la última fila
      // preferimos última fila llena y columnas cercanas a 4
      const score = ultimaFila / c - Math.abs(c - 4) * 0.15;
      if (score > bestScore) { bestScore = score; best = c; }
    }
    return best;
  }

  /** Clase de tamaño: entre más integrantes, tarjetas más pequeñas para que quepan. */
  getMesaSizeClase(): string {
    const n = this.contenidoCustom?.integrantes?.length || 0;
    if (n <= 6) return 'mesa-xl';
    if (n <= 9) return 'mesa-lg';
    if (n <= 12) return 'mesa-md';
    if (n <= 20) return 'mesa-sm';
    return 'mesa-xs';
  }

  getVotoMesaLabel(voto: string): string {
    switch (voto) {
      case 'favor': return 'A Favor';
      case 'contra': return 'En Contra';
      case 'abstencion': return 'Abstención';
      case 'presente': return 'Presente';
      default: return '';
    }
  }
}
