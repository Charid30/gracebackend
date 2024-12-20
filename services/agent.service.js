import mysql from "mysql2/promise";
import config from "./../config/config.js";
import paginate from "jw-paginate";

export async function createAgent(agentData) {
  const del = false;
  let agent = {
    idAgent: Number,
    matricule: String,
    nom: String,
    prenom: String,
    idDirection: Number,
    idFilialeSecondaire: Number,
    secondaire_principale_idFilialePrincipale: Number, // Ajout du champ
    del: Boolean,
  };

  // L'objet agent est mis à jour avec les données fournies
  agent = agentData;

  const searchAgentRequest = {
    text: "SELECT matricule FROM agent WHERE matricule = ? AND nom = ? AND prenom = ? AND del = ?",
    values: [agent.matricule, agent.nom, agent.prenom, del],
  };

  const insertAgentRequest = {
    text: "INSERT INTO agent(matricule, nom, prenom, idDirection, idFilialeSecondaire, secondaire_principale_idFilialePrincipale, del) VALUES (?, ?, ?, ?, ?, ?, ?)",
    values: [
      agent.matricule,
      agent.nom,
      agent.prenom,
      agent.idDirection, // Ajout de l'idDirection
      agent.idFilialeSecondaire,
      agent.secondaire_principale_idFilialePrincipale, // Ajout de la filiale principale
      del, // Ajout du statut del
    ],
  };

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);

    const [rowsInsertAgentRequest] = await dbConnexion.execute(
      insertAgentRequest.text,
      insertAgentRequest.values
    );
    if (rowsInsertAgentRequest.insertId) {
      const searchAgentById = {
        text: "SELECT * FROM agent WHERE idAgent = ? AND del = ?",
        values: [rowsInsertAgentRequest.insertId, del],
      };
      const [rows] = await dbConnexion.execute(
        searchAgentById.text,
        searchAgentById.values
      );
      await dbConnexion.end();
      return {
        data: rows,
        message: "Un nouvel agent a été créé avec succès.",
      };
    }
  } catch (error) {
    return {
      message: error.message,
    };
  }
}

