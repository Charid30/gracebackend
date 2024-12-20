import mysql from 'mysql2/promise';
import config from './../config/config.js';

// Fonction pour générer le numéro de commande
export async function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2); // Les deux derniers chiffres de l'année
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mois avec deux chiffres

    try {
        const dbConnexion = await mysql.createConnection(config.connexion);

        // Récupérer le dernier numéro de commande de ce mois et de cette année
        const selectLastOrderQuery = {
            text: 'SELECT numeroOrder FROM `order` WHERE numeroOrder LIKE ? ORDER BY idOrder DESC LIMIT 1',
            values: [`${year}${month}%`]
        };

        const [rows] = await dbConnexion.execute(selectLastOrderQuery.text, selectLastOrderQuery.values);

        let newOrderNumber;

        if (rows.length > 0) {
            const lastOrderNumber = rows[0].numeroOrder;
            const lastIncrement = parseInt(lastOrderNumber.slice(4)) + 1; // Incrémenter la partie incrémentale
            newOrderNumber = `${year}${month}${lastIncrement.toString().padStart(4, '0')}`;
        } else {
            newOrderNumber = `${year}${month}0001`; // Premier numéro de commande pour ce mois et cette année
        }

        await dbConnexion.end();
        return newOrderNumber;

    } catch (error) {
        console.error('Erreur lors de la génération du numéro de commande:', error.message);
        throw new Error('Impossible de générer un numéro de commande');
    }
}

// Exemple d'utilisation lors de la création d'une nouvelle commande avec transactions
export async function createOrder(orderData, account) {
    const dbConnexion = await mysql.createConnection(config.connexion);
    await dbConnexion.beginTransaction(); // Démarrer la transaction

    try {
        if (!account) {
            throw new Error("L'utilisateur n'est pas défini. Assurez-vous que le middleware d'authentification est correctement configuré.");
        }

        const { idAccount, idAgent, idProfil, idFilialeSecondaire, idFilialePrincipale } = account;

        if (!idAccount || !idAgent || !idProfil || !idFilialeSecondaire || !idFilialePrincipale) {
            throw new Error("Certaines informations de l'utilisateur sont manquantes.");
        }

        const numeroOrder = await generateOrderNumber();
        const statutOrder = 'en attente'; // Statut par défaut pour une nouvelle commande

        const insertOrderQuery = {
            text: `INSERT INTO \`order\` (numeroOrder, dateOrder, volumeOrder, statutOrder, idAccount, idAgent, idProfil, idFilialeSecondaire, idFilialePrincipale, del)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            values: [
                numeroOrder,
                orderData.dateOrder,
                orderData.volumeOrder,
                statutOrder,
                idAccount,
                idAgent,
                idProfil,
                idFilialeSecondaire,
                idFilialePrincipale,
                false
            ]
        };

        const [rows] = await dbConnexion.execute(insertOrderQuery.text, insertOrderQuery.values);

        if (!rows.insertId) {
            throw new Error('Échec de la création de la commande.');
        }

        // Si tout s'est bien passé, valider la transaction
        await dbConnexion.commit();
        await dbConnexion.end();

        return {
            data: rows,
            message: 'Commande créée avec succès.'
        };

    } catch (error) {
        // En cas d'erreur, annuler la transaction
        await dbConnexion.rollback();
        await dbConnexion.end();

        return {
            message: error.message
        };
    }
}


export default {
    generateOrderNumber,
    createOrder
};
