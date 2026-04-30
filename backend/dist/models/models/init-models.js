"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movimientos_diputados = exports.model_has_roles = exports.model_has_permissions = exports.migrations = exports.mensajes_votos = exports.marco_juridicos = exports.marco_j_s = exports.licencias_diputados = exports.leyes_informes = exports.legislaturas = exports.intervenciones = exports.integrante_legislaturas = exports.integrante_comisions = exports.iniciativas = exports.informes = exports.generos = exports.gacetas = exports.fotos = exports.failed_jobs = exports.evento_votos = exports.estatus_diputados = exports.documentos = exports.documento_turnos = exports.documento_firmas = exports.distritos = exports.diputadas = exports.dialogos = exports.descripcione_comunicados = exports.dependencia_documentos = exports.decreto_iniciativas = exports.decisions = exports.debates = exports.datos_users = exports.comunicados_sesions = exports.comunicados = exports.comisions = exports.comisiones = exports.comision_usuarios = exports.certificados = exports.banners = exports.avisos_terminos = exports.autores_comunicados = exports.autor_iniciativas = exports.asuntos_orden_dias = exports.asistencia_votos = exports.anio_sesions = exports.anfitrion_agendas = exports.agendas = exports.admin_cats = exports.acta_sesions = void 0;
exports.validacions = exports.usuarios = exports.users = exports.turnos = exports.turno_comisions = exports.tomo_debates = exports.tipo_sesions = exports.tipo_presentas = exports.tipo_ordens = exports.tipo_intervencions = exports.tipo_flujos = exports.tipo_eventos = exports.tipo_doc_marcos = exports.tipo_comisions = exports.tipo_categoria_iniciativas = exports.tipo_cargo_comisions = exports.tipo_autors = exports.tipo_asambleas = exports.temas_votos = exports.solicitud_firmas = exports.sesiones = exports.sesion_agendas = exports.sedes = exports.roles = exports.role_has_permissions = exports.regimen_sesions = exports.puntos_ordens = exports.proponentes = exports.presentan_puntos = exports.presenta_puntos = exports.personal_access_tokens = exports.permissions = exports.periodo_sesions = exports.password_resets = exports.partidos = exports.otros_autores = exports.orden_dias = exports.oauth_refresh_tokens = exports.oauth_personal_access_clients = exports.oauth_clients = exports.oauth_auth_codes = exports.oauth_access_tokens = exports.nivel_autors = exports.municipios = void 0;
exports.initModels = initModels;
const acta_sesions_1 = require("./acta_sesions");
Object.defineProperty(exports, "acta_sesions", { enumerable: true, get: function () { return acta_sesions_1.acta_sesions; } });
const admin_cats_1 = require("./admin_cats");
Object.defineProperty(exports, "admin_cats", { enumerable: true, get: function () { return admin_cats_1.admin_cats; } });
const agendas_1 = require("./agendas");
Object.defineProperty(exports, "agendas", { enumerable: true, get: function () { return agendas_1.agendas; } });
const anfitrion_agendas_1 = require("./anfitrion_agendas");
Object.defineProperty(exports, "anfitrion_agendas", { enumerable: true, get: function () { return anfitrion_agendas_1.anfitrion_agendas; } });
const anio_sesions_1 = require("./anio_sesions");
Object.defineProperty(exports, "anio_sesions", { enumerable: true, get: function () { return anio_sesions_1.anio_sesions; } });
const asistencia_votos_1 = require("./asistencia_votos");
Object.defineProperty(exports, "asistencia_votos", { enumerable: true, get: function () { return asistencia_votos_1.asistencia_votos; } });
const asuntos_orden_dias_1 = require("./asuntos_orden_dias");
Object.defineProperty(exports, "asuntos_orden_dias", { enumerable: true, get: function () { return asuntos_orden_dias_1.asuntos_orden_dias; } });
const autor_iniciativas_1 = require("./autor_iniciativas");
Object.defineProperty(exports, "autor_iniciativas", { enumerable: true, get: function () { return autor_iniciativas_1.autor_iniciativas; } });
const autores_comunicados_1 = require("./autores_comunicados");
Object.defineProperty(exports, "autores_comunicados", { enumerable: true, get: function () { return autores_comunicados_1.autores_comunicados; } });
const avisos_terminos_1 = require("./avisos_terminos");
Object.defineProperty(exports, "avisos_terminos", { enumerable: true, get: function () { return avisos_terminos_1.avisos_terminos; } });
const banners_1 = require("./banners");
Object.defineProperty(exports, "banners", { enumerable: true, get: function () { return banners_1.banners; } });
const certificados_1 = require("./certificados");
Object.defineProperty(exports, "certificados", { enumerable: true, get: function () { return certificados_1.certificados; } });
const comision_usuarios_1 = require("./comision_usuarios");
Object.defineProperty(exports, "comision_usuarios", { enumerable: true, get: function () { return comision_usuarios_1.comision_usuarios; } });
const comisiones_1 = require("./comisiones");
Object.defineProperty(exports, "comisiones", { enumerable: true, get: function () { return comisiones_1.comisiones; } });
const comisions_1 = require("./comisions");
Object.defineProperty(exports, "comisions", { enumerable: true, get: function () { return comisions_1.comisions; } });
const comunicados_1 = require("./comunicados");
Object.defineProperty(exports, "comunicados", { enumerable: true, get: function () { return comunicados_1.comunicados; } });
const comunicados_sesions_1 = require("./comunicados_sesions");
Object.defineProperty(exports, "comunicados_sesions", { enumerable: true, get: function () { return comunicados_sesions_1.comunicados_sesions; } });
const datos_users_1 = require("./datos_users");
Object.defineProperty(exports, "datos_users", { enumerable: true, get: function () { return datos_users_1.datos_users; } });
const debates_1 = require("./debates");
Object.defineProperty(exports, "debates", { enumerable: true, get: function () { return debates_1.debates; } });
const decisions_1 = require("./decisions");
Object.defineProperty(exports, "decisions", { enumerable: true, get: function () { return decisions_1.decisions; } });
const decreto_iniciativas_1 = require("./decreto_iniciativas");
Object.defineProperty(exports, "decreto_iniciativas", { enumerable: true, get: function () { return decreto_iniciativas_1.decreto_iniciativas; } });
const dependencia_documentos_1 = require("./dependencia_documentos");
Object.defineProperty(exports, "dependencia_documentos", { enumerable: true, get: function () { return dependencia_documentos_1.dependencia_documentos; } });
const descripcione_comunicados_1 = require("./descripcione_comunicados");
Object.defineProperty(exports, "descripcione_comunicados", { enumerable: true, get: function () { return descripcione_comunicados_1.descripcione_comunicados; } });
const dialogos_1 = require("./dialogos");
Object.defineProperty(exports, "dialogos", { enumerable: true, get: function () { return dialogos_1.dialogos; } });
const diputadas_1 = require("./diputadas");
Object.defineProperty(exports, "diputadas", { enumerable: true, get: function () { return diputadas_1.diputadas; } });
const distritos_1 = require("./distritos");
Object.defineProperty(exports, "distritos", { enumerable: true, get: function () { return distritos_1.distritos; } });
const documento_firmas_1 = require("./documento_firmas");
Object.defineProperty(exports, "documento_firmas", { enumerable: true, get: function () { return documento_firmas_1.documento_firmas; } });
const documento_turnos_1 = require("./documento_turnos");
Object.defineProperty(exports, "documento_turnos", { enumerable: true, get: function () { return documento_turnos_1.documento_turnos; } });
const documentos_1 = require("./documentos");
Object.defineProperty(exports, "documentos", { enumerable: true, get: function () { return documentos_1.documentos; } });
const estatus_diputados_1 = require("./estatus_diputados");
Object.defineProperty(exports, "estatus_diputados", { enumerable: true, get: function () { return estatus_diputados_1.estatus_diputados; } });
const evento_votos_1 = require("./evento_votos");
Object.defineProperty(exports, "evento_votos", { enumerable: true, get: function () { return evento_votos_1.evento_votos; } });
const failed_jobs_1 = require("./failed_jobs");
Object.defineProperty(exports, "failed_jobs", { enumerable: true, get: function () { return failed_jobs_1.failed_jobs; } });
const fotos_1 = require("./fotos");
Object.defineProperty(exports, "fotos", { enumerable: true, get: function () { return fotos_1.fotos; } });
const gacetas_1 = require("./gacetas");
Object.defineProperty(exports, "gacetas", { enumerable: true, get: function () { return gacetas_1.gacetas; } });
const generos_1 = require("./generos");
Object.defineProperty(exports, "generos", { enumerable: true, get: function () { return generos_1.generos; } });
const informes_1 = require("./informes");
Object.defineProperty(exports, "informes", { enumerable: true, get: function () { return informes_1.informes; } });
const iniciativas_1 = require("./iniciativas");
Object.defineProperty(exports, "iniciativas", { enumerable: true, get: function () { return iniciativas_1.iniciativas; } });
const integrante_comisions_1 = require("./integrante_comisions");
Object.defineProperty(exports, "integrante_comisions", { enumerable: true, get: function () { return integrante_comisions_1.integrante_comisions; } });
const integrante_legislaturas_1 = require("./integrante_legislaturas");
Object.defineProperty(exports, "integrante_legislaturas", { enumerable: true, get: function () { return integrante_legislaturas_1.integrante_legislaturas; } });
const intervenciones_1 = require("./intervenciones");
Object.defineProperty(exports, "intervenciones", { enumerable: true, get: function () { return intervenciones_1.intervenciones; } });
const legislaturas_1 = require("./legislaturas");
Object.defineProperty(exports, "legislaturas", { enumerable: true, get: function () { return legislaturas_1.legislaturas; } });
const leyes_informes_1 = require("./leyes_informes");
Object.defineProperty(exports, "leyes_informes", { enumerable: true, get: function () { return leyes_informes_1.leyes_informes; } });
const licencias_diputados_1 = require("./licencias_diputados");
Object.defineProperty(exports, "licencias_diputados", { enumerable: true, get: function () { return licencias_diputados_1.licencias_diputados; } });
const marco_j_s_1 = require("./marco_j_s");
Object.defineProperty(exports, "marco_j_s", { enumerable: true, get: function () { return marco_j_s_1.marco_j_s; } });
const marco_juridicos_1 = require("./marco_juridicos");
Object.defineProperty(exports, "marco_juridicos", { enumerable: true, get: function () { return marco_juridicos_1.marco_juridicos; } });
const mensajes_votos_1 = require("./mensajes_votos");
Object.defineProperty(exports, "mensajes_votos", { enumerable: true, get: function () { return mensajes_votos_1.mensajes_votos; } });
const migrations_1 = require("./migrations");
Object.defineProperty(exports, "migrations", { enumerable: true, get: function () { return migrations_1.migrations; } });
const model_has_permissions_1 = require("./model_has_permissions");
Object.defineProperty(exports, "model_has_permissions", { enumerable: true, get: function () { return model_has_permissions_1.model_has_permissions; } });
const model_has_roles_1 = require("./model_has_roles");
Object.defineProperty(exports, "model_has_roles", { enumerable: true, get: function () { return model_has_roles_1.model_has_roles; } });
const movimientos_diputados_1 = require("./movimientos_diputados");
Object.defineProperty(exports, "movimientos_diputados", { enumerable: true, get: function () { return movimientos_diputados_1.movimientos_diputados; } });
const municipios_1 = require("./municipios");
Object.defineProperty(exports, "municipios", { enumerable: true, get: function () { return municipios_1.municipios; } });
const nivel_autors_1 = require("./nivel_autors");
Object.defineProperty(exports, "nivel_autors", { enumerable: true, get: function () { return nivel_autors_1.nivel_autors; } });
const oauth_access_tokens_1 = require("./oauth_access_tokens");
Object.defineProperty(exports, "oauth_access_tokens", { enumerable: true, get: function () { return oauth_access_tokens_1.oauth_access_tokens; } });
const oauth_auth_codes_1 = require("./oauth_auth_codes");
Object.defineProperty(exports, "oauth_auth_codes", { enumerable: true, get: function () { return oauth_auth_codes_1.oauth_auth_codes; } });
const oauth_clients_1 = require("./oauth_clients");
Object.defineProperty(exports, "oauth_clients", { enumerable: true, get: function () { return oauth_clients_1.oauth_clients; } });
const oauth_personal_access_clients_1 = require("./oauth_personal_access_clients");
Object.defineProperty(exports, "oauth_personal_access_clients", { enumerable: true, get: function () { return oauth_personal_access_clients_1.oauth_personal_access_clients; } });
const oauth_refresh_tokens_1 = require("./oauth_refresh_tokens");
Object.defineProperty(exports, "oauth_refresh_tokens", { enumerable: true, get: function () { return oauth_refresh_tokens_1.oauth_refresh_tokens; } });
const orden_dias_1 = require("./orden_dias");
Object.defineProperty(exports, "orden_dias", { enumerable: true, get: function () { return orden_dias_1.orden_dias; } });
const otros_autores_1 = require("./otros_autores");
Object.defineProperty(exports, "otros_autores", { enumerable: true, get: function () { return otros_autores_1.otros_autores; } });
const partidos_1 = require("./partidos");
Object.defineProperty(exports, "partidos", { enumerable: true, get: function () { return partidos_1.partidos; } });
const password_resets_1 = require("./password_resets");
Object.defineProperty(exports, "password_resets", { enumerable: true, get: function () { return password_resets_1.password_resets; } });
const periodo_sesions_1 = require("./periodo_sesions");
Object.defineProperty(exports, "periodo_sesions", { enumerable: true, get: function () { return periodo_sesions_1.periodo_sesions; } });
const permissions_1 = require("./permissions");
Object.defineProperty(exports, "permissions", { enumerable: true, get: function () { return permissions_1.permissions; } });
const personal_access_tokens_1 = require("./personal_access_tokens");
Object.defineProperty(exports, "personal_access_tokens", { enumerable: true, get: function () { return personal_access_tokens_1.personal_access_tokens; } });
const presenta_puntos_1 = require("./presenta_puntos");
Object.defineProperty(exports, "presenta_puntos", { enumerable: true, get: function () { return presenta_puntos_1.presenta_puntos; } });
const presentan_puntos_1 = require("./presentan_puntos");
Object.defineProperty(exports, "presentan_puntos", { enumerable: true, get: function () { return presentan_puntos_1.presentan_puntos; } });
const proponentes_1 = require("./proponentes");
Object.defineProperty(exports, "proponentes", { enumerable: true, get: function () { return proponentes_1.proponentes; } });
const puntos_ordens_1 = require("./puntos_ordens");
Object.defineProperty(exports, "puntos_ordens", { enumerable: true, get: function () { return puntos_ordens_1.puntos_ordens; } });
const regimen_sesions_1 = require("./regimen_sesions");
Object.defineProperty(exports, "regimen_sesions", { enumerable: true, get: function () { return regimen_sesions_1.regimen_sesions; } });
const role_has_permissions_1 = require("./role_has_permissions");
Object.defineProperty(exports, "role_has_permissions", { enumerable: true, get: function () { return role_has_permissions_1.role_has_permissions; } });
const roles_1 = require("./roles");
Object.defineProperty(exports, "roles", { enumerable: true, get: function () { return roles_1.roles; } });
const sedes_1 = require("./sedes");
Object.defineProperty(exports, "sedes", { enumerable: true, get: function () { return sedes_1.sedes; } });
const sesion_agendas_1 = require("./sesion_agendas");
Object.defineProperty(exports, "sesion_agendas", { enumerable: true, get: function () { return sesion_agendas_1.sesion_agendas; } });
const sesiones_1 = require("./sesiones");
Object.defineProperty(exports, "sesiones", { enumerable: true, get: function () { return sesiones_1.sesiones; } });
const solicitud_firmas_1 = require("./solicitud_firmas");
Object.defineProperty(exports, "solicitud_firmas", { enumerable: true, get: function () { return solicitud_firmas_1.solicitud_firmas; } });
const temas_votos_1 = require("./temas_votos");
Object.defineProperty(exports, "temas_votos", { enumerable: true, get: function () { return temas_votos_1.temas_votos; } });
const tipo_asambleas_1 = require("./tipo_asambleas");
Object.defineProperty(exports, "tipo_asambleas", { enumerable: true, get: function () { return tipo_asambleas_1.tipo_asambleas; } });
const tipo_autors_1 = require("./tipo_autors");
Object.defineProperty(exports, "tipo_autors", { enumerable: true, get: function () { return tipo_autors_1.tipo_autors; } });
const tipo_cargo_comisions_1 = require("./tipo_cargo_comisions");
Object.defineProperty(exports, "tipo_cargo_comisions", { enumerable: true, get: function () { return tipo_cargo_comisions_1.tipo_cargo_comisions; } });
const tipo_categoria_iniciativas_1 = require("./tipo_categoria_iniciativas");
Object.defineProperty(exports, "tipo_categoria_iniciativas", { enumerable: true, get: function () { return tipo_categoria_iniciativas_1.tipo_categoria_iniciativas; } });
const tipo_comisions_1 = require("./tipo_comisions");
Object.defineProperty(exports, "tipo_comisions", { enumerable: true, get: function () { return tipo_comisions_1.tipo_comisions; } });
const tipo_doc_marcos_1 = require("./tipo_doc_marcos");
Object.defineProperty(exports, "tipo_doc_marcos", { enumerable: true, get: function () { return tipo_doc_marcos_1.tipo_doc_marcos; } });
const tipo_eventos_1 = require("./tipo_eventos");
Object.defineProperty(exports, "tipo_eventos", { enumerable: true, get: function () { return tipo_eventos_1.tipo_eventos; } });
const tipo_flujos_1 = require("./tipo_flujos");
Object.defineProperty(exports, "tipo_flujos", { enumerable: true, get: function () { return tipo_flujos_1.tipo_flujos; } });
const tipo_intervencions_1 = require("./tipo_intervencions");
Object.defineProperty(exports, "tipo_intervencions", { enumerable: true, get: function () { return tipo_intervencions_1.tipo_intervencions; } });
const tipo_ordens_1 = require("./tipo_ordens");
Object.defineProperty(exports, "tipo_ordens", { enumerable: true, get: function () { return tipo_ordens_1.tipo_ordens; } });
const tipo_presentas_1 = require("./tipo_presentas");
Object.defineProperty(exports, "tipo_presentas", { enumerable: true, get: function () { return tipo_presentas_1.tipo_presentas; } });
const tipo_sesions_1 = require("../../faltantesmodelos/tipo_sesions");
Object.defineProperty(exports, "tipo_sesions", { enumerable: true, get: function () { return tipo_sesions_1.tipo_sesions; } });
const tomo_debates_1 = require("./tomo_debates");
Object.defineProperty(exports, "tomo_debates", { enumerable: true, get: function () { return tomo_debates_1.tomo_debates; } });
const turno_comisions_1 = require("./turno_comisions");
Object.defineProperty(exports, "turno_comisions", { enumerable: true, get: function () { return turno_comisions_1.turno_comisions; } });
const turnos_1 = require("./turnos");
Object.defineProperty(exports, "turnos", { enumerable: true, get: function () { return turnos_1.turnos; } });
const users_1 = require("./users");
Object.defineProperty(exports, "users", { enumerable: true, get: function () { return users_1.users; } });
const usuarios_1 = require("./usuarios");
Object.defineProperty(exports, "usuarios", { enumerable: true, get: function () { return usuarios_1.usuarios; } });
const validacions_1 = require("./validacions");
Object.defineProperty(exports, "validacions", { enumerable: true, get: function () { return validacions_1.validacions; } });
function initModels(sequelize) {
    const acta_sesions = acta_sesions_1.acta_sesions.initModel(sequelize);
    const admin_cats = admin_cats_1.admin_cats.initModel(sequelize);
    const agendas = agendas_1.agendas.initModel(sequelize);
    const anfitrion_agendas = anfitrion_agendas_1.anfitrion_agendas.initModel(sequelize);
    const anio_sesions = anio_sesions_1.anio_sesions.initModel(sequelize);
    const asistencia_votos = asistencia_votos_1.asistencia_votos.initModel(sequelize);
    const asuntos_orden_dias = asuntos_orden_dias_1.asuntos_orden_dias.initModel(sequelize);
    const autor_iniciativas = autor_iniciativas_1.autor_iniciativas.initModel(sequelize);
    const autores_comunicados = autores_comunicados_1.autores_comunicados.initModel(sequelize);
    const avisos_terminos = avisos_terminos_1.avisos_terminos.initModel(sequelize);
    const banners = banners_1.banners.initModel(sequelize);
    const certificados = certificados_1.certificados.initModel(sequelize);
    const comision_usuarios = comision_usuarios_1.comision_usuarios.initModel(sequelize);
    const comisiones = comisiones_1.comisiones.initModel(sequelize);
    const comisions = comisions_1.comisions.initModel(sequelize);
    const comunicados = comunicados_1.comunicados.initModel(sequelize);
    const comunicados_sesions = comunicados_sesions_1.comunicados_sesions.initModel(sequelize);
    const datos_users = datos_users_1.datos_users.initModel(sequelize);
    const debates = debates_1.debates.initModel(sequelize);
    const decisions = decisions_1.decisions.initModel(sequelize);
    const decreto_iniciativas = decreto_iniciativas_1.decreto_iniciativas.initModel(sequelize);
    const dependencia_documentos = dependencia_documentos_1.dependencia_documentos.initModel(sequelize);
    const descripcione_comunicados = descripcione_comunicados_1.descripcione_comunicados.initModel(sequelize);
    const dialogos = dialogos_1.dialogos.initModel(sequelize);
    const diputadas = diputadas_1.diputadas.initModel(sequelize);
    const distritos = distritos_1.distritos.initModel(sequelize);
    const documento_firmas = documento_firmas_1.documento_firmas.initModel(sequelize);
    const documento_turnos = documento_turnos_1.documento_turnos.initModel(sequelize);
    const documentos = documentos_1.documentos.initModel(sequelize);
    const estatus_diputados = estatus_diputados_1.estatus_diputados.initModel(sequelize);
    const evento_votos = evento_votos_1.evento_votos.initModel(sequelize);
    const failed_jobs = failed_jobs_1.failed_jobs.initModel(sequelize);
    const fotos = fotos_1.fotos.initModel(sequelize);
    const gacetas = gacetas_1.gacetas.initModel(sequelize);
    const generos = generos_1.generos.initModel(sequelize);
    const informes = informes_1.informes.initModel(sequelize);
    const iniciativas = iniciativas_1.iniciativas.initModel(sequelize);
    const integrante_comisions = integrante_comisions_1.integrante_comisions.initModel(sequelize);
    const integrante_legislaturas = integrante_legislaturas_1.integrante_legislaturas.initModel(sequelize);
    const intervenciones = intervenciones_1.intervenciones.initModel(sequelize);
    const legislaturas = legislaturas_1.legislaturas.initModel(sequelize);
    const leyes_informes = leyes_informes_1.leyes_informes.initModel(sequelize);
    const licencias_diputados = licencias_diputados_1.licencias_diputados.initModel(sequelize);
    const marco_j_s = marco_j_s_1.marco_j_s.initModel(sequelize);
    const marco_juridicos = marco_juridicos_1.marco_juridicos.initModel(sequelize);
    const mensajes_votos = mensajes_votos_1.mensajes_votos.initModel(sequelize);
    const migrations = migrations_1.migrations.initModel(sequelize);
    const model_has_permissions = model_has_permissions_1.model_has_permissions.initModel(sequelize);
    const model_has_roles = model_has_roles_1.model_has_roles.initModel(sequelize);
    const movimientos_diputados = movimientos_diputados_1.movimientos_diputados.initModel(sequelize);
    const municipios = municipios_1.municipios.initModel(sequelize);
    const nivel_autors = nivel_autors_1.nivel_autors.initModel(sequelize);
    const oauth_access_tokens = oauth_access_tokens_1.oauth_access_tokens.initModel(sequelize);
    const oauth_auth_codes = oauth_auth_codes_1.oauth_auth_codes.initModel(sequelize);
    const oauth_clients = oauth_clients_1.oauth_clients.initModel(sequelize);
    const oauth_personal_access_clients = oauth_personal_access_clients_1.oauth_personal_access_clients.initModel(sequelize);
    const oauth_refresh_tokens = oauth_refresh_tokens_1.oauth_refresh_tokens.initModel(sequelize);
    const orden_dias = orden_dias_1.orden_dias.initModel(sequelize);
    const otros_autores = otros_autores_1.otros_autores.initModel(sequelize);
    const partidos = partidos_1.partidos.initModel(sequelize);
    const password_resets = password_resets_1.password_resets.initModel(sequelize);
    const periodo_sesions = periodo_sesions_1.periodo_sesions.initModel(sequelize);
    const permissions = permissions_1.permissions.initModel(sequelize);
    const personal_access_tokens = personal_access_tokens_1.personal_access_tokens.initModel(sequelize);
    const presenta_puntos = presenta_puntos_1.presenta_puntos.initModel(sequelize);
    const presentan_puntos = presentan_puntos_1.presentan_puntos.initModel(sequelize);
    const proponentes = proponentes_1.proponentes.initModel(sequelize);
    const puntos_ordens = puntos_ordens_1.puntos_ordens.initModel(sequelize);
    const regimen_sesions = regimen_sesions_1.regimen_sesions.initModel(sequelize);
    const role_has_permissions = role_has_permissions_1.role_has_permissions.initModel(sequelize);
    const roles = roles_1.roles.initModel(sequelize);
    const sedes = sedes_1.sedes.initModel(sequelize);
    const sesion_agendas = sesion_agendas_1.sesion_agendas.initModel(sequelize);
    const sesiones = sesiones_1.sesiones.initModel(sequelize);
    const solicitud_firmas = solicitud_firmas_1.solicitud_firmas.initModel(sequelize);
    const temas_votos = temas_votos_1.temas_votos.initModel(sequelize);
    const tipo_asambleas = tipo_asambleas_1.tipo_asambleas.initModel(sequelize);
    const tipo_autors = tipo_autors_1.tipo_autors.initModel(sequelize);
    const tipo_cargo_comisions = tipo_cargo_comisions_1.tipo_cargo_comisions.initModel(sequelize);
    const tipo_categoria_iniciativas = tipo_categoria_iniciativas_1.tipo_categoria_iniciativas.initModel(sequelize);
    const tipo_comisions = tipo_comisions_1.tipo_comisions.initModel(sequelize);
    const tipo_doc_marcos = tipo_doc_marcos_1.tipo_doc_marcos.initModel(sequelize);
    const tipo_eventos = tipo_eventos_1.tipo_eventos.initModel(sequelize);
    const tipo_flujos = tipo_flujos_1.tipo_flujos.initModel(sequelize);
    const tipo_intervencions = tipo_intervencions_1.tipo_intervencions.initModel(sequelize);
    const tipo_ordens = tipo_ordens_1.tipo_ordens.initModel(sequelize);
    const tipo_presentas = tipo_presentas_1.tipo_presentas.initModel(sequelize);
    const tipo_sesions = tipo_sesions_1.tipo_sesions.initModel(sequelize);
    const tomo_debates = tomo_debates_1.tomo_debates.initModel(sequelize);
    const turno_comisions = turno_comisions_1.turno_comisions.initModel(sequelize);
    const turnos = turnos_1.turnos.initModel(sequelize);
    const users = users_1.users.initModel(sequelize);
    const usuarios = usuarios_1.usuarios.initModel(sequelize);
    const validacions = validacions_1.validacions.initModel(sequelize);
    permissions.belongsToMany(roles, { as: 'role_id_roles', through: role_has_permissions, foreignKey: "permission_id", otherKey: "role_id" });
    roles.belongsToMany(permissions, { as: 'permission_id_permissions', through: role_has_permissions, foreignKey: "role_id", otherKey: "permission_id" });
    anfitrion_agendas.belongsTo(agendas, { as: "agenda", foreignKey: "agenda_id" });
    agendas.hasMany(anfitrion_agendas, { as: "anfitrion_agendas", foreignKey: "agenda_id" });
    sesion_agendas.belongsTo(agendas, { as: "agenda", foreignKey: "agenda_id" });
    agendas.hasMany(sesion_agendas, { as: "sesion_agendas", foreignKey: "agenda_id" });
    sesiones.belongsTo(agendas, { as: "agenda", foreignKey: "agenda_id" });
    agendas.hasMany(sesiones, { as: "sesiones", foreignKey: "agenda_id" });
    turno_comisions.belongsTo(agendas, { as: "id_agenda_agenda", foreignKey: "id_agenda" });
    agendas.hasMany(turno_comisions, { as: "turno_comisions", foreignKey: "id_agenda" });
    sesiones.belongsTo(anio_sesions, { as: "anio", foreignKey: "anio_id" });
    anio_sesions.hasMany(sesiones, { as: "sesiones", foreignKey: "anio_id" });
    integrante_comisions.belongsTo(comisions, { as: "comision", foreignKey: "comision_id" });
    comisions.hasMany(integrante_comisions, { as: "integrante_comisions", foreignKey: "comision_id" });
    turno_comisions.belongsTo(comisions, { as: "id_comision_comision", foreignKey: "id_comision" });
    comisions.hasMany(turno_comisions, { as: "turno_comisions", foreignKey: "id_comision" });
    autores_comunicados.belongsTo(comunicados, { as: "comunicado", foreignKey: "comunicado_id" });
    comunicados.hasMany(autores_comunicados, { as: "autores_comunicados", foreignKey: "comunicado_id" });
    comunicados_sesions.belongsTo(comunicados, { as: "comunicado", foreignKey: "comunicado_id" });
    comunicados.hasMany(comunicados_sesions, { as: "comunicados_sesions", foreignKey: "comunicado_id" });
    descripcione_comunicados.belongsTo(comunicados, { as: "comunicado", foreignKey: "comunicado_id" });
    comunicados.hasMany(descripcione_comunicados, { as: "descripcione_comunicados", foreignKey: "comunicado_id" });
    asistencia_votos.belongsTo(datos_users, { as: "id_diputado_datos_user", foreignKey: "id_diputado" });
    datos_users.hasMany(asistencia_votos, { as: "asistencia_votos", foreignKey: "id_diputado" });
    certificados.belongsTo(datos_users, { as: "id_diputado_datos_user", foreignKey: "id_diputado" });
    datos_users.hasMany(certificados, { as: "certificados", foreignKey: "id_diputado" });
    documentos.belongsTo(datos_users, { as: "id_usuario_registro_datos_user", foreignKey: "id_usuario_registro" });
    datos_users.hasMany(documentos, { as: "documentos", foreignKey: "id_usuario_registro" });
    integrante_legislaturas.belongsTo(datos_users, { as: "dato_dipoficial", foreignKey: "dato_dipoficial_id" });
    datos_users.hasMany(integrante_legislaturas, { as: "integrante_legislaturas", foreignKey: "dato_dipoficial_id" });
    integrante_legislaturas.belongsTo(datos_users, { as: "dato_user", foreignKey: "dato_user_id" });
    datos_users.hasMany(integrante_legislaturas, { as: "dato_user_integrante_legislaturas", foreignKey: "dato_user_id" });
    licencias_diputados.belongsTo(datos_users, { as: "diputado", foreignKey: "diputado_id" });
    datos_users.hasMany(licencias_diputados, { as: "licencias_diputados", foreignKey: "diputado_id" });
    licencias_diputados.belongsTo(datos_users, { as: "diputado_suplente", foreignKey: "diputado_suplente_id" });
    datos_users.hasMany(licencias_diputados, { as: "diputado_suplente_licencias_diputados", foreignKey: "diputado_suplente_id" });
    mensajes_votos.belongsTo(datos_users, { as: "id_diputado_datos_user", foreignKey: "id_diputado" });
    datos_users.hasMany(mensajes_votos, { as: "mensajes_votos", foreignKey: "id_diputado" });
    mensajes_votos.belongsTo(datos_users, { as: "id_usuario_registra_datos_user", foreignKey: "id_usuario_registra" });
    datos_users.hasMany(mensajes_votos, { as: "id_usuario_registra_mensajes_votos", foreignKey: "id_usuario_registra" });
    movimientos_diputados.belongsTo(datos_users, { as: "dato_user", foreignKey: "dato_user_id" });
    datos_users.hasMany(movimientos_diputados, { as: "movimientos_diputados", foreignKey: "dato_user_id" });
    presenta_puntos.belongsTo(datos_users, { as: "id_presenta_datos_user", foreignKey: "id_presenta" });
    datos_users.hasMany(presenta_puntos, { as: "presenta_puntos", foreignKey: "id_presenta" });
    presentan_puntos.belongsTo(datos_users, { as: "id_diputado_datos_user", foreignKey: "id_diputado" });
    datos_users.hasMany(presentan_puntos, { as: "presentan_puntos", foreignKey: "id_diputado" });
    puntos_ordens.belongsTo(datos_users, { as: "tribuna_datos_user", foreignKey: "tribuna" });
    datos_users.hasMany(puntos_ordens, { as: "puntos_ordens", foreignKey: "tribuna" });
    sesiones.belongsTo(datos_users, { as: "usuario_cierra", foreignKey: "usuario_cierra_id" });
    datos_users.hasMany(sesiones, { as: "sesiones", foreignKey: "usuario_cierra_id" });
    sesiones.belongsTo(datos_users, { as: "usuario_registro", foreignKey: "usuario_registro_id" });
    datos_users.hasMany(sesiones, { as: "usuario_registro_sesiones", foreignKey: "usuario_registro_id" });
    solicitud_firmas.belongsTo(datos_users, { as: "id_diputado_datos_user", foreignKey: "id_diputado" });
    datos_users.hasMany(solicitud_firmas, { as: "solicitud_firmas", foreignKey: "id_diputado" });
    turnos.belongsTo(datos_users, { as: "id_diputado_datos_user", foreignKey: "id_diputado" });
    datos_users.hasMany(turnos, { as: "turnos", foreignKey: "id_diputado" });
    integrante_legislaturas.belongsTo(distritos, { as: "distrito", foreignKey: "distrito_id" });
    distritos.hasMany(integrante_legislaturas, { as: "integrante_legislaturas", foreignKey: "distrito_id" });
    documento_turnos.belongsTo(documentos, { as: "documento", foreignKey: "documento_id" });
    documentos.hasMany(documento_turnos, { as: "documento_turnos", foreignKey: "documento_id" });
    turnos.belongsTo(documentos, { as: "id_documento_documento", foreignKey: "id_documento" });
    documentos.hasMany(turnos, { as: "turnos", foreignKey: "id_documento" });
    licencias_diputados.belongsTo(estatus_diputados, { as: "estatus_diputado_estatus_diputado", foreignKey: "estatus_diputado" });
    estatus_diputados.hasMany(licencias_diputados, { as: "licencias_diputados", foreignKey: "estatus_diputado" });
    movimientos_diputados.belongsTo(estatus_diputados, { as: "estatus_diputado", foreignKey: "estatus_diputado_id" });
    estatus_diputados.hasMany(movimientos_diputados, { as: "movimientos_diputados", foreignKey: "estatus_diputado_id" });
    datos_users.belongsTo(generos, { as: "genero", foreignKey: "genero_id" });
    generos.hasMany(datos_users, { as: "datos_users", foreignKey: "genero_id" });
    leyes_informes.belongsTo(informes, { as: "informe", foreignKey: "informes_id" });
    informes.hasMany(leyes_informes, { as: "leyes_informes", foreignKey: "informes_id" });
    autor_iniciativas.belongsTo(iniciativas, { as: "iniciativa", foreignKey: "iniciativa_id" });
    iniciativas.hasMany(autor_iniciativas, { as: "autor_iniciativas", foreignKey: "iniciativa_id" });
    decreto_iniciativas.belongsTo(iniciativas, { as: "iniciativa", foreignKey: "iniciativa_id" });
    iniciativas.hasMany(decreto_iniciativas, { as: "decreto_iniciativas", foreignKey: "iniciativa_id" });
    informes.belongsTo(integrante_legislaturas, { as: "integrante_legislatura", foreignKey: "integrante_legislatura_id" });
    integrante_legislaturas.hasMany(informes, { as: "informes", foreignKey: "integrante_legislatura_id" });
    integrante_comisions.belongsTo(integrante_legislaturas, { as: "integrante_legislatura", foreignKey: "integrante_legislatura_id" });
    integrante_legislaturas.hasMany(integrante_comisions, { as: "integrante_comisions", foreignKey: "integrante_legislatura_id" });
    integrante_legislaturas.belongsTo(legislaturas, { as: "legislatura", foreignKey: "legislatura_id" });
    legislaturas.hasMany(integrante_legislaturas, { as: "integrante_legislaturas", foreignKey: "legislatura_id" });
    dependencia_documentos.belongsTo(marco_j_s, { as: "id_marcoj_marco_j_", foreignKey: "id_marcoj" });
    marco_j_s.hasMany(dependencia_documentos, { as: "dependencia_documentos", foreignKey: "id_marcoj" });
    distritos.belongsTo(municipios, { as: "municipio", foreignKey: "municipio_id" });
    municipios.hasMany(distritos, { as: "distritos", foreignKey: "municipio_id" });
    autor_iniciativas.belongsTo(nivel_autors, { as: "nivel_autor", foreignKey: "nivel_autor_id" });
    nivel_autors.hasMany(autor_iniciativas, { as: "autor_iniciativas", foreignKey: "nivel_autor_id" });
    integrante_legislaturas.belongsTo(partidos, { as: "partido", foreignKey: "partido_id" });
    partidos.hasMany(integrante_legislaturas, { as: "integrante_legislaturas", foreignKey: "partido_id" });
    sesiones.belongsTo(periodo_sesions, { as: "periodo", foreignKey: "periodo_id" });
    periodo_sesions.hasMany(sesiones, { as: "sesiones", foreignKey: "periodo_id" });
    model_has_permissions.belongsTo(permissions, { as: "permission", foreignKey: "permission_id" });
    permissions.hasMany(model_has_permissions, { as: "model_has_permissions", foreignKey: "permission_id" });
    role_has_permissions.belongsTo(permissions, { as: "permission", foreignKey: "permission_id" });
    permissions.hasMany(role_has_permissions, { as: "role_has_permissions", foreignKey: "permission_id" });
    presenta_puntos.belongsTo(puntos_ordens, { as: "id_punto_puntos_orden", foreignKey: "id_punto" });
    puntos_ordens.hasMany(presenta_puntos, { as: "presenta_puntos", foreignKey: "id_punto" });
    presentan_puntos.belongsTo(puntos_ordens, { as: "id_punto_puntos_orden", foreignKey: "id_punto" });
    puntos_ordens.hasMany(presentan_puntos, { as: "presentan_puntos", foreignKey: "id_punto" });
    temas_votos.belongsTo(puntos_ordens, { as: "id_punto_puntos_orden", foreignKey: "id_punto" });
    puntos_ordens.hasMany(temas_votos, { as: "temas_votos", foreignKey: "id_punto" });
    turno_comisions.belongsTo(puntos_ordens, { as: "id_punto_orden_puntos_orden", foreignKey: "id_punto_orden" });
    puntos_ordens.hasMany(turno_comisions, { as: "turno_comisions", foreignKey: "id_punto_orden" });
    sesiones.belongsTo(regimen_sesions, { as: "regimen", foreignKey: "regimen_id" });
    regimen_sesions.hasMany(sesiones, { as: "sesiones", foreignKey: "regimen_id" });
    model_has_roles.belongsTo(roles, { as: "role", foreignKey: "role_id" });
    roles.hasMany(model_has_roles, { as: "model_has_roles", foreignKey: "role_id" });
    role_has_permissions.belongsTo(roles, { as: "role", foreignKey: "role_id" });
    roles.hasMany(role_has_permissions, { as: "role_has_permissions", foreignKey: "role_id" });
    agendas.belongsTo(sedes, { as: "sede", foreignKey: "sede_id" });
    sedes.hasMany(agendas, { as: "agendas", foreignKey: "sede_id" });
    asistencia_votos.belongsTo(sesiones, { as: "id_sesion_sesione", foreignKey: "id_sesion" });
    sesiones.hasMany(asistencia_votos, { as: "asistencia_votos", foreignKey: "id_sesion" });
    asuntos_orden_dias.belongsTo(sesiones, { as: "id_evento_sesione", foreignKey: "id_evento" });
    sesiones.hasMany(asuntos_orden_dias, { as: "asuntos_orden_dia", foreignKey: "id_evento" });
    comunicados_sesions.belongsTo(sesiones, { as: "id_sesion_sesione", foreignKey: "id_sesion" });
    sesiones.hasMany(comunicados_sesions, { as: "comunicados_sesions", foreignKey: "id_sesion" });
    mensajes_votos.belongsTo(sesiones, { as: "id_evento_sesione", foreignKey: "id_evento" });
    sesiones.hasMany(mensajes_votos, { as: "mensajes_votos", foreignKey: "id_evento" });
    sesion_agendas.belongsTo(sesiones, { as: "sesione", foreignKey: "sesiones_id" });
    sesiones.hasMany(sesion_agendas, { as: "sesion_agendas", foreignKey: "sesiones_id" });
    temas_votos.belongsTo(sesiones, { as: "id_evento_sesione", foreignKey: "id_evento" });
    sesiones.hasMany(temas_votos, { as: "temas_votos", foreignKey: "id_evento" });
    mensajes_votos.belongsTo(temas_votos, { as: "id_tema_voto_temas_voto", foreignKey: "id_tema_voto" });
    temas_votos.hasMany(mensajes_votos, { as: "mensajes_votos", foreignKey: "id_tema_voto" });
    sesiones.belongsTo(tipo_asambleas, { as: "tipo_asamblea", foreignKey: "tipo_asamblea_id" });
    tipo_asambleas.hasMany(sesiones, { as: "sesiones", foreignKey: "tipo_asamblea_id" });
    integrante_comisions.belongsTo(tipo_cargo_comisions, { as: "tipo_cargo_comision", foreignKey: "tipo_cargo_comision_id" });
    tipo_cargo_comisions.hasMany(integrante_comisions, { as: "integrante_comisions", foreignKey: "tipo_cargo_comision_id" });
    documento_firmas.belongsTo(tipo_categoria_iniciativas, { as: "id_tipo_doc_tipo_categoria_iniciativa", foreignKey: "id_tipo_doc" });
    tipo_categoria_iniciativas.hasMany(documento_firmas, { as: "documento_firmas", foreignKey: "id_tipo_doc" });
    documentos.belongsTo(tipo_categoria_iniciativas, { as: "id_tipo_doc_tipo_categoria_iniciativa", foreignKey: "id_tipo_doc" });
    tipo_categoria_iniciativas.hasMany(documentos, { as: "documentos", foreignKey: "id_tipo_doc" });
    puntos_ordens.belongsTo(tipo_categoria_iniciativas, { as: "id_tipo_tipo_categoria_iniciativa", foreignKey: "id_tipo" });
    tipo_categoria_iniciativas.hasMany(puntos_ordens, { as: "puntos_ordens", foreignKey: "id_tipo" });
    comisions.belongsTo(tipo_comisions, { as: "tipo_comision", foreignKey: "tipo_comision_id" });
    tipo_comisions.hasMany(comisions, { as: "comisions", foreignKey: "tipo_comision_id" });
    agendas.belongsTo(tipo_eventos, { as: "tipo_evento", foreignKey: "tipo_evento_id" });
    tipo_eventos.hasMany(agendas, { as: "agendas", foreignKey: "tipo_evento_id" });
    presentan_puntos.belongsTo(tipo_presentas, { as: "id_tipo_presenta_tipo_presenta", foreignKey: "id_tipo_presenta" });
    tipo_presentas.hasMany(presentan_puntos, { as: "presentan_puntos", foreignKey: "id_tipo_presenta" });
    sesiones.belongsTo(tipo_sesions, { as: "tipo_sesion", foreignKey: "tipo_sesion_id" });
    tipo_sesions.hasMany(sesiones, { as: "sesiones", foreignKey: "tipo_sesion_id" });
    debates.belongsTo(tomo_debates, { as: "id_tomo_tomo_debate", foreignKey: "id_tomo" });
    tomo_debates.hasMany(debates, { as: "debates", foreignKey: "id_tomo" });
    certificados.belongsTo(users, { as: "id_usuario_registro_user", foreignKey: "id_usuario_registro" });
    users.hasMany(certificados, { as: "certificados", foreignKey: "id_usuario_registro" });
    datos_users.belongsTo(users, { as: "user", foreignKey: "user_id" });
    users.hasMany(datos_users, { as: "datos_users", foreignKey: "user_id" });
    documento_firmas.belongsTo(users, { as: "id_usuario_registro_user", foreignKey: "id_usuario_registro" });
    users.hasMany(documento_firmas, { as: "documento_firmas", foreignKey: "id_usuario_registro" });
    usuarios.belongsTo(users, { as: "id_users_user", foreignKey: "id_users" });
    users.hasMany(usuarios, { as: "usuarios", foreignKey: "id_users" });
    usuarios.belongsTo(users, { as: "id_usuario_registra_user", foreignKey: "id_usuario_registra" });
    users.hasMany(usuarios, { as: "id_usuario_registra_usuarios", foreignKey: "id_usuario_registra" });
    return {
        acta_sesions: acta_sesions,
        admin_cats: admin_cats,
        agendas: agendas,
        anfitrion_agendas: anfitrion_agendas,
        anio_sesions: anio_sesions,
        asistencia_votos: asistencia_votos,
        asuntos_orden_dias: asuntos_orden_dias,
        autor_iniciativas: autor_iniciativas,
        autores_comunicados: autores_comunicados,
        avisos_terminos: avisos_terminos,
        banners: banners,
        certificados: certificados,
        comision_usuarios: comision_usuarios,
        comisiones: comisiones,
        comisions: comisions,
        comunicados: comunicados,
        comunicados_sesions: comunicados_sesions,
        datos_users: datos_users,
        debates: debates,
        decisions: decisions,
        decreto_iniciativas: decreto_iniciativas,
        dependencia_documentos: dependencia_documentos,
        descripcione_comunicados: descripcione_comunicados,
        dialogos: dialogos,
        diputadas: diputadas,
        distritos: distritos,
        documento_firmas: documento_firmas,
        documento_turnos: documento_turnos,
        documentos: documentos,
        estatus_diputados: estatus_diputados,
        evento_votos: evento_votos,
        failed_jobs: failed_jobs,
        fotos: fotos,
        gacetas: gacetas,
        generos: generos,
        informes: informes,
        iniciativas: iniciativas,
        integrante_comisions: integrante_comisions,
        integrante_legislaturas: integrante_legislaturas,
        intervenciones: intervenciones,
        legislaturas: legislaturas,
        leyes_informes: leyes_informes,
        licencias_diputados: licencias_diputados,
        marco_j_s: marco_j_s,
        marco_juridicos: marco_juridicos,
        mensajes_votos: mensajes_votos,
        migrations: migrations,
        model_has_permissions: model_has_permissions,
        model_has_roles: model_has_roles,
        movimientos_diputados: movimientos_diputados,
        municipios: municipios,
        nivel_autors: nivel_autors,
        oauth_access_tokens: oauth_access_tokens,
        oauth_auth_codes: oauth_auth_codes,
        oauth_clients: oauth_clients,
        oauth_personal_access_clients: oauth_personal_access_clients,
        oauth_refresh_tokens: oauth_refresh_tokens,
        orden_dias: orden_dias,
        otros_autores: otros_autores,
        partidos: partidos,
        password_resets: password_resets,
        periodo_sesions: periodo_sesions,
        permissions: permissions,
        personal_access_tokens: personal_access_tokens,
        presenta_puntos: presenta_puntos,
        presentan_puntos: presentan_puntos,
        proponentes: proponentes,
        puntos_ordens: puntos_ordens,
        regimen_sesions: regimen_sesions,
        role_has_permissions: role_has_permissions,
        roles: roles,
        sedes: sedes,
        sesion_agendas: sesion_agendas,
        sesiones: sesiones,
        solicitud_firmas: solicitud_firmas,
        temas_votos: temas_votos,
        tipo_asambleas: tipo_asambleas,
        tipo_autors: tipo_autors,
        tipo_cargo_comisions: tipo_cargo_comisions,
        tipo_categoria_iniciativas: tipo_categoria_iniciativas,
        tipo_comisions: tipo_comisions,
        tipo_doc_marcos: tipo_doc_marcos,
        tipo_eventos: tipo_eventos,
        tipo_flujos: tipo_flujos,
        tipo_intervencions: tipo_intervencions,
        tipo_ordens: tipo_ordens,
        tipo_presentas: tipo_presentas,
        tipo_sesions: tipo_sesions,
        tomo_debates: tomo_debates,
        turno_comisions: turno_comisions,
        turnos: turnos,
        users: users,
        usuarios: usuarios,
        validacions: validacions,
    };
}
