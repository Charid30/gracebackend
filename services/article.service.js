import mysql from "mysql2/promise";
import config from "./../config/config.js";

export async function getAllArticle(page = 1, limit = 10) {
  const del = false;

  // Validation des paramètres page et limit
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page <= 0) page = 1;
  if (isNaN(limit) || limit <= 0) limit = 10;

  // Définir l'offset après avoir validé page et limit
  const offset = (page - 1) * limit;

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);

    const loadArticlesReq = `SELECT * FROM article WHERE del = ? LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await dbConnexion.execute(loadArticlesReq, [del]);
    const [total] = await dbConnexion.execute(
      "SELECT COUNT(*) AS count FROM article WHERE del = ?",
      [del]
    );

    await dbConnexion.end();

    if (rows.length === 0) {
      return {
        data: rows,
        message: "Aucune donnée trouvée.",
      };
    }

    return {
      data: rows,
      total: total[0].count,
      page: page,
      limit: limit,
      message: "Liste des articles chargée avec succès.",
    };
  } catch (errorConnexion) {
    return {
      message: "Erreur de chargement des données",
    };
  }
}

export async function createArticle(articleData) {
  const del = false;

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);
    await dbConnexion.beginTransaction();

    try {
      const article = {
        name: articleData.name,
        designation: articleData.designation.toUpperCase(),
        volume: articleData.volume,
        prixUnitaire: articleData.prixUnitaire,
        del: del,
      };

      // Vérification si l'article existe déjà
      const [rowsSearchArticleReq] = await dbConnexion.execute(
        "SELECT * FROM article WHERE del = ? AND designation = ?",
        [del, article.designation]
      );

      if (rowsSearchArticleReq.length > 0) {
        await dbConnexion.rollback();
        return {
          data: rowsSearchArticleReq,
          message: "Cet article existe déjà dans la base de données.",
        };
      }

      // Insertion du nouvel article
      const [rowsInsertArticleReq] = await dbConnexion.execute(
        "INSERT INTO article (name, designation, volume, prixUnitaire) VALUES (?, ?, ?, ?)",
        [
          article.name,
          article.designation,
          article.volume,
          article.prixUnitaire,
        ]
      );

      if (rowsInsertArticleReq.insertId) {
        await dbConnexion.commit();

        const newArticle = await getArticleById(rowsInsertArticleReq.insertId);
        return {
          data: newArticle,
          message: "Nouvel article créé avec succès.",
        };
      }
    } catch (error) {
      await dbConnexion.rollback();
      throw error;
    } finally {
      await dbConnexion.end();
    }
  } catch (errorConnexion) {
    return {
      message: errorConnexion.message,
    };
  }
}

export async function getArticleById(articleId) {
  if (!articleId) {
    return {
      data: undefined,
      message: "Veuillez spécifier l'identifiant de l'article.",
    };
  }

  const del = false;

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);
    if (!dbConnexion) {
      return {
        message:
          "Une erreur est survenue lors de la connexion à la base de données.",
      };
    }

    const searchArticleById =
      "SELECT * FROM article WHERE idArticle = ? AND del = ?";
    const [rows] = await dbConnexion.execute(searchArticleById, [
      articleId,
      del,
    ]);

    await dbConnexion.end();

    if (rows.length === 0) {
      return {
        data: rows,
        message: "Aucun article trouvé.",
      };
    }
    return {
      data: rows,
      message: "Article trouvé.",
    };
  } catch (errorConnexion) {
    return {
      message: errorConnexion.message,
    };
  }
}

export async function updateArticle(articleId, articleData) {
  if (!articleId || !articleData) {
    return {
      data: undefined,
      message:
        "Les données à modifier ou l'identifiant de l'objet à modifier sont nulles.",
    };
  }

  const updatedArticle = {
    idArticle: articleId,
    name: articleData.name ? articleData.name.toUpperCase() : undefined,
    designation: articleData.designation
      ? articleData.designation.toUpperCase()
      : undefined,
    volume: articleData.volume || 0,
    prixUnitaire: articleData.prixUnitaire || 0,
    del: articleData.del || false,
  };

  const dbConnexion = await mysql.createConnection(config.connexion);

  try {
    await dbConnexion.beginTransaction();

    const updateArticleReq =
      "UPDATE article SET name = ?, designation = ?, volume = ?, prixUnitaire = ?, del = ? WHERE idArticle = ?";

    const [resultUpdate] = await dbConnexion.execute(updateArticleReq, [
      updatedArticle.name,
      updatedArticle.designation,
      updatedArticle.volume,
      updatedArticle.prixUnitaire,
      updatedArticle.del,
      articleId,
    ]);

    if (resultUpdate.affectedRows === 1) {
      await dbConnexion.commit();
      const result = await getArticleById(articleId);
      return {
        data: result.data,
        message: "Article modifié avec succès.",
      };
    } else {
      await dbConnexion.rollback();
      return {
        message: "Aucune modification apportée à l'article.",
      };
    }
  } catch (errorUpdate) {
    await dbConnexion.rollback();
    return {
      message: "La mise à jour n'a pas été effectuée.",
    };
  } finally {
    await dbConnexion.end();
  }
}

export async function deleteArticle(articleId) {
  if (!articleId) {
    return {
      data: undefined,
      message: "Veuillez spécifier l'élément à supprimer.",
    };
  }
  const del = true;

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);
    if (!dbConnexion) {
      throw new Error(
        "Une erreur est survenue lors de la connexion à la base de données."
      );
    }

    await dbConnexion.beginTransaction();

    const deleteArticleReq = "UPDATE article SET del = ? WHERE idArticle = ?";

    const [resultUpdate] = await dbConnexion.execute(deleteArticleReq, [
      del,
      articleId,
    ]);

    if (resultUpdate.affectedRows === 1) {
      await dbConnexion.commit();
      const result = await getArticleById(articleId);
      return {
        data: result.data,
        message: "Suppression effectuée avec succès.",
      };
    } else {
      await dbConnexion.rollback();
      throw new Error("Échec de la suppression de l'article.");
    }
  } catch (error) {
    if (dbConnexion) {
      await dbConnexion.rollback();
    }
    return {
      message: error.message,
    };
  } finally {
    if (dbConnexion) {
      await dbConnexion.end();
    }
  }
}