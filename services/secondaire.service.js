import mysql from "mysql2/promise";
import config from "./../config/config.js";

// Fonction pour créer une nouvelle filiale secondaire
export async function createFilialeSecondaire(secondaireData) {
  const { libelleSecondaire, acronymeSecondaire, principale_idFilialePrincipale } = secondaireData;
  const del = 0; // 0 signifie que la filiale secondaire est active

  const insertQuery = {
    text: "INSERT INTO secondaire (libelleSecondaire, acronymeSecondaire, principale_idFilialePrincipale, del) VALUES (?, ?, ?, ?)",
    values: [libelleSecondaire, acronymeSecondaire, principale_idFilialePrincipale, del],
  };

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);
    const [result] = await dbConnexion.execute(insertQuery.text, insertQuery.values);
    await dbConnexion.end();

    if (result.insertId) {
      return {
        data: {
          idFilialeSecondaire: result.insertId,
          libelleSecondaire,
          acronymeSecondaire,
          principale_idFilialePrincipale,
          del,
        },
        message: "Filiale secondaire créée avec succès.",
      };
    } else {
      return {
        message: "La création de la filiale secondaire a échoué.",
      };
    }
  } catch (error) {
    return {
      message: error.message,
    };
  }
}

// Fonction pour récupérer toutes les filiales secondaires actives
export async function getAllFilialesSecondaires() {
  const del = 0; // 0 signifie que la filiale secondaire est active

  const query = {
    text: "SELECT idFilialeSecondaire, libelleSecondaire, acronymeSecondaire, principale_idFilialePrincipale FROM secondaire WHERE del = ?",
    values: [del],
  };

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);
    const [rows] = await dbConnexion.execute(query.text, query.values);
    await dbConnexion.end();

    if (rows.length === 0) {
      return {
        data: [],
        message: "Aucune filiale secondaire trouvée.",
      };
    }

    return {
      data: rows,
      message: "Chargement des filiales secondaires effectué avec succès.",
    };
  } catch (error) {
    return {
      message: error.message,
    };
  }
}

// Fonction pour récupérer une filiale secondaire par son ID
export async function getFilialeSecondaireById(idFilialeSecondaire) {
  const del = 0; // 0 signifie que la filiale secondaire est active

  const query = {
    text: "SELECT idFilialeSecondaire, libelleSecondaire, acronymeSecondaire, principale_idFilialePrincipale FROM secondaire WHERE idFilialeSecondaire = ? AND del = ?",
    values: [idFilialeSecondaire, del],
  };

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);
    const [rows] = await dbConnexion.execute(query.text, query.values);
    await dbConnexion.end();

    if (rows.length === 0) {
      return {
        data: null,
        message: "Filiale secondaire non trouvée.",
      };
    }

    return {
      data: rows[0],
      message: "Filiale secondaire récupérée avec succès.",
    };
  } catch (error) {
    return {
      message: error.message,
    };
  }
}

// Fonction pour mettre à jour une filiale secondaire
export async function updateFilialeSecondaire(idFilialeSecondaire, secondaireData) {
  const { libelleSecondaire, acronymeSecondaire, principale_idFilialePrincipale } = secondaireData;

  const updateQuery = {
    text: "UPDATE secondaire SET libelleSecondaire = ?, acronymeSecondaire = ?, principale_idFilialePrincipale = ? WHERE idFilialeSecondaire = ? AND del = 0",
    values: [libelleSecondaire, acronymeSecondaire, principale_idFilialePrincipale, idFilialeSecondaire],
  };

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);
    const [result] = await dbConnexion.execute(updateQuery.text, updateQuery.values);
    await dbConnexion.end();

    if (result.affectedRows === 1) {
      return {
        message: "Filiale secondaire mise à jour avec succès.",
      };
    } else {
      return {
        message: "La mise à jour de la filiale secondaire a échoué.",
      };
    }
  } catch (error) {
    return {
      message: error.message,
    };
  }
}

// Fonction pour supprimer une filiale secondaire (marquer comme supprimée)
export async function deleteFilialeSecondaire(idFilialeSecondaire) {
  const del = 1; // 1 signifie que la filiale secondaire est supprimée

  const deleteQuery = {
    text: "UPDATE secondaire SET del = ? WHERE idFilialeSecondaire = ?",
    values: [del, idFilialeSecondaire],
  };

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);
    const [result] = await dbConnexion.execute(deleteQuery.text, deleteQuery.values);
    await dbConnexion.end();

    if (result.affectedRows === 1) {
      return {
        message: "Filiale secondaire supprimée avec succès.",
      };
    } else {
      return {
        message: "La suppression de la filiale secondaire a échoué.",
      };
    }
  } catch (error) {
    return {
      message: error.message,
    };
  }
}

export default {
  createFilialeSecondaire,
  getAllFilialesSecondaires,
  getFilialeSecondaireById,
  updateFilialeSecondaire,
  deleteFilialeSecondaire,
};
