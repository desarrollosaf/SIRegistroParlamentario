import type { Sequelize } from "sequelize";
import { acta_sesions as _acta_sesions } from "./acta_sesions";
import type { acta_sesionsAttributes, acta_sesionsCreationAttributes } from "./acta_sesions";
import { admin_cats as _admin_cats } from "./admin_cats";
import type { admin_catsAttributes, admin_catsCreationAttributes } from "./admin_cats";
import { agendas as _agendas } from "./agendas";
import type { agendasAttributes, agendasCreationAttributes } from "./agendas";
import { anfitrion_agendas as _anfitrion_agendas } from "./anfitrion_agendas";
import type { anfitrion_agendasAttributes, anfitrion_agendasCreationAttributes } from "./anfitrion_agendas";
import { anio_sesions as _anio_sesions } from "./anio_sesions";
import type { anio_sesionsAttributes, anio_sesionsCreationAttributes } from "./anio_sesions";
import { asistencia_votos as _asistencia_votos } from "./asistencia_votos";
import type { asistencia_votosAttributes, asistencia_votosCreationAttributes } from "./asistencia_votos";
import { asuntos_orden_dias as _asuntos_orden_dias } from "./asuntos_orden_dias";
import type { asuntos_orden_diasAttributes, asuntos_orden_diasCreationAttributes } from "./asuntos_orden_dias";
import { autor_iniciativas as _autor_iniciativas } from "./autor_iniciativas";
import type { autor_iniciativasAttributes, autor_iniciativasCreationAttributes } from "./autor_iniciativas";
import { autores_comunicados as _autores_comunicados } from "./autores_comunicados";
import type { autores_comunicadosAttributes, autores_comunicadosCreationAttributes } from "./autores_comunicados";
import { avisos_terminos as _avisos_terminos } from "./avisos_terminos";
import type { avisos_terminosAttributes, avisos_terminosCreationAttributes } from "./avisos_terminos";
import { banners as _banners } from "./banners";
import type { bannersAttributes, bannersCreationAttributes } from "./banners";
import { certificados as _certificados } from "./certificados";
import type { certificadosAttributes, certificadosCreationAttributes } from "./certificados";
import { comision_usuarios as _comision_usuarios } from "./comision_usuarios";
import type { comision_usuariosAttributes, comision_usuariosCreationAttributes } from "./comision_usuarios";
import { comisiones as _comisiones } from "./comisiones";
import type { comisionesAttributes, comisionesCreationAttributes } from "./comisiones";
import { comisions as _comisions } from "./comisions";
import type { comisionsAttributes, comisionsCreationAttributes } from "./comisions";
import { comunicados as _comunicados } from "./comunicados";
import type { comunicadosAttributes, comunicadosCreationAttributes } from "./comunicados";
import { comunicados_sesions as _comunicados_sesions } from "./comunicados_sesions";
import type { comunicados_sesionsAttributes, comunicados_sesionsCreationAttributes } from "./comunicados_sesions";
import { datos_users as _datos_users } from "./datos_users";
import type { datos_usersAttributes, datos_usersCreationAttributes } from "./datos_users";
import { debates as _debates } from "./debates";
import type { debatesAttributes, debatesCreationAttributes } from "./debates";
import { decisions as _decisions } from "./decisions";
import type { decisionsAttributes, decisionsCreationAttributes } from "./decisions";
import { decreto_iniciativas as _decreto_iniciativas } from "./decreto_iniciativas";
import type { decreto_iniciativasAttributes, decreto_iniciativasCreationAttributes } from "./decreto_iniciativas";
import { dependencia_documentos as _dependencia_documentos } from "./dependencia_documentos";
import type { dependencia_documentosAttributes, dependencia_documentosCreationAttributes } from "./dependencia_documentos";
import { descripcione_comunicados as _descripcione_comunicados } from "./descripcione_comunicados";
import type { descripcione_comunicadosAttributes, descripcione_comunicadosCreationAttributes } from "./descripcione_comunicados";
import { dialogos as _dialogos } from "./dialogos";
import type { dialogosAttributes, dialogosCreationAttributes } from "./dialogos";
import { diputadas as _diputadas } from "./diputadas";
import type { diputadasAttributes, diputadasCreationAttributes } from "./diputadas";
import { distritos as _distritos } from "./distritos";
import type { distritosAttributes, distritosCreationAttributes } from "./distritos";
import { documento_firmas as _documento_firmas } from "./documento_firmas";
import type { documento_firmasAttributes, documento_firmasCreationAttributes } from "./documento_firmas";
import { documento_turnos as _documento_turnos } from "./documento_turnos";
import type { documento_turnosAttributes, documento_turnosCreationAttributes } from "./documento_turnos";
import { documentos as _documentos } from "./documentos";
import type { documentosAttributes, documentosCreationAttributes } from "./documentos";
import { estatus_diputados as _estatus_diputados } from "./estatus_diputados";
import type { estatus_diputadosAttributes, estatus_diputadosCreationAttributes } from "./estatus_diputados";
import { evento_votos as _evento_votos } from "./evento_votos";
import type { evento_votosAttributes, evento_votosCreationAttributes } from "./evento_votos";
import { failed_jobs as _failed_jobs } from "./failed_jobs";
import type { failed_jobsAttributes, failed_jobsCreationAttributes } from "./failed_jobs";
import { fotos as _fotos } from "./fotos";
import type { fotosAttributes, fotosCreationAttributes } from "./fotos";
import { gacetas as _gacetas } from "./gacetas";
import type { gacetasAttributes, gacetasCreationAttributes } from "./gacetas";
import { generos as _generos } from "./generos";
import type { generosAttributes, generosCreationAttributes } from "./generos";
import { informes as _informes } from "./informes";
import type { informesAttributes, informesCreationAttributes } from "./informes";
import { iniciativas as _iniciativas } from "./iniciativas";
import type { iniciativasAttributes, iniciativasCreationAttributes } from "./iniciativas";
import { integrante_comisions as _integrante_comisions } from "./integrante_comisions";
import type { integrante_comisionsAttributes, integrante_comisionsCreationAttributes } from "./integrante_comisions";
import { integrante_legislaturas as _integrante_legislaturas } from "./integrante_legislaturas";
import type { integrante_legislaturasAttributes, integrante_legislaturasCreationAttributes } from "./integrante_legislaturas";
import { intervenciones as _intervenciones } from "./intervenciones";
import type { intervencionesAttributes, intervencionesCreationAttributes } from "./intervenciones";
import { legislaturas as _legislaturas } from "./legislaturas";
import type { legislaturasAttributes, legislaturasCreationAttributes } from "./legislaturas";
import { leyes_informes as _leyes_informes } from "./leyes_informes";
import type { leyes_informesAttributes, leyes_informesCreationAttributes } from "./leyes_informes";
import { licencias_diputados as _licencias_diputados } from "./licencias_diputados";
import type { licencias_diputadosAttributes, licencias_diputadosCreationAttributes } from "./licencias_diputados";
import { marco_j_s as _marco_j_s } from "./marco_j_s";
import type { marco_j_sAttributes, marco_j_sCreationAttributes } from "./marco_j_s";
import { marco_juridicos as _marco_juridicos } from "./marco_juridicos";
import type { marco_juridicosAttributes, marco_juridicosCreationAttributes } from "./marco_juridicos";
import { mensajes_votos as _mensajes_votos } from "./mensajes_votos";
import type { mensajes_votosAttributes, mensajes_votosCreationAttributes } from "./mensajes_votos";
import { migrations as _migrations } from "./migrations";
import type { migrationsAttributes, migrationsCreationAttributes } from "./migrations";
import { model_has_permissions as _model_has_permissions } from "./model_has_permissions";
import type { model_has_permissionsAttributes, model_has_permissionsCreationAttributes } from "./model_has_permissions";
import { model_has_roles as _model_has_roles } from "./model_has_roles";
import type { model_has_rolesAttributes, model_has_rolesCreationAttributes } from "./model_has_roles";
import { movimientos_diputados as _movimientos_diputados } from "./movimientos_diputados";
import type { movimientos_diputadosAttributes, movimientos_diputadosCreationAttributes } from "./movimientos_diputados";
import { municipios as _municipios } from "./municipios";
import type { municipiosAttributes, municipiosCreationAttributes } from "./municipios";
import { nivel_autors as _nivel_autors } from "./nivel_autors";
import type { nivel_autorsAttributes, nivel_autorsCreationAttributes } from "./nivel_autors";
import { oauth_access_tokens as _oauth_access_tokens } from "./oauth_access_tokens";
import type { oauth_access_tokensAttributes, oauth_access_tokensCreationAttributes } from "./oauth_access_tokens";
import { oauth_auth_codes as _oauth_auth_codes } from "./oauth_auth_codes";
import type { oauth_auth_codesAttributes, oauth_auth_codesCreationAttributes } from "./oauth_auth_codes";
import { oauth_clients as _oauth_clients } from "./oauth_clients";
import type { oauth_clientsAttributes, oauth_clientsCreationAttributes } from "./oauth_clients";
import { oauth_personal_access_clients as _oauth_personal_access_clients } from "./oauth_personal_access_clients";
import type { oauth_personal_access_clientsAttributes, oauth_personal_access_clientsCreationAttributes } from "./oauth_personal_access_clients";
import { oauth_refresh_tokens as _oauth_refresh_tokens } from "./oauth_refresh_tokens";
import type { oauth_refresh_tokensAttributes, oauth_refresh_tokensCreationAttributes } from "./oauth_refresh_tokens";
import { orden_dias as _orden_dias } from "./orden_dias";
import type { orden_diasAttributes, orden_diasCreationAttributes } from "./orden_dias";
import { otros_autores as _otros_autores } from "./otros_autores";
import type { otros_autoresAttributes, otros_autoresCreationAttributes } from "./otros_autores";
import { partidos as _partidos } from "./partidos";
import type { partidosAttributes, partidosCreationAttributes } from "./partidos";
import { password_resets as _password_resets } from "./password_resets";
import type { password_resetsAttributes, password_resetsCreationAttributes } from "./password_resets";
import { periodo_sesions as _periodo_sesions } from "./periodo_sesions";
import type { periodo_sesionsAttributes, periodo_sesionsCreationAttributes } from "./periodo_sesions";
import { permissions as _permissions } from "./permissions";
import type { permissionsAttributes, permissionsCreationAttributes } from "./permissions";
import { personal_access_tokens as _personal_access_tokens } from "./personal_access_tokens";
import type { personal_access_tokensAttributes, personal_access_tokensCreationAttributes } from "./personal_access_tokens";
import { presenta_puntos as _presenta_puntos } from "./presenta_puntos";
import type { presenta_puntosAttributes, presenta_puntosCreationAttributes } from "./presenta_puntos";
import { presentan_puntos as _presentan_puntos } from "./presentan_puntos";
import type { presentan_puntosAttributes, presentan_puntosCreationAttributes } from "./presentan_puntos";
import { proponentes as _proponentes } from "./proponentes";
import type { proponentesAttributes, proponentesCreationAttributes } from "./proponentes";
import { puntos_ordens as _puntos_ordens } from "./puntos_ordens";
import type { puntos_ordensAttributes, puntos_ordensCreationAttributes } from "./puntos_ordens";
import { regimen_sesions as _regimen_sesions } from "./regimen_sesions";
import type { regimen_sesionsAttributes, regimen_sesionsCreationAttributes } from "./regimen_sesions";
import { role_has_permissions as _role_has_permissions } from "./role_has_permissions";
import type { role_has_permissionsAttributes, role_has_permissionsCreationAttributes } from "./role_has_permissions";
import { roles as _roles } from "./roles";
import type { rolesAttributes, rolesCreationAttributes } from "./roles";
import { sedes as _sedes } from "./sedes";
import type { sedesAttributes, sedesCreationAttributes } from "./sedes";
import { sesion_agendas as _sesion_agendas } from "./sesion_agendas";
import type { sesion_agendasAttributes, sesion_agendasCreationAttributes } from "./sesion_agendas";
import { sesiones as _sesiones } from "./sesiones";
import type { sesionesAttributes, sesionesCreationAttributes } from "./sesiones";
import { solicitud_firmas as _solicitud_firmas } from "./solicitud_firmas";
import type { solicitud_firmasAttributes, solicitud_firmasCreationAttributes } from "./solicitud_firmas";
import { temas_votos as _temas_votos } from "./temas_votos";
import type { temas_votosAttributes, temas_votosCreationAttributes } from "./temas_votos";
import { tipo_asambleas as _tipo_asambleas } from "./tipo_asambleas";
import type { tipo_asambleasAttributes, tipo_asambleasCreationAttributes } from "./tipo_asambleas";
import { tipo_autors as _tipo_autors } from "./tipo_autors";
import type { tipo_autorsAttributes, tipo_autorsCreationAttributes } from "./tipo_autors";
import { tipo_cargo_comisions as _tipo_cargo_comisions } from "./tipo_cargo_comisions";
import type { tipo_cargo_comisionsAttributes, tipo_cargo_comisionsCreationAttributes } from "./tipo_cargo_comisions";
import { tipo_categoria_iniciativas as _tipo_categoria_iniciativas } from "./tipo_categoria_iniciativas";
import type { tipo_categoria_iniciativasAttributes, tipo_categoria_iniciativasCreationAttributes } from "./tipo_categoria_iniciativas";
import { tipo_comisions as _tipo_comisions } from "./tipo_comisions";
import type { tipo_comisionsAttributes, tipo_comisionsCreationAttributes } from "./tipo_comisions";
import { tipo_doc_marcos as _tipo_doc_marcos } from "./tipo_doc_marcos";
import type { tipo_doc_marcosAttributes, tipo_doc_marcosCreationAttributes } from "./tipo_doc_marcos";
import { tipo_eventos as _tipo_eventos } from "./tipo_eventos";
import type { tipo_eventosAttributes, tipo_eventosCreationAttributes } from "./tipo_eventos";
import { tipo_flujos as _tipo_flujos } from "./tipo_flujos";
import type { tipo_flujosAttributes, tipo_flujosCreationAttributes } from "./tipo_flujos";
import { tipo_intervencions as _tipo_intervencions } from "./tipo_intervencions";
import type { tipo_intervencionsAttributes, tipo_intervencionsCreationAttributes } from "./tipo_intervencions";
import { tipo_ordens as _tipo_ordens } from "./tipo_ordens";
import type { tipo_ordensAttributes, tipo_ordensCreationAttributes } from "./tipo_ordens";
import { tipo_presentas as _tipo_presentas } from "./tipo_presentas";
import type { tipo_presentasAttributes, tipo_presentasCreationAttributes } from "./tipo_presentas";
import { tipo_sesions as _tipo_sesions } from "../../faltantesmodelos/tipo_sesions";
import type { tipo_sesionsAttributes, tipo_sesionsCreationAttributes } from "../../faltantesmodelos/tipo_sesions";
import { tomo_debates as _tomo_debates } from "./tomo_debates";
import type { tomo_debatesAttributes, tomo_debatesCreationAttributes } from "./tomo_debates";
import { turno_comisions as _turno_comisions } from "./turno_comisions";
import type { turno_comisionsAttributes, turno_comisionsCreationAttributes } from "./turno_comisions";
import { turnos as _turnos } from "./turnos";
import type { turnosAttributes, turnosCreationAttributes } from "./turnos";
import { users as _users } from "./users";
import type { usersAttributes, usersCreationAttributes } from "./users";
import { usuarios as _usuarios } from "./usuarios";
import type { usuariosAttributes, usuariosCreationAttributes } from "./usuarios";
import { validacions as _validacions } from "./validacions";
import type { validacionsAttributes, validacionsCreationAttributes } from "./validacions";

