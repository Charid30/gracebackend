import secondaireService from './../services/secondaire.service.js';

export function createFilialeSecondaire(req, res, next) {
    secondaireService.createFilialeSecondaire(req.body).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function getAllFilialesSecondaires(req, res, next) {
    secondaireService.getAllFilialesSecondaires().then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function getFilialeSecondaireById(req, res, next) {
    secondaireService.getFilialeSecondaireById(parseInt(req.params.id)).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function updateFilialeSecondaire(req, res, next) {
    secondaireService.updateFilialeSecondaire(parseInt(req.params.id), req.body).then((result) => {
        result.message === "Filiale secondaire mise à jour avec succès."
            ? res.status(200).json(result)
            : res.status(400).json({ data: null, message: 'Une erreur est survenue lors de la mise à jour de la filiale secondaire.' });
    }).catch(err => next(err));
}

export function deleteFilialeSecondaire(req, res, next) {
    secondaireService.deleteFilialeSecondaire(parseInt(req.params.id)).then((result) => {
        result.message === "Filiale secondaire supprimée avec succès."
            ? res.status(200).json(result)
            : res.status(400).json({ data: null, message: 'Une erreur est survenue lors de la suppression de la filiale secondaire.' });
    }).catch(err => next(err));
}

export default {
    createFilialeSecondaire,
    getAllFilialesSecondaires,
    getFilialeSecondaireById,
    updateFilialeSecondaire,
    deleteFilialeSecondaire,
};
