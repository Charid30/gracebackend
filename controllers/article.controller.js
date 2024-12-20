import {
  createArticle as createArticleService,
  getAllArticle as getAllArticleService,
  getArticleById as getArticleByIdService,
  updateArticle as updateArticleService,
  deleteArticle as deleteArticleService,
} from "./../services/article.service.js";

export function createArticle(req, res, next) {
  createArticleService(req.body)
    .then((result) => {
      result.data ? res.status(200).json(result) : res.status(400).json(result);
    })
    .catch((err) => next(err));
}

export function getAllArticle(req, res, next) {
  console.log("Query parameters:", req.query); // Debugging log

  getAllArticleService(req.query.page, req.query.limit)
    .then((result) => {
      console.log("Result from service:", result); // Debugging log

      if (result && result.data) {
        res.status(200).json(result);
      } else {
        console.log("No data found:", result);
        res.status(400).json(result);
      }
    })
    .catch((err) => {
      console.error("Error in getAllArticle controller:", err);
      next(err);
    });
}

export function getArticleById(req, res, next) {
  getArticleByIdService(req.params.id)
    .then((result) => {
      result.data ? res.status(200).json(result) : res.status(400).json(result);
    })
    .catch((err) => next(err));
}

export function updateArticle(req, res, next) {
  updateArticleService(parseInt(req.params.id), req.body)
    .then((result) => {
      result.data ? res.status(200).json(result) : res.status(400).json(result);
    })
    .catch((err) => next(err));
}

export function deleteArticle(req, res, next) {
  deleteArticleService(parseInt(req.params.id))
    .then((result) => {
      result.data.length === 0
        ? res.status(200).json(result)
        : res.status(500).json({
            message:
              "Une erreur est survenue lors de l'exécution de la requête.",
          });
    })
    .catch((err) => next(err));
}

export default {
  createArticle,
  getAllArticle,
  getArticleById,
  updateArticle,
  deleteArticle,
};
