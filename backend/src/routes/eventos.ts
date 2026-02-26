import { Router } from "express";
import { actualizar, getevento, geteventos, catalogos, getTiposPuntos, guardarpunto, getpuntos, actualizarPunto, eliminarpunto, saveintervencion, getintervenciones, eliminarinter, getvotacionpunto, actualizarvoto, reiniciarvoto, catalogossave, saveagenda, getAgenda, updateAgenda, enviarWhatsPunto, generarPDFVotacion, gestionIntegrantes, addDipLista, Eliminarlista, enviarWhatsVotacionPDF, generarPDFAsistencia, enviarWhatsAsistenciaPDF, crearreserva, eliminarreserva, getreservas, exportdatos, getAgendaHoy} from "../controllers/agenda";
import  upload  from "../controllers/multer";
const router = Router();


router.get("/api/eventos/geteventos/:id", geteventos );
router.get("/api/eventos/getevento/:id", getevento );
router.post("/api/eventos/actasistencia/", actualizar );
router.get("/api/eventos/catalogos/", catalogos );
router.post("/api/eventos/gettipos/", getTiposPuntos );
router.post("/api/eventos/savepunto/:id",upload.single("documento"), guardarpunto );
router.get("/api/eventos/getpuntos/:id", getpuntos );
router.post("/api/eventos/savereserva/", crearreserva );
router.get("/api/eventos/eliminarreserva/:id",eliminarreserva );
router.get("/api/eventos/getreservas/:id",getreservas );
router.post("/api/eventos/actualizarPunto/:id",upload.single("documento"), actualizarPunto );
router.get("/api/eventos/eliminarpunto/:id/:sesion",eliminarpunto );
router.post("/api/eventos/saveintervencion/", saveintervencion );
router.post("/api/eventos/getintervenciones/", getintervenciones );
router.post("/api/eventos/eliminarinter/:id",eliminarinter );
router.post("/api/eventos/getvotospunto/", getvotacionpunto );
router.post("/api/eventos/actvoto/", actualizarvoto );
router.post("/api/eventos/reiniciavoto/", reiniciarvoto );
router.get("/api/eventos/catalogossave/", catalogossave );
router.post("/api/eventos/saveagenda/", saveagenda );
router.get("/api/eventos/getagenda/:id", getAgenda );
router.post("/api/eventos/editagenda/:id", updateAgenda );
router.post("/api/eventos/notificarpunto/:id", enviarWhatsPunto );
router.get("/api/eventos/votacionpunto/:id", generarPDFVotacion );
router.get("/api/eventos/gestionintegrantes/:id", gestionIntegrantes );
router.post("/api/eventos/agregardipasistencia/", addDipLista );
router.get("/api/eventos/deleteintlista/:id", Eliminarlista );
router.post("/api/eventos/enviarvotacionpunto", enviarWhatsVotacionPDF );
router.get('/api/eventos/asintenciapdf/:id', generarPDFAsistencia);
router.get('/api/eventos/notasintenciapdf/:id', enviarWhatsAsistenciaPDF);
router.get("/api/eventos/exportevento", exportdatos );
router.get("/api/eventos/getagendaHoy/:fecha", getAgendaHoy );

export default router