// MODULES IMPORTED
import jwt from "jsonwebtoken";
import config from "./../config/config.js";
import Role from "./../model/role.js";
import mysql from "mysql2/promise.js";
import bcrypt from "bcrypt";
import res from "express/lib/response.js";

// CONSTANTES
const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,12}$/;

// FUNCTIONS EXPORTED
export async function authenticate(account) {
  // Paramètres
  const del = false;
  const utilisateur = {
    username: account.username,
    pwd: account.pwd,
  };

  // Vérification des paramètres
  if (!utilisateur.username || !utilisateur.pwd) {
    return {
      message: "Le nom d'utilisateur ou le mot de passe est manquant.",
    };
  }

  try {
    // Connexion à la base de données
    const dbConnexion = await mysql.createConnection(config.connexion);
    if (!dbConnexion) {
      return {
        message:
          "Une erreur est survenue lors de la connexion à la base de données.",
      };
    }

    let sqlSelectUser = { text: "", values: [] };

    if (["admin", "caisse"].includes(utilisateur.username)) {
      sqlSelectUser = {
        text: "SELECT * FROM account AS a INNER JOIN profil AS p ON a.idProfil = p.idProfil WHERE a.username = ? AND a.del = ? AND p.del = ?",
        values: [utilisateur.username, del, del],
      };
    } else {
      sqlSelectUser = {
        text: "SELECT * FROM account AS a INNER JOIN profil AS p ON a.idProfil = p.idProfil INNER JOIN agent AS ag ON a.idAgent = ag.idAgent WHERE a.username = ? AND a.del = ? AND p.del = ? AND ag.del = ?",
        values: [utilisateur.username, del, del, del],
      };
    }

    try {
      const [rows] = await dbConnexion.execute(
        sqlSelectUser.text,
        sqlSelectUser.values
      );

      // Si pas d'utilisateur trouvé
      if (rows.length === 0) {
        await dbConnexion.end();
        return {
          message: "Nom d'utilisateur ou mot de passe incorrect.",
        };
      }

      // Si utilisateur trouvé
      let userFound = {
        profil: {},
        agent: {},
      };

      userFound.idAccount = rows[0].idAccount;
      userFound.username = rows[0].username;
      userFound.idAgent = rows[0].idAgent;
      userFound.idProfil = rows[0].idProfil;
      userFound.profil.idProfil = rows[0].idProfil;
      userFound.profil.libelleProfil = rows[0].libelleProfil;
      userFound.agent.idAgent = rows[0].idAgent;
      userFound.agent.matricule = rows[0].matricule;
      userFound.agent.nom = rows[0].nom;
      userFound.agent.prenom = rows[0].prenom;
      userFound.role = rows[0].libelleProfil;
      userFound.pwd = rows[0].pwd;

      try {
        // bcrypt compare
        const resBCrypt = await bcrypt.compare(utilisateur.pwd, userFound.pwd);
        if (resBCrypt) {
          const token = jwt.sign(
            { sub: userFound.idAccount, role: userFound.role },
            config.secret
          );
          const { pwd, ...userWithoutPassword } = userFound;
          await dbConnexion.end();
          return {
            data: {
              ...userWithoutPassword,
              token,
            },
          };
        } else {
          await dbConnexion.end();
          return {
            message: "Nom d'utilisateur ou mot de passe incorrect.",
          };
        }
      } catch (errBcrypt) {
        await dbConnexion.end();
        return {
          message: errBcrypt.message,
        };
      }
    } catch (error) {
      await dbConnexion.end();
      return {
        message: error.message,
      };
    }
  } catch (errorConnexion) {
    return {
      message: errorConnexion.message,
    };
  }
}

