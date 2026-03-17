import { Request, Response } from "express";
import IniciativaPuntoOrden from "../models/inciativas_puntos_ordens";
import IniciativasPresenta from "../models/iniciativaspresenta";
import Proponentes from "../models/proponentes";
import Diputado from "../models/diputado";
import Comision from "../models/comisions";
import MunicipiosAg from "../models/municipiosag";
import Partidos from "../models/partidos";
import Legislatura from "../models/legislaturas";
import Secretarias from "../models/secretarias";
import CatFunDep from "../models/cat_fun_dep";



export const getiniciativas = async (req: Request, res: Response): Promise<any> => {
  try {
    const iniciativasRaw = await IniciativaPuntoOrden.findAll({ 
      attributes: ["id", "iniciativa","tipo","path_doc","precluida"],
      include: [
        {
          model: IniciativasPresenta,
          as: "presentan",
          attributes: ["id_tipo_presenta", "id_presenta"],
          include: [
            {
              model: Proponentes,
              as: "tipo_presenta",
              attributes: ["id", "valor"]
            }
          ]
        }
      ]
    });

    if (!iniciativasRaw) {
      return res.status(404).json({ message: "No tiene iniciativas" });
    }

    // 👇 Procesar cada iniciativa con sus presentan
    const iniciativas = await Promise.all(
      iniciativasRaw.map(async (ini: any) => {
        const data = ini.toJSON();
        const { proponentesString, presentaString } = data.presentan?.length
          ? await procesarPresentan(data.presentan)
          : { proponentesString: '', presentaString: '' };

        return {
          id: data.id,
          iniciativa: data.iniciativa,
          tipo: data.tipo,
          path: data.path_doc,
          proponente: proponentesString,
          presenta: presentaString
        };
      })
    );

    return res.status(200).json({
      data: iniciativas,
    });  

  } catch (error: any) {
    console.error("Error al obtener las iniciativas:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

const procesarPresentan = async (presentan: any[]) => {
  const proponentesUnicos = new Map<string, string>();
  const presentanData: any[] = [];

  for (const p of presentan) {
    const tipoValor = p.tipo_presenta?.valor ?? '';
    let valor = '';

    if (tipoValor === 'Diputadas y Diputados') {
      const dip = await Diputado.findOne({ where: { id: p.id_presenta } });
      valor = `${dip?.apaterno ?? ''} ${dip?.amaterno ?? ''} ${dip?.nombres ?? ''}`.trim();
    } else if (['Mesa Directiva en turno', 'Junta de Coordinación Politica', 'Comisiones Legislativas', 'Diputación Permanente'].includes(tipoValor)) {
      const comi = await Comision.findOne({ where: { id: p.id_presenta } });
      valor = comi?.nombre ?? '';
    } else if (['Ayuntamientos', 'Municipios'].includes(tipoValor)) {
      const muni = await MunicipiosAg.findOne({ where: { id: p.id_presenta } });
      valor = muni?.nombre ?? '';
    } else if (tipoValor === 'Grupo Parlamentario') {
      const partido = await Partidos.findOne({ where: { id: p.id_presenta } });
      valor = partido?.nombre ?? '';
    } else if (tipoValor === 'Legislatura') {
      const leg = await Legislatura.findOne({ where: { id: p.id_presenta } });
      valor = leg?.numero ?? '';
    } else if (tipoValor === 'Secretarías del GEM') {
      const sec = await Secretarias.findOne({ where: { id: p.id_presenta } });
      valor = `${sec?.nombre ?? ''} / ${sec?.titular ?? ''}`;
    } else {
      const cat = await CatFunDep.findOne({ where: { id: p.id_presenta } });
      valor = cat?.nombre_titular ?? '';
    }

    if (!proponentesUnicos.has(tipoValor)) {
      proponentesUnicos.set(tipoValor, tipoValor);
    }
    presentanData.push({ proponente: tipoValor, valor, id_presenta: p.id_presenta });
  }

  return {
    proponentesString: Array.from(proponentesUnicos.keys()).join(", "),
    presentaString: presentanData.map(p => p.valor).join(', ')
  };
};
