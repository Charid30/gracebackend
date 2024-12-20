import profilService from './../services/profil.service.js';

export function createProfil(req, res, next) {
    profilService.createProfil(req.body).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function updateProfil(req, res, next) {
    const { id } = req.params;
    const profilData = req.body;
    profilService.updateProfil(id, profilData)
        .then((result) => {
            result.data ? res.status(200).json(result) : res.status(400).json(result);
        })
        .catch(err => next(err));
}

export function getAllProfils(req, res, next) {
    profilService.getAllProfil().then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function deleteProfileById(req, res, next) {
    profilService.deleteUserById(req.params.id).then((result) => {
        result.data.length === 0 ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export default {
    createProfil,
    updateProfil,
    getAllProfils,
    deleteProfileById
};