export async function register(account) {
  const del = false;
  const utilisateur = {
    username: account.username,
    pwd: account.pwd,
    idAgent: account.idAgent,
    idProfil: account.idProfil,
  };

  // Vérification des paramètres
  if (
    !utilisateur.username ||
    !utilisateur.pwd ||
    !utilisateur.idAgent ||
    !utilisateur.idProfil
  ) {
    return {
      message: "Paramètres manquants",
    };
  }

  try {
    // Connexion à la base de données
    const dbConnexion = await mysql.createConnection(config.connexion);
    if (!dbConnexion) {
      return {
        message:
          "Une erreur est survenue lors de la connexion à la base de données.",
      };
    }

    try {
      const reqSearchUser = {
        text: "SELECT * FROM account WHERE username = ? AND del = ?",
        values: [utilisateur.username, del],
      };
      const [rows] = await dbConnexion.execute(
        reqSearchUser.text,
        reqSearchUser.values
      );

      if (rows.length > 0) {
        await dbConnexion.end();
        return {
          message: "Ce nom d'utilisateur existe déjà dans la Base de Données.",
        };
      }

      try {
        const bcryptedPwd = await bcrypt.hash(utilisateur.pwd, 5);

        const reqRegister = {
          text: "INSERT INTO account(username, pwd, idAgent, idProfil) VALUES (?, ?, ?, ?)",
          values: [
            utilisateur.username,
            bcryptedPwd,
            utilisateur.idAgent,
            utilisateur.idProfil,
          ],
        };

        try {
          const [registerResult] = await dbConnexion.execute(
            reqRegister.text,
            reqRegister.values
          );

          if (registerResult.insertId && registerResult.affectedRows === 1) {
            // SELECT ACCOUNT BY ID
            const result = await getUserById(registerResult.insertId);
            await dbConnexion.end();
            return {
              data: result.data,
              message: "Enregistrement du nouveau compte effectué avec succès.",
            };
          } else {
            await dbConnexion.end();
            return {
              message: "Échec de l'enregistrement du compte.",
            };
          }
        } catch (errRegister) {
          await dbConnexion.end();
          return {
            message: errRegister.message,
          };
        }
      } catch (errEncrypt) {
        await dbConnexion.end();
        return {
          message: errEncrypt.message,
        };
      }
    } catch (error) {
      await dbConnexion.end();
      return {
        message: error.message,
      };
    }
  } catch (errorConnexion) {
    return {
      message: errorConnexion.message,
    };
  }
}

export async function getUserById(idAccount) {
  const del = false;
  const searchAccountById = {
    text: "SELECT * FROM account AS ac INNER JOIN profil AS p ON ac.idProfil = p.idProfil INNER JOIN agent AS ag ON ac.idAgent = ag.idAgent WHERE ac.idAccount = ? AND ac.del = ? AND ag.del = ? AND p.del = ?",
    values: [idAccount, del, del, del],
  };

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);
    if (!dbConnexion) {
      return {
        message:
          "Une erreur est survenue lors de la connexion à la Base de Données.",
      };
    }

    try {
      const [rows] = await dbConnexion.execute(
        searchAccountById.text,
        searchAccountById.values
      );
      if (rows.length === 0) {
        return {
          data: rows,
          message: "Aucun compte utilisateur correspondant n'a été trouvé.",
        };
      } else {
        await dbConnexion.end();
        // Si utilisateur trouvé
        let userFound = {
          profil: {},
          agent: {},
        };
        userFound.idAccount = rows[0].idAccount;
        userFound.username = rows[0].username;
        userFound.idAgent = rows[0].idAgent;
        userFound.idProfil = rows[0].idProfil;
        userFound.profil.idProfil = rows[0].idProfil;
        userFound.profil.libelleProfil = rows[0].libelleProfil;
        userFound.agent.idAgent = rows[0].idAgent;
        userFound.agent.matricule = rows[0].matricule;
        userFound.agent.nom = rows[0].nom;
        userFound.agent.prenom = rows[0].prenom;
        userFound.role = rows[0].libelleProfil;

        return {
          data: userFound,
          message: "Chargement effectué avec succès.",
        };
      }
    } catch (errSearchAccount) {
      console.error(errSearchAccount);
      return {
        message: errSearchAccount.message,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      message: error.message,
    };
  }
}
// A mettre à jour
export async function getAllUsers() {
  const del = false;
  const searchAccountById = {
    text: `SELECT ac.idAccount, ac.username, ac.idAgent, ac.idProfil, 
                     p.libelleProfil, ag.matricule, ag.nom, ag.prenom 
               FROM account AS ac 
               INNER JOIN profil AS p ON ac.idProfil = p.idProfil 
               INNER JOIN agent AS ag ON ac.idAgent = ag.idAgent 
               WHERE ac.del = ? AND ag.del = ? AND p.del = ?`,
    values: [del, del, del],
  };

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);
    if (!dbConnexion) {
      return {
        message:
          "Une erreur est survenue lors de la connexion à la Base de Données.",
      };
    }

    try {
      const [rows, fields] = await dbConnexion.execute(
        searchAccountById.text,
        searchAccountById.values
      );
      if (rows.length === 0) {
        return {
          data: rows,
          message: "Aucun compte utilisateur correspondant n'a été trouvé.",
        };
      } else {
        await dbConnexion.end();
        let users = rows.map((user) => {
          return {
            idAccount: user.idAccount,
            username: user.username,
            idAgent: user.idAgent,
            idProfil: user.idProfil,
            profil: {
              idProfil: user.idProfil,
              libelleProfil: user.libelleProfil,
            },
            agent: {
              idAgent: user.idAgent,
              matricule: user.matricule,
              nom: user.nom,
              prenom: user.prenom,
            },
          };
        });

        return {
          data: users,
          message: "Chargement effectué avec succès.",
        };
      }
    } catch (errSearchAccount) {
      console.error(errSearchAccount);
      return {
        message: errSearchAccount.message,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      message: error.message,
    };
  }
}

