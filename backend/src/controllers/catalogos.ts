import { Request, Response } from "express";
import Proponentes from '../models/proponentes';
import ProponentesTipoCategoriaDetalle from '../models/ProponentesTipoCategoriaDetalle';
import TipoCategoriaIniciativas from '../models/tipo_categoria_iniciativas';
import Legislatura from "../models/legislaturas";
import IntegranteLegislatura from "../models/integrante_legislaturas";
import Diputado from "../models/diputado";
import Comision from "../models/comisions";
import TipoComisions from "../models/tipo_comisions";
import CatFunDep from "../models/cat_fun_dep";
import MunicipiosAg from "../models/municipiosag";
import Partidos from "../models/partidos";
import { Secretarias } from "../models/secretarias";
import { Op } from "sequelize";
import '../models/associations'; 


export const getCatalogos = async (req: Request, res: Response): Promise<Response> => {
  try {
   const proponentes =  await  Proponentes.findAll();
   console.log('propo' , proponentes)
    
   return res.status(200).json({
      msg: "Exito",
      data: proponentes
    });
    
  } catch (error) {
    console.error("Error obteniendo catalogos:", error);
    return res.status(500).json({
      msg: "Ocurrió un error al obtener los catalogos",
      error: (error as Error).message
    });
  }
};


export const getCatalogo = async (req: Request, res: Response): Promise<Response> => {
  try {
   const { id } = req.params;
   const proponenteId = Number(id); 

    const proponenteConCategorias = await Proponentes.findOne({
      where: { id: proponenteId },
      include: [{
        model: TipoCategoriaIniciativas,
        as: 'categorias', 
        through: { attributes: [] } 
      }]
    });

    let dtSlctTemp: any[] = [];

    if (proponenteConCategorias?.valor === 'Gobernadora o Gobernador del Estado') {
      const gobernadora = await CatFunDep.findAll({
        where: {
          nombre_dependencia: { [Op.like]: '%Gobernadora o Gobernador del Estado%' },
          vigente: 1
        },
      });
      dtSlctTemp = gobernadora.map(gobernadora => ({
        id: `${proponenteConCategorias.id}/${gobernadora.id}`,
        id_original: gobernadora.id,
        valor: gobernadora.nombre_titular,
        proponente_id: proponenteConCategorias.id,
        proponente_valor: proponenteConCategorias.valor,
        tipo: gobernadora.nombre_dependencia
      }));

    } else if (proponenteConCategorias?.valor === 'Tribunal Superior de Justicia') {
      const tribunal = await CatFunDep.findAll({
        where: {
          nombre_dependencia: { [Op.like]: '%Tribunal Superior de Justicia del Estado de México%' },
          vigente: 1
        },
      });

       dtSlctTemp = tribunal.map(data => ({
        id: `${proponenteConCategorias.id}/${data.id}`,
        id_original: data.id,
        valor: data.nombre_titular,
        proponente_id: proponenteConCategorias.id,
        proponente_valor: proponenteConCategorias.valor,
        tipo: data.nombre_dependencia
      }));
      
      
    } else if (
      proponenteConCategorias?.valor === 'Ciudadanas y ciudadanos del Estado' ||
      proponenteConCategorias?.valor === 'Fiscalía General de Justicia del Estado de México'
    ) {
      const fiscalia = await CatFunDep.findAll({
        where: {
          nombre_dependencia: { [Op.like]: '%Fiscalía General de Justicia del Estado de México%' },
          vigente: 1
        },
      });
      dtSlctTemp = fiscalia.map(data => ({
        id: `${proponenteConCategorias.id}/${data.id}`,
        id_original: data.id,
        valor: data.nombre_titular,
        proponente_id: proponenteConCategorias.id,
        proponente_valor: proponenteConCategorias.valor,
        tipo: data.nombre_dependencia
      }));
        
    } 

    console.log('proponente' , proponenteConCategorias)
    const categoriasInciativas = await TipoCategoriaIniciativas.findAll();
    console.log('categoriasIniciativas: ',categoriasInciativas)
    
   return res.status(200).json({
      msg: "Exito",
      data: proponenteConCategorias,
      tiposProponentes: dtSlctTemp,
      categoriasInciativas: categoriasInciativas
    });
    
  } catch (error) {
    console.error("Error obteniendo catalogos:", error);
    return res.status(500).json({
      msg: "Ocurrió un error al obtener los catalogos",
      error: (error as Error).message
    });
  }
};


