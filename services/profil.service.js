import mysql from 'mysql2/promise';
import config from './../config/config.js';

export async function createProfil(profilData) {
    const del = false;
    let profil = {
        idProfil: Number,
        libelleProfil: String,
        del: Boolean
    };
    profil = profilData;

    if (profil.libelleProfil) {
        profil.libelleProfil = profil.libelleProfil.toUpperCase();
    }

    try {
        const dbConnexion = await mysql.createConnection(config.connexion);

        const insertReqProfil = {
            text: 'INSERT INTO profil(libelleProfil, del) VALUES (?, ?)',
            values: [profil.libelleProfil, del]
        };

        const [rows] = await dbConnexion.execute(insertReqProfil.text, insertReqProfil.values);
        await dbConnexion.end();

        if (rows && rows.insertId) {
            return {
                data: rows,
                message: 'Profil créé avec succès.'
            };
        } else {
            return {
                message: 'Échec de la création du profil.'
            };
        }
    } catch (error) {
        return {
            message: error.message
        };
    }
}

export async function getAllProfil() {
    const del = false;

    try {
        const dbConnexion = await mysql.createConnection(config.connexion);

        const selectReqProfil = {
            text: 'SELECT * FROM profil WHERE del = ?',
            values: [del]
        };

        const [rows] = await dbConnexion.execute(selectReqProfil.text, selectReqProfil.values);
        await dbConnexion.end();

        if (rows.length === 0) {
            return {
                data: rows,
                message: 'Aucune donnée trouvée.'
            };
        } else {
            return {
                data: rows,
                message: 'Chargement des données effectué avec succès.'
            };
        }
    } catch (error) {
        return {
            message: error.message
        };
    }
}

export async function getProfilById(idProfil) {
    const del = false;

    try {
        const dbConnexion = await mysql.createConnection(config.connexion);

        const selectReqProfilById = {
            text: 'SELECT * FROM profil WHERE idProfil = ? AND del = ?',
            values: [idProfil, del]
        };

        const [rows] = await dbConnexion.execute(selectReqProfilById.text, selectReqProfilById.values);
        await dbConnexion.end();

        if (rows.length === 0) {
            return {
                data: rows,
                message: 'Aucune donnée trouvée.'
            };
        } else {
            return {
                data: rows,
                message: 'Chargement des données effectué avec succès.'
            };
        }
    } catch (error) {
        return {
            message: error.message
        };
    }
}

// Exportation de la fonction deleteProfil qui est encore à implémenter
export async function deleteProfil(idProfil) {
    const del = true;

    try {
        const dbConnexion = await mysql.createConnection(config.connexion);

        const deleteReqProfil = {
            text: 'UPDATE profil SET del = ? WHERE idProfil = ?',
            values: [del, idProfil]
        };

        const [result] = await dbConnexion.execute(deleteReqProfil.text, deleteReqProfil.values);
        await dbConnexion.end();

        if (result.affectedRows > 0) {
            return {
                message: 'Profil supprimé avec succès.'
            };
        } else {
            return {
                message: 'Aucun profil trouvé avec cet ID.'
            };
        }
    } catch (error) {
        return {
            message: error.message
        };
    }
}

export default {
    createProfil,
    getAllProfil,
    getProfilById,
    deleteProfil
};