export async function updateUserById(id, accountData) {
  if (!id) {
    return {
      data: undefined,
      message: "Veuillez spécifier l'élément à mettre à jour.",
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

    const updateUser = {
      text: "UPDATE account SET username = ?, idAgent = ?, idZoneDotation = ?, idProfil = ? WHERE idAccount = ? AND del = ?",
      values: [
        accountData.username,
        accountData.idAgent,
        accountData.idZoneDotation,
        accountData.idProfil,
        id,
        del,
      ],
    };
    try {
      const resultUpdate = await dbConnexion.execute(
        updateUser.text,
        updateUser.values
      );
      await dbConnexion.end();
      if (
        JSON.parse(JSON.stringify(resultUpdate))[0].affectedRows === 1 &&
        JSON.parse(JSON.stringify(resultUpdate))[0].changedRows === 1
      ) {
        const result = await getUserById(id);
        return {
          data: result.data,
          message: "Les informations de l'agent ont été modifiées avec succès.",
        };
      }
    } catch (errorUpdate) {
      await dbConnexion.end();
      return {
        message: errorUpdate.message,
      };
    }
  } catch (errorConnexion) {
    return {
      message: errorConnexion.message,
    };
  }
}

export async function updatePassword(id, pwdData) {
  const oldPwd = pwdData.oldPwd;
  const newPwd = pwdData.newPwd;
  if (!id) {
    return {
      data: undefined,
      message: "Veuillez spécifier l'élément à mettre à jour.",
    };
  }

  const del = false;
  // Requête de sélection du compte utilisateur
  const sqlSelectUser = {
    text: "SELECT * FROM account WHERE idAccount = ? AND del = ?",
    values: [id, del],
  };
  try {
    // Connexion à la Base de données
    const dbConnexion = await mysql.createConnection(config.connexion);
    if (!dbConnexion) {
      return {
        message:
          "Une erreur est survenue lors de la connexion à la base de données.",
      };
    }
    // console.log('CONNECTED*');
    try {
      // sélection du compte utilisateur
      const [rows, fields] = await dbConnexion.execute(
        sqlSelectUser.text,
        sqlSelectUser.values
      );
      // console.log(rows);
      // Si pas d'utilisateur
      if (rows.length == 0) {
        await dbConnexion.end();
        return {
          data: rows,
          message: "Utilisateur non trouvé dans la Base de Données.",
        };
      }
      // Si utilisateur
      try {
        // Comparaison de l'ancien mot de passe et du mot de passe enregistré en BD
        const resBCrypt = await bcrypt.compare(oldPwd, rows[0].pwd);
        // console.log('resBCrypt');
        // console.log(resBCrypt);
        // Si les deux mots de passe sont différents, retourner msg d'erreur
        if (!resBCrypt) {
          return {
            message:
              "L'ancien mot de passe saisie est différent du mot de passe en Base de Données.",
          };
        }
        // Cas où les deux mots de passes sont identiques
        try {
          const bcryptedPwd = await bcrypt.hash(newPwd, 5);
          const resetPwd = {
            text: "UPDATE account SET pwd = ? WHERE idAccount = ? AND del = ?",
            values: [bcryptedPwd, id, del],
          };
          try {
            const resultUpdate = await dbConnexion.execute(
              resetPwd.text,
              resetPwd.values
            );
            // console.log('resultUpdate');
            // console.log(resultUpdate);
            if (
              JSON.parse(JSON.stringify(resultUpdate))[0].affectedRows === 1 &&
              JSON.parse(JSON.stringify(resultUpdate))[0].changedRows === 1
            ) {
              const result = await getUserById(id);
              return {
                data: result.data,
                message: "Votre mot de passe a été changé avec succès.",
              };
            }
          } catch (errorExecution) {
            await dbConnexion.end();
            return {
              message: errorExecution.message,
            };
          }
        } catch (errorBcrypt) {
          await dbConnexion.end();
          return {
            message: errorBcrypt.message,
          };
        }
      } catch (errorBcryptCompar) {
        await dbConnexion.end();
        return {
          message: errorBcryptCompar.message,
        };
      }
    } catch (errorSelectUser) {
      await dbConnexion.end();
      return {
        message: errorSelectUser.message,
      };
    }
  } catch (errorConnexion) {
    return {
      message: errorConnexion.message,
    };
  }
}

export async function resetPassword(id, newPwd) {
  // console.log('resetPassword');
  // console.log(newPwd);
  if (!id) {
    return {
      data: undefined,
      message: "Veuillez spécifier l'élément à mettre à jour.",
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
    // console.log('CONNECTED*');
    try {
      const bcryptedPwd = await bcrypt.hash(newPwd, 5);
      const resetPwd = {
        text: "UPDATE account SET pwd = ? WHERE idAccount = ? AND del = ?",
        values: [bcryptedPwd, id, del],
      };
      try {
        const resultUpdate = await dbConnexion.execute(
          resetPwd.text,
          resetPwd.values
        );
        // console.log('resultUpdate');
        // console.log(resultUpdate);
        if (
          JSON.parse(JSON.stringify(resultUpdate))[0].affectedRows === 1 &&
          JSON.parse(JSON.stringify(resultUpdate))[0].changedRows === 1
        ) {
          const result = await getUserById(id);
          return {
            data: result.data,
            message:
              "Le mot de passe de l'agent a été réinitialisé avec succès.",
          };
        }
      } catch (errorExecution) {
        return {
          message: errorExecution.message,
        };
      }
    } catch (errorBcrypt) {
      return {
        message: errorBcrypt.message,
      };
    }
  } catch (errorConnexion) {
    return {
      message: errorConnexion.message,
    };
  }
}

export async function deleteUserById(id) {
  if (!id) {
    return {
      data: undefined,
      message: "Veuillez spécifier l'élément à mettre à jour.",
    };
  }
  // console.log('id');
  // console.log(id);
  // Vérifier si l'ID spécifié pour la modification indexe vraiment un enregistrement
  const resultFindUser = await getUserById(id);
  // console.log('resultFindUser');
  // console.log(resultFindUser);
  if (resultFindUser.data.length === 0) {
    return {
      data: resultFindUser.data,
      message: resultFindUser.message,
    };
  }

  /// account au lieu de user => source de l'erreur
  const updateUser = {
    text: "UPDATE account SET del = true WHERE idAccount = ?",
    values: [id],
  };

  try {
    const dbConnexion = await mysql.createConnection(config.connexion);
    if (!dbConnexion) {
      return {
        message:
          "Une erreur est survenue lors de la connexion à la base de données.",
      };
    }
    try {
      // console.log('CONNECTED');

      const resultUpdate = await dbConnexion.execute(
        updateUser.text,
        updateUser.values
      );
      // console.log('\nrows\n');
      // console.log(JSON.parse(JSON.stringify(resultUpdate)));
      if (
        JSON.parse(JSON.stringify(resultUpdate))[0].affectedRows === 1 &&
        JSON.parse(JSON.stringify(resultUpdate))[0].changedRows === 1
      ) {
        const result = await getUserById(id);
        await dbConnexion.end();
        return {
          data: result.data,
          message: "Suppression effectuée avec succès.",
        };
      }
    } catch (errorExecution) {
      // console.log('errorExecution');
      // console.log(JSON.parse(JSON.stringify(errorExecution)));
      // console.log(errorExecution.message);
      let data = await getUserById(id);
      return {
        data: data,
        message: errorExecution.message,
      };
    }
  } catch (errorConnexion) {
    return {
      message: errorConnexion.message,
    };
  }
}

export default {
  authenticate,
  getAllUsers,
  register,
  getUserById,
  updateUserById,
  updatePassword,
  resetPassword,
  deleteUserById,
};
