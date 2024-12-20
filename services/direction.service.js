import mysql from "mysql2/promise";
import config from "./../config/config.js";

// Fonction pour créer une nouvelle direction
export async function createDirection(directionData) {
  const { libelleDirection, acronymeDirection } = directionData;
  const del = 0; // 0 signifie que la direction est active

  // Requête SQL pour insérer une nouvelle direction
  const insertDirectionRequest = {
    text: "INSERT INTO direction (libelleDirection, acronymeDirection, del) VALUES (?, ?, ?)",
    values: [libelleDirection, acronymeDirection, del],
  };

  try {
    // Connexion à la base de données
    const dbConnexion = await mysql.createConnection(config.connexion);

    // Exécution de la requête d'insertion
    const [result] = await dbConnexion.execute(insertDirectionRequest.text, insertDirectionRequest.values);

    // Fermeture de la connexion
    await dbConnexion.end();

    // Vérification si l'insertion a réussi
    if (result.insertId) {
      return {
        data: {
          idDirection: result.insertId,
          libelleDirection,
          acronymeDirection,
          del,
        },
        message: "Direction créée avec succès.",
      };
    } else {
      return {
        message: "La création de la direction a échoué.",
      };
    }
  } catch (error) {
    // Gestion des erreurs
    return {
      message: error.message,
    };
  }
}

// Fonction pour récupérer toutes les directions actives
export async function getAllDirections() {
  const del = 0; // 0 signifie que la direction est active

  // Requête SQL pour sélectionner toutes les directions actives
  const query = {
    text: "SELECT idDirection, libelleDirection, acronymeDirection FROM direction WHERE del = ?",
    values: [del],
  };

  try {
    // Connexion à la base de données
    const dbConnexion = await mysql.createConnection(config.connexion);

    // Exécution de la requête pour récupérer les directions
    const [rows] = await dbConnexion.execute(query.text, query.values);

    // Fermeture de la connexion
    await dbConnexion.end();

    // Si aucune direction n'est trouvée
    if (rows.length === 0) {
      return {
        data: [],
        message: "Aucune direction trouvée.",
      };
    }

    // Retour des directions
    return {
      data: rows,
      message: "Chargement des directions effectué avec succès.",
    };
  } catch (error) {
    // Gestion des erreurs
    return {
      message: error.message,
    };
  }
}

// Fonction pour récupérer une direction par son ID
export async function getDirectionById(idDirection) {
  const del = 0; // 0 signifie que la direction est active

  // Requête SQL pour sélectionner une direction par son ID
  const query = {
    text: "SELECT idDirection, libelleDirection, acronymeDirection FROM direction WHERE idDirection = ? AND del = ?",
    values: [idDirection, del],
  };

  try {
    // Connexion à la base de données
    const dbConnexion = await mysql.createConnection(config.connexion);

    // Exécution de la requête pour récupérer la direction
    const [rows] = await dbConnexion.execute(query.text, query.values);

    // Fermeture de la connexion
    await dbConnexion.end();

    // Si la direction n'est pas trouvée
    if (rows.length === 0) {
      return {
        data: null,
        message: "Direction non trouvée.",
      };
    }

    // Retour de la direction
    return {
      data: rows[0],
      message: "Direction récupérée avec succès.",
    };
  } catch (error) {
    // Gestion des erreurs
    return {
      message: error.message,
    };
  }
}

// Fonction pour mettre à jour une direction
export async function updateDirection(idDirection, directionData) {
  const { libelleDirection, acronymeDirection } = directionData;

  // Requête SQL pour mettre à jour une direction
  const updateQuery = {
    text: "UPDATE direction SET libelleDirection = ?, acronymeDirection = ? WHERE idDirection = ? AND del = 0",
    values: [libelleDirection, acronymeDirection, idDirection],
  };

  try {
    // Connexion à la base de données
    const dbConnexion = await mysql.createConnection(config.connexion);

    // Exécution de la requête de mise à jour
    const [result] = await dbConnexion.execute(updateQuery.text, updateQuery.values);

    // Fermeture de la connexion
    await dbConnexion.end();

    // Vérification si la mise à jour a réussi
    if (result.affectedRows === 1) {
      return {
        message: "Direction mise à jour avec succès.",
      };
    } else {
      return {
        message: "La mise à jour de la direction a échoué.",
      };
    }
  } catch (error) {
    // Gestion des erreurs
    return {
      message: error.message,
    };
  }
}

// Fonction pour supprimer une direction (marquer comme supprimée)
export async function deleteDirection(idDirection) {
  const del = 1; // 1 signifie que la direction est supprimée

  // Requête SQL pour marquer une direction comme supprimée
  const deleteQuery = {
    text: "UPDATE direction SET del = ? WHERE idDirection = ?",
    values: [del, idDirection],
  };

  try {
    // Connexion à la base de données
    const dbConnexion = await mysql.createConnection(config.connexion);

    // Exécution de la requête de suppression
    const [result] = await dbConnexion.execute(deleteQuery.text, deleteQuery.values);

    // Fermeture de la connexion
    await dbConnexion.end();

    // Vérification si la suppression a réussi
    if (result.affectedRows === 1) {
      return {
        message: "Direction supprimée avec succès.",
      };
    } else {
      return {
        message: "La suppression de la direction a échoué.",
      };
    }
  } catch (error) {
    // Gestion des erreurs
    return {
      message: error.message,
    };
  }
}

export default {
  createDirection,
  getAllDirections,
  getDirectionById,
  updateDirection,
  deleteDirection,
};