export {
  _acta_sesions as acta_sesions,
  _admin_cats as admin_cats,
  _agendas as agendas,
  _anfitrion_agendas as anfitrion_agendas,
  _anio_sesions as anio_sesions,
  _asistencia_votos as asistencia_votos,
  _asuntos_orden_dias as asuntos_orden_dias,
  _autor_iniciativas as autor_iniciativas,
  _autores_comunicados as autores_comunicados,
  _avisos_terminos as avisos_terminos,
  _banners as banners,
  _certificados as certificados,
  _comision_usuarios as comision_usuarios,
  _comisiones as comisiones,
  _comisions as comisions,
  _comunicados as comunicados,
  _comunicados_sesions as comunicados_sesions,
  _datos_users as datos_users,
  _debates as debates,
  _decisions as decisions,
  _decreto_iniciativas as decreto_iniciativas,
  _dependencia_documentos as dependencia_documentos,
  _descripcione_comunicados as descripcione_comunicados,
  _dialogos as dialogos,
  _diputadas as diputadas,
  _distritos as distritos,
  _documento_firmas as documento_firmas,
  _documento_turnos as documento_turnos,
  _documentos as documentos,
  _estatus_diputados as estatus_diputados,
  _evento_votos as evento_votos,
  _failed_jobs as failed_jobs,
  _fotos as fotos,
  _gacetas as gacetas,
  _generos as generos,
  _informes as informes,
  _iniciativas as iniciativas,
  _integrante_comisions as integrante_comisions,
  _integrante_legislaturas as integrante_legislaturas,
  _intervenciones as intervenciones,
  _legislaturas as legislaturas,
  _leyes_informes as leyes_informes,
  _licencias_diputados as licencias_diputados,
  _marco_j_s as marco_j_s,
  _marco_juridicos as marco_juridicos,
  _mensajes_votos as mensajes_votos,
  _migrations as migrations,
  _model_has_permissions as model_has_permissions,
  _model_has_roles as model_has_roles,
  _movimientos_diputados as movimientos_diputados,
  _municipios as municipios,
  _nivel_autors as nivel_autors,
  _oauth_access_tokens as oauth_access_tokens,
  _oauth_auth_codes as oauth_auth_codes,
  _oauth_clients as oauth_clients,
  _oauth_personal_access_clients as oauth_personal_access_clients,
  _oauth_refresh_tokens as oauth_refresh_tokens,
  _orden_dias as orden_dias,
  _otros_autores as otros_autores,
  _partidos as partidos,
  _password_resets as password_resets,
  _periodo_sesions as periodo_sesions,
  _permissions as permissions,
  _personal_access_tokens as personal_access_tokens,
  _presenta_puntos as presenta_puntos,
  _presentan_puntos as presentan_puntos,
  _proponentes as proponentes,
  _puntos_ordens as puntos_ordens,
  _regimen_sesions as regimen_sesions,
  _role_has_permissions as role_has_permissions,
  _roles as roles,
  _sedes as sedes,
  _sesion_agendas as sesion_agendas,
  _sesiones as sesiones,
  _solicitud_firmas as solicitud_firmas,
  _temas_votos as temas_votos,
  _tipo_asambleas as tipo_asambleas,
  _tipo_autors as tipo_autors,
  _tipo_cargo_comisions as tipo_cargo_comisions,
  _tipo_categoria_iniciativas as tipo_categoria_iniciativas,
  _tipo_comisions as tipo_comisions,
  _tipo_doc_marcos as tipo_doc_marcos,
  _tipo_eventos as tipo_eventos,
  _tipo_flujos as tipo_flujos,
  _tipo_intervencions as tipo_intervencions,
  _tipo_ordens as tipo_ordens,
  _tipo_presentas as tipo_presentas,
  _tipo_sesions as tipo_sesions,
  _tomo_debates as tomo_debates,
  _turno_comisions as turno_comisions,
  _turnos as turnos,
  _users as users,
  _usuarios as usuarios,
  _validacions as validacions,
};

