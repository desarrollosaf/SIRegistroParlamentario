import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { asistencia_votos, asistencia_votosId } from './asistencia_votos';
import type { certificados, certificadosId } from './certificados';
import type { documentos, documentosId } from './documentos';
import type { generos, generosId } from './generos';
import type { integrante_legislaturas, integrante_legislaturasId } from './integrante_legislaturas';
import type { licencias_diputados, licencias_diputadosId } from './licencias_diputados';
import type { mensajes_votos, mensajes_votosId } from './mensajes_votos';
import type { movimientos_diputados, movimientos_diputadosId } from './movimientos_diputados';
import type { presenta_puntos, presenta_puntosId } from './presenta_puntos';
import type { presentan_puntos, presentan_puntosId } from './presentan_puntos';
import type { puntos_ordens, puntos_ordensId } from './puntos_ordens';
import type { sesiones, sesionesId } from './sesiones';
import type { solicitud_firmas, solicitud_firmasId } from './solicitud_firmas';
import type { turnos, turnosId } from './turnos';
import type { users, usersId } from './users';

export interface datos_usersAttributes {
  id: string;
  apaterno: string;
  amaterno: string;
  nombres: string;
  intentos: number;
  bloqueo: number;
  tipo_diputado: number;
  rfc?: string;
  descripcion?: string;
  shortname?: string;
  ext?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  link_web?: string;
  ubicacion?: string;
  genero_id?: string;
  status: number;
  user_id: string;
  cel?: string;
  path_foto?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type datos_usersPk = "id";
export type datos_usersId = datos_users[datos_usersPk];
export type datos_usersOptionalAttributes = "intentos" | "bloqueo" | "tipo_diputado" | "rfc" | "descripcion" | "shortname" | "ext" | "facebook" | "twitter" | "instagram" | "link_web" | "ubicacion" | "genero_id" | "status" | "cel" | "path_foto" | "created_at" | "updated_at" | "deleted_at";
export type datos_usersCreationAttributes = Optional<datos_usersAttributes, datos_usersOptionalAttributes>;

export class datos_users extends Model<datos_usersAttributes, datos_usersCreationAttributes> implements datos_usersAttributes {
  id!: string;
  apaterno!: string;
  amaterno!: string;
  nombres!: string;
  intentos!: number;
  bloqueo!: number;
  tipo_diputado!: number;
  rfc?: string;
  descripcion?: string;
  shortname?: string;
  ext?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  link_web?: string;
  ubicacion?: string;
  genero_id?: string;
  status!: number;
  user_id!: string;
  cel?: string;
  path_foto?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  // datos_users hasMany asistencia_votos via id_diputado
  asistencia_votos!: asistencia_votos[];
  getAsistencia_votos!: Sequelize.HasManyGetAssociationsMixin<asistencia_votos>;
  setAsistencia_votos!: Sequelize.HasManySetAssociationsMixin<asistencia_votos, asistencia_votosId>;
  addAsistencia_voto!: Sequelize.HasManyAddAssociationMixin<asistencia_votos, asistencia_votosId>;
  addAsistencia_votos!: Sequelize.HasManyAddAssociationsMixin<asistencia_votos, asistencia_votosId>;
  createAsistencia_voto!: Sequelize.HasManyCreateAssociationMixin<asistencia_votos>;
  removeAsistencia_voto!: Sequelize.HasManyRemoveAssociationMixin<asistencia_votos, asistencia_votosId>;
  removeAsistencia_votos!: Sequelize.HasManyRemoveAssociationsMixin<asistencia_votos, asistencia_votosId>;
  hasAsistencia_voto!: Sequelize.HasManyHasAssociationMixin<asistencia_votos, asistencia_votosId>;
  hasAsistencia_votos!: Sequelize.HasManyHasAssociationsMixin<asistencia_votos, asistencia_votosId>;
  countAsistencia_votos!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany certificados via id_diputado
  certificados!: certificados[];
  getCertificados!: Sequelize.HasManyGetAssociationsMixin<certificados>;
  setCertificados!: Sequelize.HasManySetAssociationsMixin<certificados, certificadosId>;
  addCertificado!: Sequelize.HasManyAddAssociationMixin<certificados, certificadosId>;
  addCertificados!: Sequelize.HasManyAddAssociationsMixin<certificados, certificadosId>;
  createCertificado!: Sequelize.HasManyCreateAssociationMixin<certificados>;
  removeCertificado!: Sequelize.HasManyRemoveAssociationMixin<certificados, certificadosId>;
  removeCertificados!: Sequelize.HasManyRemoveAssociationsMixin<certificados, certificadosId>;
  hasCertificado!: Sequelize.HasManyHasAssociationMixin<certificados, certificadosId>;
  hasCertificados!: Sequelize.HasManyHasAssociationsMixin<certificados, certificadosId>;
  countCertificados!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany documentos via id_usuario_registro
  documentos!: documentos[];
  getDocumentos!: Sequelize.HasManyGetAssociationsMixin<documentos>;
  setDocumentos!: Sequelize.HasManySetAssociationsMixin<documentos, documentosId>;
  addDocumento!: Sequelize.HasManyAddAssociationMixin<documentos, documentosId>;
  addDocumentos!: Sequelize.HasManyAddAssociationsMixin<documentos, documentosId>;
  createDocumento!: Sequelize.HasManyCreateAssociationMixin<documentos>;
  removeDocumento!: Sequelize.HasManyRemoveAssociationMixin<documentos, documentosId>;
  removeDocumentos!: Sequelize.HasManyRemoveAssociationsMixin<documentos, documentosId>;
  hasDocumento!: Sequelize.HasManyHasAssociationMixin<documentos, documentosId>;
  hasDocumentos!: Sequelize.HasManyHasAssociationsMixin<documentos, documentosId>;
  countDocumentos!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany integrante_legislaturas via dato_dipoficial_id
  integrante_legislaturas!: integrante_legislaturas[];
  getIntegrante_legislaturas!: Sequelize.HasManyGetAssociationsMixin<integrante_legislaturas>;
  setIntegrante_legislaturas!: Sequelize.HasManySetAssociationsMixin<integrante_legislaturas, integrante_legislaturasId>;
  addIntegrante_legislatura!: Sequelize.HasManyAddAssociationMixin<integrante_legislaturas, integrante_legislaturasId>;
  addIntegrante_legislaturas!: Sequelize.HasManyAddAssociationsMixin<integrante_legislaturas, integrante_legislaturasId>;
  createIntegrante_legislatura!: Sequelize.HasManyCreateAssociationMixin<integrante_legislaturas>;
  removeIntegrante_legislatura!: Sequelize.HasManyRemoveAssociationMixin<integrante_legislaturas, integrante_legislaturasId>;
  removeIntegrante_legislaturas!: Sequelize.HasManyRemoveAssociationsMixin<integrante_legislaturas, integrante_legislaturasId>;
  hasIntegrante_legislatura!: Sequelize.HasManyHasAssociationMixin<integrante_legislaturas, integrante_legislaturasId>;
  hasIntegrante_legislaturas!: Sequelize.HasManyHasAssociationsMixin<integrante_legislaturas, integrante_legislaturasId>;
  countIntegrante_legislaturas!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany integrante_legislaturas via dato_user_id
  dato_user_integrante_legislaturas!: integrante_legislaturas[];
  getDato_user_integrante_legislaturas!: Sequelize.HasManyGetAssociationsMixin<integrante_legislaturas>;
  setDato_user_integrante_legislaturas!: Sequelize.HasManySetAssociationsMixin<integrante_legislaturas, integrante_legislaturasId>;
  addDato_user_integrante_legislatura!: Sequelize.HasManyAddAssociationMixin<integrante_legislaturas, integrante_legislaturasId>;
  addDato_user_integrante_legislaturas!: Sequelize.HasManyAddAssociationsMixin<integrante_legislaturas, integrante_legislaturasId>;
  createDato_user_integrante_legislatura!: Sequelize.HasManyCreateAssociationMixin<integrante_legislaturas>;
  removeDato_user_integrante_legislatura!: Sequelize.HasManyRemoveAssociationMixin<integrante_legislaturas, integrante_legislaturasId>;
  removeDato_user_integrante_legislaturas!: Sequelize.HasManyRemoveAssociationsMixin<integrante_legislaturas, integrante_legislaturasId>;
  hasDato_user_integrante_legislatura!: Sequelize.HasManyHasAssociationMixin<integrante_legislaturas, integrante_legislaturasId>;
  hasDato_user_integrante_legislaturas!: Sequelize.HasManyHasAssociationsMixin<integrante_legislaturas, integrante_legislaturasId>;
  countDato_user_integrante_legislaturas!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany licencias_diputados via diputado_id
  licencias_diputados!: licencias_diputados[];
  getLicencias_diputados!: Sequelize.HasManyGetAssociationsMixin<licencias_diputados>;
  setLicencias_diputados!: Sequelize.HasManySetAssociationsMixin<licencias_diputados, licencias_diputadosId>;
  addLicencias_diputado!: Sequelize.HasManyAddAssociationMixin<licencias_diputados, licencias_diputadosId>;
  addLicencias_diputados!: Sequelize.HasManyAddAssociationsMixin<licencias_diputados, licencias_diputadosId>;
  createLicencias_diputado!: Sequelize.HasManyCreateAssociationMixin<licencias_diputados>;
  removeLicencias_diputado!: Sequelize.HasManyRemoveAssociationMixin<licencias_diputados, licencias_diputadosId>;
  removeLicencias_diputados!: Sequelize.HasManyRemoveAssociationsMixin<licencias_diputados, licencias_diputadosId>;
  hasLicencias_diputado!: Sequelize.HasManyHasAssociationMixin<licencias_diputados, licencias_diputadosId>;
  hasLicencias_diputados!: Sequelize.HasManyHasAssociationsMixin<licencias_diputados, licencias_diputadosId>;
  countLicencias_diputados!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany licencias_diputados via diputado_suplente_id
  diputado_suplente_licencias_diputados!: licencias_diputados[];
  getDiputado_suplente_licencias_diputados!: Sequelize.HasManyGetAssociationsMixin<licencias_diputados>;
  setDiputado_suplente_licencias_diputados!: Sequelize.HasManySetAssociationsMixin<licencias_diputados, licencias_diputadosId>;
  addDiputado_suplente_licencias_diputado!: Sequelize.HasManyAddAssociationMixin<licencias_diputados, licencias_diputadosId>;
  addDiputado_suplente_licencias_diputados!: Sequelize.HasManyAddAssociationsMixin<licencias_diputados, licencias_diputadosId>;
  createDiputado_suplente_licencias_diputado!: Sequelize.HasManyCreateAssociationMixin<licencias_diputados>;
  removeDiputado_suplente_licencias_diputado!: Sequelize.HasManyRemoveAssociationMixin<licencias_diputados, licencias_diputadosId>;
  removeDiputado_suplente_licencias_diputados!: Sequelize.HasManyRemoveAssociationsMixin<licencias_diputados, licencias_diputadosId>;
  hasDiputado_suplente_licencias_diputado!: Sequelize.HasManyHasAssociationMixin<licencias_diputados, licencias_diputadosId>;
  hasDiputado_suplente_licencias_diputados!: Sequelize.HasManyHasAssociationsMixin<licencias_diputados, licencias_diputadosId>;
  countDiputado_suplente_licencias_diputados!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany mensajes_votos via id_diputado
  mensajes_votos!: mensajes_votos[];
  getMensajes_votos!: Sequelize.HasManyGetAssociationsMixin<mensajes_votos>;
  setMensajes_votos!: Sequelize.HasManySetAssociationsMixin<mensajes_votos, mensajes_votosId>;
  addMensajes_voto!: Sequelize.HasManyAddAssociationMixin<mensajes_votos, mensajes_votosId>;
  addMensajes_votos!: Sequelize.HasManyAddAssociationsMixin<mensajes_votos, mensajes_votosId>;
  createMensajes_voto!: Sequelize.HasManyCreateAssociationMixin<mensajes_votos>;
  removeMensajes_voto!: Sequelize.HasManyRemoveAssociationMixin<mensajes_votos, mensajes_votosId>;
  removeMensajes_votos!: Sequelize.HasManyRemoveAssociationsMixin<mensajes_votos, mensajes_votosId>;
  hasMensajes_voto!: Sequelize.HasManyHasAssociationMixin<mensajes_votos, mensajes_votosId>;
  hasMensajes_votos!: Sequelize.HasManyHasAssociationsMixin<mensajes_votos, mensajes_votosId>;
  countMensajes_votos!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany mensajes_votos via id_usuario_registra
  id_usuario_registra_mensajes_votos!: mensajes_votos[];
  getId_usuario_registra_mensajes_votos!: Sequelize.HasManyGetAssociationsMixin<mensajes_votos>;
  setId_usuario_registra_mensajes_votos!: Sequelize.HasManySetAssociationsMixin<mensajes_votos, mensajes_votosId>;
  addId_usuario_registra_mensajes_voto!: Sequelize.HasManyAddAssociationMixin<mensajes_votos, mensajes_votosId>;
  addId_usuario_registra_mensajes_votos!: Sequelize.HasManyAddAssociationsMixin<mensajes_votos, mensajes_votosId>;
  createId_usuario_registra_mensajes_voto!: Sequelize.HasManyCreateAssociationMixin<mensajes_votos>;
  removeId_usuario_registra_mensajes_voto!: Sequelize.HasManyRemoveAssociationMixin<mensajes_votos, mensajes_votosId>;
  removeId_usuario_registra_mensajes_votos!: Sequelize.HasManyRemoveAssociationsMixin<mensajes_votos, mensajes_votosId>;
  hasId_usuario_registra_mensajes_voto!: Sequelize.HasManyHasAssociationMixin<mensajes_votos, mensajes_votosId>;
  hasId_usuario_registra_mensajes_votos!: Sequelize.HasManyHasAssociationsMixin<mensajes_votos, mensajes_votosId>;
  countId_usuario_registra_mensajes_votos!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany movimientos_diputados via dato_user_id
  movimientos_diputados!: movimientos_diputados[];
  getMovimientos_diputados!: Sequelize.HasManyGetAssociationsMixin<movimientos_diputados>;
  setMovimientos_diputados!: Sequelize.HasManySetAssociationsMixin<movimientos_diputados, movimientos_diputadosId>;
  addMovimientos_diputado!: Sequelize.HasManyAddAssociationMixin<movimientos_diputados, movimientos_diputadosId>;
  addMovimientos_diputados!: Sequelize.HasManyAddAssociationsMixin<movimientos_diputados, movimientos_diputadosId>;
  createMovimientos_diputado!: Sequelize.HasManyCreateAssociationMixin<movimientos_diputados>;
  removeMovimientos_diputado!: Sequelize.HasManyRemoveAssociationMixin<movimientos_diputados, movimientos_diputadosId>;
  removeMovimientos_diputados!: Sequelize.HasManyRemoveAssociationsMixin<movimientos_diputados, movimientos_diputadosId>;
  hasMovimientos_diputado!: Sequelize.HasManyHasAssociationMixin<movimientos_diputados, movimientos_diputadosId>;
  hasMovimientos_diputados!: Sequelize.HasManyHasAssociationsMixin<movimientos_diputados, movimientos_diputadosId>;
  countMovimientos_diputados!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany presenta_puntos via id_presenta
  presenta_puntos!: presenta_puntos[];
  getPresenta_puntos!: Sequelize.HasManyGetAssociationsMixin<presenta_puntos>;
  setPresenta_puntos!: Sequelize.HasManySetAssociationsMixin<presenta_puntos, presenta_puntosId>;
  addPresenta_punto!: Sequelize.HasManyAddAssociationMixin<presenta_puntos, presenta_puntosId>;
  addPresenta_puntos!: Sequelize.HasManyAddAssociationsMixin<presenta_puntos, presenta_puntosId>;
  createPresenta_punto!: Sequelize.HasManyCreateAssociationMixin<presenta_puntos>;
  removePresenta_punto!: Sequelize.HasManyRemoveAssociationMixin<presenta_puntos, presenta_puntosId>;
  removePresenta_puntos!: Sequelize.HasManyRemoveAssociationsMixin<presenta_puntos, presenta_puntosId>;
  hasPresenta_punto!: Sequelize.HasManyHasAssociationMixin<presenta_puntos, presenta_puntosId>;
  hasPresenta_puntos!: Sequelize.HasManyHasAssociationsMixin<presenta_puntos, presenta_puntosId>;
  countPresenta_puntos!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany presentan_puntos via id_diputado
  presentan_puntos!: presentan_puntos[];
  getPresentan_puntos!: Sequelize.HasManyGetAssociationsMixin<presentan_puntos>;
  setPresentan_puntos!: Sequelize.HasManySetAssociationsMixin<presentan_puntos, presentan_puntosId>;
  addPresentan_punto!: Sequelize.HasManyAddAssociationMixin<presentan_puntos, presentan_puntosId>;
  addPresentan_puntos!: Sequelize.HasManyAddAssociationsMixin<presentan_puntos, presentan_puntosId>;
  createPresentan_punto!: Sequelize.HasManyCreateAssociationMixin<presentan_puntos>;
  removePresentan_punto!: Sequelize.HasManyRemoveAssociationMixin<presentan_puntos, presentan_puntosId>;
  removePresentan_puntos!: Sequelize.HasManyRemoveAssociationsMixin<presentan_puntos, presentan_puntosId>;
  hasPresentan_punto!: Sequelize.HasManyHasAssociationMixin<presentan_puntos, presentan_puntosId>;
  hasPresentan_puntos!: Sequelize.HasManyHasAssociationsMixin<presentan_puntos, presentan_puntosId>;
  countPresentan_puntos!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany puntos_ordens via tribuna
  puntos_ordens!: puntos_ordens[];
  getPuntos_ordens!: Sequelize.HasManyGetAssociationsMixin<puntos_ordens>;
  setPuntos_ordens!: Sequelize.HasManySetAssociationsMixin<puntos_ordens, puntos_ordensId>;
  addPuntos_orden!: Sequelize.HasManyAddAssociationMixin<puntos_ordens, puntos_ordensId>;
  addPuntos_ordens!: Sequelize.HasManyAddAssociationsMixin<puntos_ordens, puntos_ordensId>;
  createPuntos_orden!: Sequelize.HasManyCreateAssociationMixin<puntos_ordens>;
  removePuntos_orden!: Sequelize.HasManyRemoveAssociationMixin<puntos_ordens, puntos_ordensId>;
  removePuntos_ordens!: Sequelize.HasManyRemoveAssociationsMixin<puntos_ordens, puntos_ordensId>;
  hasPuntos_orden!: Sequelize.HasManyHasAssociationMixin<puntos_ordens, puntos_ordensId>;
  hasPuntos_ordens!: Sequelize.HasManyHasAssociationsMixin<puntos_ordens, puntos_ordensId>;
  countPuntos_ordens!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany sesiones via usuario_cierra_id
  sesiones!: sesiones[];
  getSesiones!: Sequelize.HasManyGetAssociationsMixin<sesiones>;
  setSesiones!: Sequelize.HasManySetAssociationsMixin<sesiones, sesionesId>;
  addSesione!: Sequelize.HasManyAddAssociationMixin<sesiones, sesionesId>;
  addSesiones!: Sequelize.HasManyAddAssociationsMixin<sesiones, sesionesId>;
  createSesione!: Sequelize.HasManyCreateAssociationMixin<sesiones>;
  removeSesione!: Sequelize.HasManyRemoveAssociationMixin<sesiones, sesionesId>;
  removeSesiones!: Sequelize.HasManyRemoveAssociationsMixin<sesiones, sesionesId>;
  hasSesione!: Sequelize.HasManyHasAssociationMixin<sesiones, sesionesId>;
  hasSesiones!: Sequelize.HasManyHasAssociationsMixin<sesiones, sesionesId>;
  countSesiones!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany sesiones via usuario_registro_id
  usuario_registro_sesiones!: sesiones[];
  getUsuario_registro_sesiones!: Sequelize.HasManyGetAssociationsMixin<sesiones>;
  setUsuario_registro_sesiones!: Sequelize.HasManySetAssociationsMixin<sesiones, sesionesId>;
  addUsuario_registro_sesione!: Sequelize.HasManyAddAssociationMixin<sesiones, sesionesId>;
  addUsuario_registro_sesiones!: Sequelize.HasManyAddAssociationsMixin<sesiones, sesionesId>;
  createUsuario_registro_sesione!: Sequelize.HasManyCreateAssociationMixin<sesiones>;
  removeUsuario_registro_sesione!: Sequelize.HasManyRemoveAssociationMixin<sesiones, sesionesId>;
  removeUsuario_registro_sesiones!: Sequelize.HasManyRemoveAssociationsMixin<sesiones, sesionesId>;
  hasUsuario_registro_sesione!: Sequelize.HasManyHasAssociationMixin<sesiones, sesionesId>;
  hasUsuario_registro_sesiones!: Sequelize.HasManyHasAssociationsMixin<sesiones, sesionesId>;
  countUsuario_registro_sesiones!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany solicitud_firmas via id_diputado
  solicitud_firmas!: solicitud_firmas[];
  getSolicitud_firmas!: Sequelize.HasManyGetAssociationsMixin<solicitud_firmas>;
  setSolicitud_firmas!: Sequelize.HasManySetAssociationsMixin<solicitud_firmas, solicitud_firmasId>;
  addSolicitud_firma!: Sequelize.HasManyAddAssociationMixin<solicitud_firmas, solicitud_firmasId>;
  addSolicitud_firmas!: Sequelize.HasManyAddAssociationsMixin<solicitud_firmas, solicitud_firmasId>;
  createSolicitud_firma!: Sequelize.HasManyCreateAssociationMixin<solicitud_firmas>;
  removeSolicitud_firma!: Sequelize.HasManyRemoveAssociationMixin<solicitud_firmas, solicitud_firmasId>;
  removeSolicitud_firmas!: Sequelize.HasManyRemoveAssociationsMixin<solicitud_firmas, solicitud_firmasId>;
  hasSolicitud_firma!: Sequelize.HasManyHasAssociationMixin<solicitud_firmas, solicitud_firmasId>;
  hasSolicitud_firmas!: Sequelize.HasManyHasAssociationsMixin<solicitud_firmas, solicitud_firmasId>;
  countSolicitud_firmas!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users hasMany turnos via id_diputado
  turnos!: turnos[];
  getTurnos!: Sequelize.HasManyGetAssociationsMixin<turnos>;
  setTurnos!: Sequelize.HasManySetAssociationsMixin<turnos, turnosId>;
  addTurno!: Sequelize.HasManyAddAssociationMixin<turnos, turnosId>;
  addTurnos!: Sequelize.HasManyAddAssociationsMixin<turnos, turnosId>;
  createTurno!: Sequelize.HasManyCreateAssociationMixin<turnos>;
  removeTurno!: Sequelize.HasManyRemoveAssociationMixin<turnos, turnosId>;
  removeTurnos!: Sequelize.HasManyRemoveAssociationsMixin<turnos, turnosId>;
  hasTurno!: Sequelize.HasManyHasAssociationMixin<turnos, turnosId>;
  hasTurnos!: Sequelize.HasManyHasAssociationsMixin<turnos, turnosId>;
  countTurnos!: Sequelize.HasManyCountAssociationsMixin;
  // datos_users belongsTo generos via genero_id
  genero!: generos;
  getGenero!: Sequelize.BelongsToGetAssociationMixin<generos>;
  setGenero!: Sequelize.BelongsToSetAssociationMixin<generos, generosId>;
  createGenero!: Sequelize.BelongsToCreateAssociationMixin<generos>;
  // datos_users belongsTo users via user_id
  user!: users;
  getUser!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof datos_users {
    return datos_users.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    apaterno: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    amaterno: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nombres: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    intentos: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    bloqueo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    tipo_diputado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    rfc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    shortname: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ext: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    facebook: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    twitter: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    instagram: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    link_web: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ubicacion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    genero_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'generos',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    cel: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    path_foto: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'datos_users',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "datos_users_genero_id_foreign",
        using: "BTREE",
        fields: [
          { name: "genero_id" },
        ]
      },
      {
        name: "datos_users_user_id_foreign",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