export const saveCategoriaProponente = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    console.log(body)
    const saveDatos = await ProponentesTipoCategoriaDetalle.create({
      proponente_id: body.proponete,
      tipo_categoria_id: body.categoria
    });

    const proponentactualizado = await Proponentes.findOne({
      where: { id: body.proponete },
      include: [{
        model: TipoCategoriaIniciativas,
        as: 'categorias', 
        through: { attributes: [] } 
      }]
    });

    return res.status(200).json({
      msg: `sucess`,
      data: proponentactualizado,
      estatus: 200,
    });

  } catch (error) {
    console.error('Error al guardar categoria proponente:', error);
    return res.status(500).json({ 
      msg: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};


export const deleteCategoriaProponente = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    console.log(body)
    const deleteeDatos = await ProponentesTipoCategoriaDetalle.destroy({
      where: {
        proponente_id: body.proponete,
         tipo_categoria_id: body.categoria
        }
    });

    const proponentactualizado = await Proponentes.findOne({
      where: { id: body.proponete },
      include: [{
        model: TipoCategoriaIniciativas,
        as: 'categorias', 
        through: { attributes: [] } 
      }]
    });

    return res.status(200).json({
      msg: `sucess`,
      data: proponentactualizado,
      estatus: 200,
    });

  } catch (error) {
    console.error('Error al eliminar categoria:', error);
    return res.status(500).json({ 
      msg: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};


export const saveTitularProponente = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    console.log(body)
    

    const proponente = await Proponentes.findOne({
      where: { id: body.proponenteId },
    });

    let dtSlctTemp: any[] = [];

    if (proponente?.valor === 'Gobernadora o Gobernador del Estado') {

      const saveCatFun = await CatFunDep.create({
        nombre_dependencia: 'Gobernadora o Gobernador del Estado',
        nombre_titular: body.nombre,
        vigente: true,
        fecha_inicio:body.fecha_inicio,
        fecha_fin: body.fecha_fin,
        tipo: proponente.id
      });
      
      const gobernadora = await CatFunDep.findAll({
        where: {
          nombre_dependencia: { [Op.like]: '%Gobernadora o Gobernador del Estado%' },
          vigente: 1
        },
      });
      dtSlctTemp = gobernadora.map(gobernadora => ({
        id: `${proponente.id}/${gobernadora.id}`,
        id_original: gobernadora.id,
        valor: gobernadora.nombre_titular,
        proponente_id: proponente.id,
        proponente_valor: proponente.valor,
        tipo: gobernadora.nombre_dependencia
      }));

    } else if (proponente?.valor === 'Tribunal Superior de Justicia') {
      const saveCatFun = await CatFunDep.create({
        nombre_dependencia: 'Tribunal Superior de Justicia del Estado de México',
        nombre_titular: body.nombre,
        vigente: true,
        fecha_inicio:body.fecha_inicio,
        fecha_fin: body.fecha_fin,
        tipo: proponente.id
      });

      const tribunal = await CatFunDep.findAll({
        where: {
          nombre_dependencia: { [Op.like]: '%Tribunal Superior de Justicia del Estado de México%' },
          vigente: 1
        },
      });

       dtSlctTemp = tribunal.map(data => ({
        id: `${proponente.id}/${data.id}`,
        id_original: data.id,
        valor: data.nombre_titular,
        proponente_id: proponente.id,
        proponente_valor: proponente.valor,
        tipo: data.nombre_dependencia
      }));
      
      
    } else if (
      proponente?.valor === 'Ciudadanas y ciudadanos del Estado' ||
      proponente?.valor === 'Fiscalía General de Justicia del Estado de México'
    ) {

      const saveCatFun = await CatFunDep.create({
        nombre_dependencia: proponente?.valor,
        nombre_titular: body.nombre,
        vigente: true,
        fecha_inicio:body.fecha_inicio,
        fecha_fin: body.fecha_fin,
        tipo: proponente.id
      });

      const fiscalia = await CatFunDep.findAll({
        where: {
          nombre_dependencia: { [Op.like]: '%Fiscalía General de Justicia del Estado de México%' },
          vigente: 1
        },
      });
      dtSlctTemp = fiscalia.map(data => ({
        id: `${proponente.id}/${data.id}`,
        id_original: data.id,
        valor: data.nombre_titular,
        proponente_id: proponente.id,
        proponente_valor: proponente.valor,
        tipo: data.nombre_dependencia
      }));
        
    } 

    return res.status(200).json({
      msg: `sucess`,
      data: dtSlctTemp, 
      estatus: 200,
    });

  } catch (error) {
    console.error('Error al guardar titular:', error);
    return res.status(500).json({ 
      msg: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const saveCategoriaInicitavias = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    console.log(body)

    const saveDatos = await TipoCategoriaIniciativas.create({
      valor: body.nombre,
    });
   
    return res.status(200).json({
      msg: `sucess`,
      estatus: 200,
    });

  } catch (error) {
    console.error('Error al guardar categoria proponente:', error);
    return res.status(500).json({ 
      msg: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const saveProponentes = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    console.log(body)
    
    const saveDatos = await Proponentes.create({
      valor: body.nombre,
    });
    
    const proponentes =  await  Proponentes.findAll();

    return res.status(200).json({
      msg: `sucess`,
      data: proponentes,
      estatus: 200,
    });

  } catch (error) {
    console.error('Error al guardar categoria proponente:', error);
    return res.status(500).json({ 
      msg: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};