export type {
  acta_sesionsAttributes,
  acta_sesionsCreationAttributes,
  admin_catsAttributes,
  admin_catsCreationAttributes,
  agendasAttributes,
  agendasCreationAttributes,
  anfitrion_agendasAttributes,
  anfitrion_agendasCreationAttributes,
  anio_sesionsAttributes,
  anio_sesionsCreationAttributes,
  asistencia_votosAttributes,
  asistencia_votosCreationAttributes,
  asuntos_orden_diasAttributes,
  asuntos_orden_diasCreationAttributes,
  autor_iniciativasAttributes,
  autor_iniciativasCreationAttributes,
  autores_comunicadosAttributes,
  autores_comunicadosCreationAttributes,
  avisos_terminosAttributes,
  avisos_terminosCreationAttributes,
  bannersAttributes,
  bannersCreationAttributes,
  certificadosAttributes,
  certificadosCreationAttributes,
  comision_usuariosAttributes,
  comision_usuariosCreationAttributes,
  comisionesAttributes,
  comisionesCreationAttributes,
  comisionsAttributes,
  comisionsCreationAttributes,
  comunicadosAttributes,
  comunicadosCreationAttributes,
  comunicados_sesionsAttributes,
  comunicados_sesionsCreationAttributes,
  datos_usersAttributes,
  datos_usersCreationAttributes,
  debatesAttributes,
  debatesCreationAttributes,
  decisionsAttributes,
  decisionsCreationAttributes,
  decreto_iniciativasAttributes,
  decreto_iniciativasCreationAttributes,
  dependencia_documentosAttributes,
  dependencia_documentosCreationAttributes,
  descripcione_comunicadosAttributes,
  descripcione_comunicadosCreationAttributes,
  dialogosAttributes,
  dialogosCreationAttributes,
  diputadasAttributes,
  diputadasCreationAttributes,
  distritosAttributes,
  distritosCreationAttributes,
  documento_firmasAttributes,
  documento_firmasCreationAttributes,
  documento_turnosAttributes,
  documento_turnosCreationAttributes,
  documentosAttributes,
  documentosCreationAttributes,
  estatus_diputadosAttributes,
  estatus_diputadosCreationAttributes,
  evento_votosAttributes,
  evento_votosCreationAttributes,
  failed_jobsAttributes,
  failed_jobsCreationAttributes,
  fotosAttributes,
  fotosCreationAttributes,
  gacetasAttributes,
  gacetasCreationAttributes,
  generosAttributes,
  generosCreationAttributes,
  informesAttributes,
  informesCreationAttributes,
  iniciativasAttributes,
  iniciativasCreationAttributes,
  integrante_comisionsAttributes,
  integrante_comisionsCreationAttributes,
  integrante_legislaturasAttributes,
  integrante_legislaturasCreationAttributes,
  intervencionesAttributes,
  intervencionesCreationAttributes,
  legislaturasAttributes,
  legislaturasCreationAttributes,
  leyes_informesAttributes,
  leyes_informesCreationAttributes,
  licencias_diputadosAttributes,
  licencias_diputadosCreationAttributes,
  marco_j_sAttributes,
  marco_j_sCreationAttributes,
  marco_juridicosAttributes,
  marco_juridicosCreationAttributes,
  mensajes_votosAttributes,
  mensajes_votosCreationAttributes,
  migrationsAttributes,
  migrationsCreationAttributes,
  model_has_permissionsAttributes,
  model_has_permissionsCreationAttributes,
  model_has_rolesAttributes,
  model_has_rolesCreationAttributes,
  movimientos_diputadosAttributes,
  movimientos_diputadosCreationAttributes,
  municipiosAttributes,
  municipiosCreationAttributes,
  nivel_autorsAttributes,
  nivel_autorsCreationAttributes,
  oauth_access_tokensAttributes,
  oauth_access_tokensCreationAttributes,
  oauth_auth_codesAttributes,
  oauth_auth_codesCreationAttributes,
  oauth_clientsAttributes,
  oauth_clientsCreationAttributes,
  oauth_personal_access_clientsAttributes,
  oauth_personal_access_clientsCreationAttributes,
  oauth_refresh_tokensAttributes,
  oauth_refresh_tokensCreationAttributes,
  orden_diasAttributes,
  orden_diasCreationAttributes,
  otros_autoresAttributes,
  otros_autoresCreationAttributes,
  partidosAttributes,
  partidosCreationAttributes,
  password_resetsAttributes,
  password_resetsCreationAttributes,
  periodo_sesionsAttributes,
  periodo_sesionsCreationAttributes,
  permissionsAttributes,
  permissionsCreationAttributes,
  personal_access_tokensAttributes,
  personal_access_tokensCreationAttributes,
  presenta_puntosAttributes,
  presenta_puntosCreationAttributes,
  presentan_puntosAttributes,
  presentan_puntosCreationAttributes,
  proponentesAttributes,
  proponentesCreationAttributes,
  puntos_ordensAttributes,
  puntos_ordensCreationAttributes,
  regimen_sesionsAttributes,
  regimen_sesionsCreationAttributes,
  role_has_permissionsAttributes,
  role_has_permissionsCreationAttributes,
  rolesAttributes,
  rolesCreationAttributes,
  sedesAttributes,
  sedesCreationAttributes,
  sesion_agendasAttributes,
  sesion_agendasCreationAttributes,
  sesionesAttributes,
  sesionesCreationAttributes,
  solicitud_firmasAttributes,
  solicitud_firmasCreationAttributes,
  temas_votosAttributes,
  temas_votosCreationAttributes,
  tipo_asambleasAttributes,
  tipo_asambleasCreationAttributes,
  tipo_autorsAttributes,
  tipo_autorsCreationAttributes,
  tipo_cargo_comisionsAttributes,
  tipo_cargo_comisionsCreationAttributes,
  tipo_categoria_iniciativasAttributes,
  tipo_categoria_iniciativasCreationAttributes,
  tipo_comisionsAttributes,
  tipo_comisionsCreationAttributes,
  tipo_doc_marcosAttributes,
  tipo_doc_marcosCreationAttributes,
  tipo_eventosAttributes,
  tipo_eventosCreationAttributes,
  tipo_flujosAttributes,
  tipo_flujosCreationAttributes,
  tipo_intervencionsAttributes,
  tipo_intervencionsCreationAttributes,
  tipo_ordensAttributes,
  tipo_ordensCreationAttributes,
  tipo_presentasAttributes,
  tipo_presentasCreationAttributes,
  tipo_sesionsAttributes,
  tipo_sesionsCreationAttributes,
  tomo_debatesAttributes,
  tomo_debatesCreationAttributes,
  turno_comisionsAttributes,
  turno_comisionsCreationAttributes,
  turnosAttributes,
  turnosCreationAttributes,
  usersAttributes,
  usersCreationAttributes,
  usuariosAttributes,
  usuariosCreationAttributes,
  validacionsAttributes,
  validacionsCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const acta_sesions = _acta_sesions.initModel(sequelize);
  const admin_cats = _admin_cats.initModel(sequelize);
  const agendas = _agendas.initModel(sequelize);
  const anfitrion_agendas = _anfitrion_agendas.initModel(sequelize);
  const anio_sesions = _anio_sesions.initModel(sequelize);
  const asistencia_votos = _asistencia_votos.initModel(sequelize);
  const asuntos_orden_dias = _asuntos_orden_dias.initModel(sequelize);
  const autor_iniciativas = _autor_iniciativas.initModel(sequelize);
  const autores_comunicados = _autores_comunicados.initModel(sequelize);
  const avisos_terminos = _avisos_terminos.initModel(sequelize);
  const banners = _banners.initModel(sequelize);
  const certificados = _certificados.initModel(sequelize);
  const comision_usuarios = _comision_usuarios.initModel(sequelize);
  const comisiones = _comisiones.initModel(sequelize);
  const comisions = _comisions.initModel(sequelize);
  const comunicados = _comunicados.initModel(sequelize);
  const comunicados_sesions = _comunicados_sesions.initModel(sequelize);
  const datos_users = _datos_users.initModel(sequelize);
  const debates = _debates.initModel(sequelize);
  const decisions = _decisions.initModel(sequelize);
  const decreto_iniciativas = _decreto_iniciativas.initModel(sequelize);
  const dependencia_documentos = _dependencia_documentos.initModel(sequelize);
  const descripcione_comunicados = _descripcione_comunicados.initModel(sequelize);
  const dialogos = _dialogos.initModel(sequelize);
  const diputadas = _diputadas.initModel(sequelize);
  const distritos = _distritos.initModel(sequelize);
  const documento_firmas = _documento_firmas.initModel(sequelize);
  const documento_turnos = _documento_turnos.initModel(sequelize);
  const documentos = _documentos.initModel(sequelize);
  const estatus_diputados = _estatus_diputados.initModel(sequelize);
  const evento_votos = _evento_votos.initModel(sequelize);
  const failed_jobs = _failed_jobs.initModel(sequelize);
  const fotos = _fotos.initModel(sequelize);
  const gacetas = _gacetas.initModel(sequelize);
  const generos = _generos.initModel(sequelize);
  const informes = _informes.initModel(sequelize);
  const iniciativas = _iniciativas.initModel(sequelize);
  const integrante_comisions = _integrante_comisions.initModel(sequelize);
  const integrante_legislaturas = _integrante_legislaturas.initModel(sequelize);
  const intervenciones = _intervenciones.initModel(sequelize);
  const legislaturas = _legislaturas.initModel(sequelize);
  const leyes_informes = _leyes_informes.initModel(sequelize);
  const licencias_diputados = _licencias_diputados.initModel(sequelize);
  const marco_j_s = _marco_j_s.initModel(sequelize);
  const marco_juridicos = _marco_juridicos.initModel(sequelize);
  const mensajes_votos = _mensajes_votos.initModel(sequelize);
  const migrations = _migrations.initModel(sequelize);
  const model_has_permissions = _model_has_permissions.initModel(sequelize);
  const model_has_roles = _model_has_roles.initModel(sequelize);
  const movimientos_diputados = _movimientos_diputados.initModel(sequelize);
  const municipios = _municipios.initModel(sequelize);
  const nivel_autors = _nivel_autors.initModel(sequelize);
  const oauth_access_tokens = _oauth_access_tokens.initModel(sequelize);
  const oauth_auth_codes = _oauth_auth_codes.initModel(sequelize);
  const oauth_clients = _oauth_clients.initModel(sequelize);
  const oauth_personal_access_clients = _oauth_personal_access_clients.initModel(sequelize);
  const oauth_refresh_tokens = _oauth_refresh_tokens.initModel(sequelize);
  const orden_dias = _orden_dias.initModel(sequelize);
  const otros_autores = _otros_autores.initModel(sequelize);
  const partidos = _partidos.initModel(sequelize);
  const password_resets = _password_resets.initModel(sequelize);
  const periodo_sesions = _periodo_sesions.initModel(sequelize);
  const permissions = _permissions.initModel(sequelize);
  const personal_access_tokens = _personal_access_tokens.initModel(sequelize);
  const presenta_puntos = _presenta_puntos.initModel(sequelize);
  const presentan_puntos = _presentan_puntos.initModel(sequelize);
  const proponentes = _proponentes.initModel(sequelize);
  const puntos_ordens = _puntos_ordens.initModel(sequelize);
  const regimen_sesions = _regimen_sesions.initModel(sequelize);
  const role_has_permissions = _role_has_permissions.initModel(sequelize);
  const roles = _roles.initModel(sequelize);
  const sedes = _sedes.initModel(sequelize);
  const sesion_agendas = _sesion_agendas.initModel(sequelize);
  const sesiones = _sesiones.initModel(sequelize);
  const solicitud_firmas = _solicitud_firmas.initModel(sequelize);
  const temas_votos = _temas_votos.initModel(sequelize);
  const tipo_asambleas = _tipo_asambleas.initModel(sequelize);
  const tipo_autors = _tipo_autors.initModel(sequelize);
  const tipo_cargo_comisions = _tipo_cargo_comisions.initModel(sequelize);
  const tipo_categoria_iniciativas = _tipo_categoria_iniciativas.initModel(sequelize);
  const tipo_comisions = _tipo_comisions.initModel(sequelize);
  const tipo_doc_marcos = _tipo_doc_marcos.initModel(sequelize);
  const tipo_eventos = _tipo_eventos.initModel(sequelize);
  const tipo_flujos = _tipo_flujos.initModel(sequelize);
  const tipo_intervencions = _tipo_intervencions.initModel(sequelize);
  const tipo_ordens = _tipo_ordens.initModel(sequelize);
  const tipo_presentas = _tipo_presentas.initModel(sequelize);
  const tipo_sesions = _tipo_sesions.initModel(sequelize);
  const tomo_debates = _tomo_debates.initModel(sequelize);
  const turno_comisions = _turno_comisions.initModel(sequelize);
  const turnos = _turnos.initModel(sequelize);
  const users = _users.initModel(sequelize);
  const usuarios = _usuarios.initModel(sequelize);
  const validacions = _validacions.initModel(sequelize);

  permissions.belongsToMany(roles, { as: 'role_id_roles', through: role_has_permissions, foreignKey: "permission_id", otherKey: "role_id" });
  roles.belongsToMany(permissions, { as: 'permission_id_permissions', through: role_has_permissions, foreignKey: "role_id", otherKey: "permission_id" });
  anfitrion_agendas.belongsTo(agendas, { as: "agenda", foreignKey: "agenda_id"});
  agendas.hasMany(anfitrion_agendas, { as: "anfitrion_agendas", foreignKey: "agenda_id"});
  sesion_agendas.belongsTo(agendas, { as: "agenda", foreignKey: "agenda_id"});
  agendas.hasMany(sesion_agendas, { as: "sesion_agendas", foreignKey: "agenda_id"});
  sesiones.belongsTo(agendas, { as: "agenda", foreignKey: "agenda_id"});
  agendas.hasMany(sesiones, { as: "sesiones", foreignKey: "agenda_id"});
  turno_comisions.belongsTo(agendas, { as: "id_agenda_agenda", foreignKey: "id_agenda"});
  agendas.hasMany(turno_comisions, { as: "turno_comisions", foreignKey: "id_agenda"});
  sesiones.belongsTo(anio_sesions, { as: "anio", foreignKey: "anio_id"});
  anio_sesions.hasMany(sesiones, { as: "sesiones", foreignKey: "anio_id"});
  integrante_comisions.belongsTo(comisions, { as: "comision", foreignKey: "comision_id"});
  comisions.hasMany(integrante_comisions, { as: "integrante_comisions", foreignKey: "comision_id"});
  turno_comisions.belongsTo(comisions, { as: "id_comision_comision", foreignKey: "id_comision"});
  comisions.hasMany(turno_comisions, { as: "turno_comisions", foreignKey: "id_comision"});
  autores_comunicados.belongsTo(comunicados, { as: "comunicado", foreignKey: "comunicado_id"});
  comunicados.hasMany(autores_comunicados, { as: "autores_comunicados", foreignKey: "comunicado_id"});
  comunicados_sesions.belongsTo(comunicados, { as: "comunicado", foreignKey: "comunicado_id"});
  comunicados.hasMany(comunicados_sesions, { as: "comunicados_sesions", foreignKey: "comunicado_id"});
  descripcione_comunicados.belongsTo(comunicados, { as: "comunicado", foreignKey: "comunicado_id"});
  comunicados.hasMany(descripcione_comunicados, { as: "descripcione_comunicados", foreignKey: "comunicado_id"});
  asistencia_votos.belongsTo(datos_users, { as: "id_diputado_datos_user", foreignKey: "id_diputado"});
  datos_users.hasMany(asistencia_votos, { as: "asistencia_votos", foreignKey: "id_diputado"});
  certificados.belongsTo(datos_users, { as: "id_diputado_datos_user", foreignKey: "id_diputado"});
  datos_users.hasMany(certificados, { as: "certificados", foreignKey: "id_diputado"});
  documentos.belongsTo(datos_users, { as: "id_usuario_registro_datos_user", foreignKey: "id_usuario_registro"});
  datos_users.hasMany(documentos, { as: "documentos", foreignKey: "id_usuario_registro"});
  integrante_legislaturas.belongsTo(datos_users, { as: "dato_dipoficial", foreignKey: "dato_dipoficial_id"});
  datos_users.hasMany(integrante_legislaturas, { as: "integrante_legislaturas", foreignKey: "dato_dipoficial_id"});
  integrante_legislaturas.belongsTo(datos_users, { as: "dato_user", foreignKey: "dato_user_id"});
  datos_users.hasMany(integrante_legislaturas, { as: "dato_user_integrante_legislaturas", foreignKey: "dato_user_id"});
  licencias_diputados.belongsTo(datos_users, { as: "diputado", foreignKey: "diputado_id"});
  datos_users.hasMany(licencias_diputados, { as: "licencias_diputados", foreignKey: "diputado_id"});
  licencias_diputados.belongsTo(datos_users, { as: "diputado_suplente", foreignKey: "diputado_suplente_id"});
  datos_users.hasMany(licencias_diputados, { as: "diputado_suplente_licencias_diputados", foreignKey: "diputado_suplente_id"});
  mensajes_votos.belongsTo(datos_users, { as: "id_diputado_datos_user", foreignKey: "id_diputado"});
  datos_users.hasMany(mensajes_votos, { as: "mensajes_votos", foreignKey: "id_diputado"});
  mensajes_votos.belongsTo(datos_users, { as: "id_usuario_registra_datos_user", foreignKey: "id_usuario_registra"});
  datos_users.hasMany(mensajes_votos, { as: "id_usuario_registra_mensajes_votos", foreignKey: "id_usuario_registra"});
  movimientos_diputados.belongsTo(datos_users, { as: "dato_user", foreignKey: "dato_user_id"});
  datos_users.hasMany(movimientos_diputados, { as: "movimientos_diputados", foreignKey: "dato_user_id"});
  presenta_puntos.belongsTo(datos_users, { as: "id_presenta_datos_user", foreignKey: "id_presenta"});
  datos_users.hasMany(presenta_puntos, { as: "presenta_puntos", foreignKey: "id_presenta"});
  presentan_puntos.belongsTo(datos_users, { as: "id_diputado_datos_user", foreignKey: "id_diputado"});
  datos_users.hasMany(presentan_puntos, { as: "presentan_puntos", foreignKey: "id_diputado"});
  puntos_ordens.belongsTo(datos_users, { as: "tribuna_datos_user", foreignKey: "tribuna"});
  datos_users.hasMany(puntos_ordens, { as: "puntos_ordens", foreignKey: "tribuna"});
  sesiones.belongsTo(datos_users, { as: "usuario_cierra", foreignKey: "usuario_cierra_id"});
  datos_users.hasMany(sesiones, { as: "sesiones", foreignKey: "usuario_cierra_id"});
  sesiones.belongsTo(datos_users, { as: "usuario_registro", foreignKey: "usuario_registro_id"});
  datos_users.hasMany(sesiones, { as: "usuario_registro_sesiones", foreignKey: "usuario_registro_id"});
  solicitud_firmas.belongsTo(datos_users, { as: "id_diputado_datos_user", foreignKey: "id_diputado"});
  datos_users.hasMany(solicitud_firmas, { as: "solicitud_firmas", foreignKey: "id_diputado"});
  turnos.belongsTo(datos_users, { as: "id_diputado_datos_user", foreignKey: "id_diputado"});
  datos_users.hasMany(turnos, { as: "turnos", foreignKey: "id_diputado"});
  integrante_legislaturas.belongsTo(distritos, { as: "distrito", foreignKey: "distrito_id"});
  distritos.hasMany(integrante_legislaturas, { as: "integrante_legislaturas", foreignKey: "distrito_id"});
  documento_turnos.belongsTo(documentos, { as: "documento", foreignKey: "documento_id"});
  documentos.hasMany(documento_turnos, { as: "documento_turnos", foreignKey: "documento_id"});
  turnos.belongsTo(documentos, { as: "id_documento_documento", foreignKey: "id_documento"});
  documentos.hasMany(turnos, { as: "turnos", foreignKey: "id_documento"});
  licencias_diputados.belongsTo(estatus_diputados, { as: "estatus_diputado_estatus_diputado", foreignKey: "estatus_diputado"});
  estatus_diputados.hasMany(licencias_diputados, { as: "licencias_diputados", foreignKey: "estatus_diputado"});
  movimientos_diputados.belongsTo(estatus_diputados, { as: "estatus_diputado", foreignKey: "estatus_diputado_id"});
  estatus_diputados.hasMany(movimientos_diputados, { as: "movimientos_diputados", foreignKey: "estatus_diputado_id"});
  datos_users.belongsTo(generos, { as: "genero", foreignKey: "genero_id"});
  generos.hasMany(datos_users, { as: "datos_users", foreignKey: "genero_id"});
  leyes_informes.belongsTo(informes, { as: "informe", foreignKey: "informes_id"});
  informes.hasMany(leyes_informes, { as: "leyes_informes", foreignKey: "informes_id"});
  autor_iniciativas.belongsTo(iniciativas, { as: "iniciativa", foreignKey: "iniciativa_id"});
  iniciativas.hasMany(autor_iniciativas, { as: "autor_iniciativas", foreignKey: "iniciativa_id"});
  decreto_iniciativas.belongsTo(iniciativas, { as: "iniciativa", foreignKey: "iniciativa_id"});
  iniciativas.hasMany(decreto_iniciativas, { as: "decreto_iniciativas", foreignKey: "iniciativa_id"});
  informes.belongsTo(integrante_legislaturas, { as: "integrante_legislatura", foreignKey: "integrante_legislatura_id"});
  integrante_legislaturas.hasMany(informes, { as: "informes", foreignKey: "integrante_legislatura_id"});
  integrante_comisions.belongsTo(integrante_legislaturas, { as: "integrante_legislatura", foreignKey: "integrante_legislatura_id"});
  integrante_legislaturas.hasMany(integrante_comisions, { as: "integrante_comisions", foreignKey: "integrante_legislatura_id"});
  integrante_legislaturas.belongsTo(legislaturas, { as: "legislatura", foreignKey: "legislatura_id"});
  legislaturas.hasMany(integrante_legislaturas, { as: "integrante_legislaturas", foreignKey: "legislatura_id"});
  dependencia_documentos.belongsTo(marco_j_s, { as: "id_marcoj_marco_j_", foreignKey: "id_marcoj"});
  marco_j_s.hasMany(dependencia_documentos, { as: "dependencia_documentos", foreignKey: "id_marcoj"});
  distritos.belongsTo(municipios, { as: "municipio", foreignKey: "municipio_id"});
  municipios.hasMany(distritos, { as: "distritos", foreignKey: "municipio_id"});
  autor_iniciativas.belongsTo(nivel_autors, { as: "nivel_autor", foreignKey: "nivel_autor_id"});
  nivel_autors.hasMany(autor_iniciativas, { as: "autor_iniciativas", foreignKey: "nivel_autor_id"});
  integrante_legislaturas.belongsTo(partidos, { as: "partido", foreignKey: "partido_id"});
  partidos.hasMany(integrante_legislaturas, { as: "integrante_legislaturas", foreignKey: "partido_id"});
  sesiones.belongsTo(periodo_sesions, { as: "periodo", foreignKey: "periodo_id"});
  periodo_sesions.hasMany(sesiones, { as: "sesiones", foreignKey: "periodo_id"});
  model_has_permissions.belongsTo(permissions, { as: "permission", foreignKey: "permission_id"});
  permissions.hasMany(model_has_permissions, { as: "model_has_permissions", foreignKey: "permission_id"});
  role_has_permissions.belongsTo(permissions, { as: "permission", foreignKey: "permission_id"});
  permissions.hasMany(role_has_permissions, { as: "role_has_permissions", foreignKey: "permission_id"});
  presenta_puntos.belongsTo(puntos_ordens, { as: "id_punto_puntos_orden", foreignKey: "id_punto"});
  puntos_ordens.hasMany(presenta_puntos, { as: "presenta_puntos", foreignKey: "id_punto"});
  presentan_puntos.belongsTo(puntos_ordens, { as: "id_punto_puntos_orden", foreignKey: "id_punto"});
  puntos_ordens.hasMany(presentan_puntos, { as: "presentan_puntos", foreignKey: "id_punto"});
  temas_votos.belongsTo(puntos_ordens, { as: "id_punto_puntos_orden", foreignKey: "id_punto"});
  puntos_ordens.hasMany(temas_votos, { as: "temas_votos", foreignKey: "id_punto"});
  turno_comisions.belongsTo(puntos_ordens, { as: "id_punto_orden_puntos_orden", foreignKey: "id_punto_orden"});
  puntos_ordens.hasMany(turno_comisions, { as: "turno_comisions", foreignKey: "id_punto_orden"});
  sesiones.belongsTo(regimen_sesions, { as: "regimen", foreignKey: "regimen_id"});
  regimen_sesions.hasMany(sesiones, { as: "sesiones", foreignKey: "regimen_id"});
  model_has_roles.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(model_has_roles, { as: "model_has_roles", foreignKey: "role_id"});
  role_has_permissions.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(role_has_permissions, { as: "role_has_permissions", foreignKey: "role_id"});
  agendas.belongsTo(sedes, { as: "sede", foreignKey: "sede_id"});
  sedes.hasMany(agendas, { as: "agendas", foreignKey: "sede_id"});
  asistencia_votos.belongsTo(sesiones, { as: "id_sesion_sesione", foreignKey: "id_sesion"});
  sesiones.hasMany(asistencia_votos, { as: "asistencia_votos", foreignKey: "id_sesion"});
  asuntos_orden_dias.belongsTo(sesiones, { as: "id_evento_sesione", foreignKey: "id_evento"});
  sesiones.hasMany(asuntos_orden_dias, { as: "asuntos_orden_dia", foreignKey: "id_evento"});
  comunicados_sesions.belongsTo(sesiones, { as: "id_sesion_sesione", foreignKey: "id_sesion"});
  sesiones.hasMany(comunicados_sesions, { as: "comunicados_sesions", foreignKey: "id_sesion"});
  mensajes_votos.belongsTo(sesiones, { as: "id_evento_sesione", foreignKey: "id_evento"});
  sesiones.hasMany(mensajes_votos, { as: "mensajes_votos", foreignKey: "id_evento"});
  sesion_agendas.belongsTo(sesiones, { as: "sesione", foreignKey: "sesiones_id"});
  sesiones.hasMany(sesion_agendas, { as: "sesion_agendas", foreignKey: "sesiones_id"});
  temas_votos.belongsTo(sesiones, { as: "id_evento_sesione", foreignKey: "id_evento"});
  sesiones.hasMany(temas_votos, { as: "temas_votos", foreignKey: "id_evento"});
  mensajes_votos.belongsTo(temas_votos, { as: "id_tema_voto_temas_voto", foreignKey: "id_tema_voto"});
  temas_votos.hasMany(mensajes_votos, { as: "mensajes_votos", foreignKey: "id_tema_voto"});
  sesiones.belongsTo(tipo_asambleas, { as: "tipo_asamblea", foreignKey: "tipo_asamblea_id"});
  tipo_asambleas.hasMany(sesiones, { as: "sesiones", foreignKey: "tipo_asamblea_id"});
  integrante_comisions.belongsTo(tipo_cargo_comisions, { as: "tipo_cargo_comision", foreignKey: "tipo_cargo_comision_id"});
  tipo_cargo_comisions.hasMany(integrante_comisions, { as: "integrante_comisions", foreignKey: "tipo_cargo_comision_id"});
  documento_firmas.belongsTo(tipo_categoria_iniciativas, { as: "id_tipo_doc_tipo_categoria_iniciativa", foreignKey: "id_tipo_doc"});
  tipo_categoria_iniciativas.hasMany(documento_firmas, { as: "documento_firmas", foreignKey: "id_tipo_doc"});
  documentos.belongsTo(tipo_categoria_iniciativas, { as: "id_tipo_doc_tipo_categoria_iniciativa", foreignKey: "id_tipo_doc"});
  tipo_categoria_iniciativas.hasMany(documentos, { as: "documentos", foreignKey: "id_tipo_doc"});
  puntos_ordens.belongsTo(tipo_categoria_iniciativas, { as: "id_tipo_tipo_categoria_iniciativa", foreignKey: "id_tipo"});
  tipo_categoria_iniciativas.hasMany(puntos_ordens, { as: "puntos_ordens", foreignKey: "id_tipo"});
  comisions.belongsTo(tipo_comisions, { as: "tipo_comision", foreignKey: "tipo_comision_id"});
  tipo_comisions.hasMany(comisions, { as: "comisions", foreignKey: "tipo_comision_id"});
  agendas.belongsTo(tipo_eventos, { as: "tipo_evento", foreignKey: "tipo_evento_id"});
  tipo_eventos.hasMany(agendas, { as: "agendas", foreignKey: "tipo_evento_id"});
  presentan_puntos.belongsTo(tipo_presentas, { as: "id_tipo_presenta_tipo_presenta", foreignKey: "id_tipo_presenta"});
  tipo_presentas.hasMany(presentan_puntos, { as: "presentan_puntos", foreignKey: "id_tipo_presenta"});
  sesiones.belongsTo(tipo_sesions, { as: "tipo_sesion", foreignKey: "tipo_sesion_id"});
  tipo_sesions.hasMany(sesiones, { as: "sesiones", foreignKey: "tipo_sesion_id"});
  debates.belongsTo(tomo_debates, { as: "id_tomo_tomo_debate", foreignKey: "id_tomo"});
  tomo_debates.hasMany(debates, { as: "debates", foreignKey: "id_tomo"});
  certificados.belongsTo(users, { as: "id_usuario_registro_user", foreignKey: "id_usuario_registro"});
  users.hasMany(certificados, { as: "certificados", foreignKey: "id_usuario_registro"});
  datos_users.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(datos_users, { as: "datos_users", foreignKey: "user_id"});
  documento_firmas.belongsTo(users, { as: "id_usuario_registro_user", foreignKey: "id_usuario_registro"});
  users.hasMany(documento_firmas, { as: "documento_firmas", foreignKey: "id_usuario_registro"});
  usuarios.belongsTo(users, { as: "id_users_user", foreignKey: "id_users"});
  users.hasMany(usuarios, { as: "usuarios", foreignKey: "id_users"});
  usuarios.belongsTo(users, { as: "id_usuario_registra_user", foreignKey: "id_usuario_registra"});
  users.hasMany(usuarios, { as: "id_usuario_registra_usuarios", foreignKey: "id_usuario_registra"});

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
