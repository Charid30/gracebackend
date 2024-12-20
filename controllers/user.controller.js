import userService from './../services/user.service.js';

export function authenticate(req, res, next) {
    userService.authenticate(req.body).then((result) => {
        result.data ? res.status(200).json(result.data) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function register(req, res, next) {
    userService.register(req.body).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function getUserById(req, res, next) {
    userService.getUserById(req.params.id).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function getAllUsers(req, res, next) {
    userService.getAllUsers().then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function updateUserById(req, res, next) {
    userService.updateUserById(req.params.id, req.body).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function updatePassword(req, res, next) {
    userService.updatePassword(req.params.id, req.body).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function resetPassword(req, res, next) {
    userService.resetPassword(req.params.id, req.body.newPwd).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function deleteUserById(req, res, next) {
    userService.deleteUserById(req.params.id).then((result) => {
        result.data.length === 0 ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export default {
    authenticate,
    register,
    getUserById,
    getAllUsers,
    updateUserById,
    updatePassword,
    resetPassword,
    deleteUserById
};