export async function getAllAgent({ page, pageSize }) {
  const del = false;

  // Convertir les paramètres en entiers et gérer les valeurs par défaut
  page = parseInt(page, 10) || 1;
  let limit = parseInt(pageSize, 10) || 10;

  if (isNaN(page) || page <= 0) page = 1;
  if (isNaN(limit) || limit <= 0) limit = 10;

  const offset = (page - 1) * limit;

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);

    console.log("Fetching agents with offset:", offset, "and limit:", limit);

    const loadAgentsReq = `SELECT 
                                  agent.*, 
                                  direction.libelleDirection, 
                                  direction.acronymeDirection,
                                  principale.idFilialePrincipale,
                                  principale.libelleFiliale,
                                  secondaire.libelleSecondaire,
                                  secondaire.acronymeSecondaire,
                                  secondaire.codeFiliale
                                FROM 
                                  agent 
                                  INNER JOIN direction ON agent.idDirection = direction.idDirection
                                  LEFT JOIN secondaire ON agent.idFilialeSecondaire = secondaire.idFilialeSecondaire
                                  LEFT JOIN principale ON agent.secondaire_principale_idFilialePrincipale = principale.idFilialePrincipale
                                WHERE 
                                  direction.del = ? 
                                  AND agent.del = ? 
                                ORDER BY 
                                  agent.idAgent DESC
                                LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await dbConnexion.execute(loadAgentsReq, [del, del]);

    console.log("Rows fetched:", rows.length);

    const [totalResult] = await dbConnexion.execute(
      "SELECT COUNT(*) AS count FROM agent WHERE del = ?",
      [del]
    );

    const totalAgents = totalResult[0].count;

    await dbConnexion.end();

    if (rows.length === 0) {
      return {
        data: [],
        message: "Aucune donnée trouvée.",
        page: page,
        limit: limit,
        total: totalAgents,
      };
    }

    return {
      data: rows,
      page: page,
      limit: limit,
      total: totalAgents,
      message: "Liste des agents chargée avec succès.",
    };
  } catch (errorConnexion) {
    console.error(
      "Erreur lors de la récupération des agents:",
      errorConnexion.message
    );
    return {
      message: "Erreur de chargement des données",
      error: errorConnexion.message,
    };
  }
}

export async function getAgentsByZone(id) {
  const del = false;
  const loadAgents = {
    text: "SELECT * FROM ((agent INNER JOIN direction ON agent.idDirection = direction.idDirection) INNER JOIN zonededotation ON agent.idZoneDotation = zonededotation.idZoneDotation) WHERE agent.idZoneDotation = ? AND direction.del = ? AND agent.del = ? AND zonededotation.del = ? ORDER BY agent.idAgent DESC",
    values: [id, del, del, del],
  };

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);

    const [rows] = await dbConnexion.execute(
      loadAgents.text,
      loadAgents.values
    );
    if (rows.length === 0) {
      return {
        data: rows,
        message: "Aucune donnée trouvée.",
      };
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = config.pageSize;
    const pager = paginate(rows.length, page, pageSize);

    const reqFindAllPaginated = {
      text: "SELECT * FROM ((agent INNER JOIN direction ON agent.idDirection = direction.idDirection) INNER JOIN zonededotation ON agent.idZoneDotation = zonededotation.idZoneDotation) WHERE agent.idZoneDotation = ? AND direction.del = ? AND agent.del = ? AND zonededotation.del = ? ORDER BY agent.idAgent DESC LIMIT ?, ?",
      values: [id, del, del, del, pager.startIndex, pageSize],
    };

    const [rowsPaginated] = await dbConnexion.execute(
      reqFindAllPaginated.text,
      reqFindAllPaginated.values
    );
    await dbConnexion.end();

    let data = rowsPaginated.map((element) => {
      let zone = {};
      let direction = {};
      let agent = {};

      /************** ZONE *************/
      zone.idZoneDotation = element.idZoneDotation;
      zone.libelleZoneDotation = element.libelleZoneDotation;
      zone.codeZoneDotation = element.codeZoneDotation;

      /************** DIRECTION *************/
      direction.idDirection = element.idDirection;
      direction.libelleDirection = element.libelleDirection;
      direction.acronymeDirection = element.acronymeDirection;

      /************** AGENT **********/
      agent.idAgent = element.idAgent;
      agent.matricule = element.matricule;
      agent.nom = element.nom;
      agent.prenom = element.prenom;
      agent.idDirection = element.idDirection;
      agent.direction = direction;
      agent.idZoneDotation = element.idZoneDotation;
      agent.zoneDeDotation = zone;

      return agent;
    });

    return {
      data: data,
      pager: pager,
      message: "Chargement des données effectué avec succès.",
    };
  } catch (error) {
    return {
      message: error.message,
    };
  }
}

export async function getAllAgentsWithoutAccount(req) {
  const del = false;
  const loadAgents = {
    text: "SELECT * FROM agent AS ag LEFT JOIN account AS ac ON ag.idAgent = ac.idAgent WHERE ag.del = ? AND ac.del IS null",
    values: [del],
  };

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);

    const [rows] = await dbConnexion.execute(
      loadAgents.text,
      loadAgents.values
    );
    await dbConnexion.end();

    if (rows.length === 0) {
      return {
        data: rows,
        message: "Aucune donnée trouvée.",
      };
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = config.pageSize;
    const pager = paginate(rows.length, page, pageSize);

    const reqFindAllPaginated = {
      text: "SELECT * FROM agent AS ag LEFT JOIN account AS ac ON ag.idAgent = ac.idAgent WHERE ag.del = ? AND ac.del IS null LIMIT ?, ?",
      values: [del, pager.startIndex, pageSize],
    };

    const [rowsPaginated] = await dbConnexion.execute(
      reqFindAllPaginated.text,
      reqFindAllPaginated.values
    );
    await dbConnexion.end();

    let data = rowsPaginated.map((element) => {
      let agent = {};

      /************** AGENT **********/
      agent.idAgent = element.idAgent;
      agent.matricule = element.matricule;
      agent.nom = element.nom;
      agent.prenom = element.prenom;
      agent.idDirection = element.idDirection;
      agent.idZoneDotation = element.idZoneDotation;

      return agent;
    });

    return {
      data: data,
      pager: pager,
      message: "Chargement des données effectué avec succès.",
    };
  } catch (error) {
    return {
      message: error.message,
    };
  }
}

export async function getAgentByIdWithDetail(idAgent) {
  const del = false;
  const searchAgentById = {
    text: "SELECT * FROM ((agent INNER JOIN direction ON agent.idDirection = direction.idDirection) INNER JOIN zonededotation ON agent.idZoneDotation = zonededotation.idZoneDotation) WHERE agent.idAgent = ? AND direction.del = ? AND agent.del = ? AND zonededotation.del = ?",
    values: [idAgent, del, del, del],
  };

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);

    const [rows] = await dbConnexion.execute(
      searchAgentById.text,
      searchAgentById.values
    );
    await dbConnexion.end();

    if (rows.length === 0) {
      return {
        data: rows,
        message: "Aucune donnée trouvée.",
      };
    }

    const result = await getQuantiteCommandeByArticleForAgent(idAgent);
    const resultConsoPeriodeEnCours = await getMasseForAgentForActivePeriode(
      idAgent
    );

    let data = rows.map((element) => {
      let zone = {};
      let direction = {};
      let agent = {};

      /************** ZONE *************/
      zone.idZoneDotation = element.idZoneDotation;
      zone.libelleZoneDotation = element.libelleZoneDotation;
      zone.codeZoneDotation = element.codeZoneDotation;

      /************** DIRECTION *************/
      direction.idDirection = element.idDirection;
      direction.libelleDirection = element.libelleDirection;
      direction.acronymeDirection = element.acronymeDirection;

      /************** AGENT **********/
      agent.idAgent = element.idAgent;
      agent.matricule = element.matricule;
      agent.nom = element.nom;
      agent.prenom = element.prenom;
      agent.idDirection = element.idDirection;
      agent.direction = direction;
      agent.idZoneDotation = element.idZoneDotation;
      agent.zoneDeDotation = zone;

      return agent;
    });

    return {
      data: data,
      message: "Données chargées avec succès.",
      quantitesData: result || 0,
      consommationClient: resultConsoPeriodeEnCours || 0,
    };
  } catch (error) {
    return {
      message: error.message,
    };
  }
}

export async function getAgentByMatricule(matricule) {
  const del = false;

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);

    const searchAgentByMatricule = {
      text: "SELECT * FROM agent WHERE matricule = ? AND del = ?",
      values: [matricule, del],
    };

    const [rows] = await dbConnexion.execute(
      searchAgentByMatricule.text,
      searchAgentByMatricule.values
    );
    await dbConnexion.end();

    if (rows.length === 0) {
      return {
        data: rows,
        message: "Aucun agent trouvé pour ce matricule.",
      };
    }
    return {
      data: rows,
      message: "Donnée chargée avec succès.",
    };
  } catch (error) {
    return {
      message: error.message,
    };
  }
}

export async function updateAgent(id, agentData) {
  if (!id) {
    return {
      data: undefined,
      message: "Veuillez spécifier l'élément à mettre à jour.",
    };
  }

  const del = false;

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);

    const updateAgent = {
      text: "UPDATE agent SET matricule = ?, nom = ?, prenom = ?, idDirection = ?, idZoneDotation = ? WHERE idAgent = ? AND del = ?",
      values: [
        agentData.matricule,
        agentData.nom,
        agentData.prenom,
        agentData.idDirection,
        agentData.idZoneDotation,
        id,
        del,
      ],
    };

    const [resultUpdate] = await dbConnexion.execute(
      updateAgent.text,
      updateAgent.values
    );
    await dbConnexion.end();

    if (resultUpdate.affectedRows === 1 && resultUpdate.changedRows === 1) {
      const result = await getAgentById(id);
      return {
        data: result.data,
        message: "Les informations de l'agent ont été modifiées avec succès.",
      };
    }
  } catch (error) {
    return {
      message: error.message,
    };
  }
}

export async function deleteAgent(id) {
  if (!id) {
    return {
      data: undefined,
      message: "Veuillez spécifier l'élément à mettre à jour.",
    };
  }

  const resultFindAgent = await getAgentById(id);
  if (resultFindAgent.data.length === 0) {
    return {
      data: resultFindAgent.data,
      message: resultFindAgent.message,
    };
  }

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);

    const updateAgent = {
      text: "UPDATE agent SET del = true WHERE idAgent = ?",
      values: [id],
    };

    const [resultUpdate] = await dbConnexion.execute(
      updateAgent.text,
      updateAgent.values
    );
    await dbConnexion.end();

    if (resultUpdate.affectedRows === 1 && resultUpdate.changedRows === 1) {
      const result = await getAgentById(id);
      return {
        data: result.data,
        message: "Suppression effectuée avec succès.",
      };
    }
  } catch (error) {
    return {
      message: error.message,
    };
  }
}

export async function getQuantiteCommandeByArticleForAgent(idAgent) {
  const del = false;

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);

    const qteByArticleForAgent = {
      text: "SELECT lignecommande.idArticle, article.designation, SUM(lignecommande.quantiteCommandee) as quantite FROM (lignecommande INNER JOIN article ON lignecommande.idArticle = article.idArticle) INNER JOIN commande ON commande.idCommande = lignecommande.idCommande WHERE commande.idAgent = ? AND lignecommande.del = ? AND article.del = ? GROUP BY idArticle;",
      values: [idAgent, del, del],
    };

    const [rows] = await dbConnexion.execute(
      qteByArticleForAgent.text,
      qteByArticleForAgent.values
    );
    await dbConnexion.end();

    if (rows.length >= 0) {
      return rows;
    }
  } catch (error) {
    return {
      message: error.message,
    };
  }
}

export async function getMasseForAgentForActivePeriode(idAgent) {
  const presentDate = new Date();

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);

    const reqSelectConsoClientForActivePeriode = {
      text: "SELECT SUM(masseTotaleDeLaCommande) as masseTotalePeriode FROM commande INNER JOIN periode ON commande.idPeriode = periode.idPeriode WHERE commande.del = false AND periode.del = false AND commande.idAgent = ? AND periode.mois = ? AND periode.annee = ?",
      values: [idAgent, presentDate.getMonth() + 1, presentDate.getFullYear()],
    };

    const [rows] = await dbConnexion.execute(
      reqSelectConsoClientForActivePeriode.text,
      reqSelectConsoClientForActivePeriode.values
    );

    if (rows.length >= 0) {
      let data = {};
      data.ConsoClientForActivePeriode = rows[0].masseTotalePeriode;

      const reqConsoRestantePourLaPeriode = {
        text: "SELECT (valeurQuota - (SELECT SUM(masseTotaleDeLaCommande) as masseTotalePeriode FROM commande INNER JOIN periode ON commande.idPeriode = periode.idPeriode WHERE commande.del = false AND periode.del = false AND idAgent = ? AND periode.mois = ? AND periode.annee = ?)) AS consoRestantePourLaPeriode FROM quota",
        values: [
          idAgent,
          presentDate.getMonth() + 1,
          presentDate.getFullYear(),
        ],
      };

      const [rowsConsoRest] = await dbConnexion.execute(
        reqConsoRestantePourLaPeriode.text,
        reqConsoRestantePourLaPeriode.values
      );
      await dbConnexion.end();

      if (rowsConsoRest.length >= 0) {
        data.ConsoClientRestantePourLaPeriode =
          rowsConsoRest[0].consoRestantePourLaPeriode;
        return data;
      }
    }
  } catch (error) {
    return {
      message: error.message,
    };
  }
}

export async function importPersonnel(data) {
  // Function implementation can be added as needed
  return;
}

export default {
  createAgent,
  getAllAgent,
  getAgentsByZone,
  getAllAgentsWithoutAccount,
  getAgentByIdWithDetail,
  getAgentByMatricule,
  updateAgent,
  deleteAgent,
  getQuantiteCommandeByArticleForAgent,
  getMasseForAgentForActivePeriode,
  importPersonnel,
};
