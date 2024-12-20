import directionService from './../services/direction.service.js';

export function createDirection(req, res, next) {
    directionService.createDirection(req.body).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function getAllDirections(req, res, next) {
    // Récupération des paramètres de requête pour la pagination
    const page = parseInt(req.query.page, 10) || 1; // Page par défaut : 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10; // Taille par défaut : 10

    directionService.getAllDirections(page, pageSize)
        .then((result) => {
            if (result.data) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        })
        .catch(err => next(err));
}

export function getDirectionById(req, res, next) {
    directionService.getDirectionById(parseInt(req.params.id)).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function updateDirection(req, res, next) {
    directionService.updateDirection(parseInt(req.params.id), req.body).then((result) => {
        result.message === "Direction mise à jour avec succès." 
            ? res.status(200).json(result) 
            : res.status(400).json({ data: null, message: 'Une erreur est survenue lors de la mise à jour de la direction.' });
    }).catch(err => next(err));
}

export function deleteDirection(req, res, next) {
    directionService.deleteDirection(parseInt(req.params.id)).then((result) => {
        result.message === "Direction supprimée avec succès."
            ? res.status(200).json(result)
            : res.status(400).json({ data: null, message: 'Une erreur est survenue lors de la suppression de la direction.' });
    }).catch(err => next(err));
}

export default {
    createDirection,
    getAllDirections,
    getDirectionById,
    updateDirection,
    deleteDirection,
};
