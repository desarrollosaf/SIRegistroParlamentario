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

    let dtSlctTemp: any = null;

    if (proponenteConCategorias?.valor === 'Gobernadora o Gobernador del Estado') {
      const gobernadora = await CatFunDep.findOne({
        where: {
          nombre_dependencia: { [Op.like]: '%Gobernadora o Gobernador del Estado%' },
          vigente: 1
        },
      });
      if (gobernadora) {
        dtSlctTemp = [{
          id: `${proponenteConCategorias.id}/${gobernadora.id}`,
          id_original: gobernadora.id,
          valor: gobernadora.nombre_titular,
          proponente_id: proponenteConCategorias.id,
          proponente_valor: proponenteConCategorias.valor,
          tipo: 'funcionario'
        }];
      }

    } else if (proponenteConCategorias?.valor === 'Tribunal Superior de Justicia') {
      const tribunal = await CatFunDep.findOne({
        where: {
          nombre_dependencia: { [Op.like]: '%Tribunal Superior de Justicia del Estado de México%' },
          vigente: 1
        },
      });
      if (tribunal) {
        dtSlctTemp = [{
          id: `${proponenteConCategorias.id}/${tribunal.id}`,
          id_original: tribunal.id,
          valor: tribunal.nombre_titular,
          proponente_id: proponenteConCategorias.id,
          proponente_valor: proponenteConCategorias.valor,
          tipo: 'funcionario'
        }];
      }
      
    } else if (
      proponenteConCategorias?.valor === 'Ciudadanas y ciudadanos del Estado' ||
      proponenteConCategorias?.valor === 'Fiscalía General de Justicia del Estado de México'
    ) {
      const fiscalia = await CatFunDep.findOne({
        where: {
          nombre_dependencia: { [Op.like]: '%Fiscalía General de Justicia del Estado de México%' },
          vigente: 1
        },
      });
      if (fiscalia) {
        dtSlctTemp = [{
          id: `${proponenteConCategorias.id}/${fiscalia.id}`,
          id_original: fiscalia.id,
          valor: fiscalia.nombre_titular,
          proponente_id: proponenteConCategorias.id,
          proponente_valor: proponenteConCategorias.valor,
          tipo: 'funcionario'
        }];
      }
        
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
    console.error('Error al reiniciar las votaciones:', error);
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
    console.error('Error al reiniciar las votaciones:', error);
    return res.status(500).json({ 
      msg: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};





