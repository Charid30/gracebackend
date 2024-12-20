import express from 'express';
import authorize from './../utils/authorize.js';
import Role from './../model/role.js';
import authenticateToken from './../middlewares/authMiddleware.js';
import * as userController from './../controllers/user.controller.js';
import * as agentController from './../controllers/agent.controller.js';
import * as articleController from './../controllers/article.controller.js';
import * as profilController from './../controllers/profil.controller.js';
import * as directionController from './../controllers/direction.controller.js';
import * as secondaireController from './../controllers/secondaire.controller.js';
import * as orderController from './../controllers/order.controller.js';


// ROUTER
const apiRouter = express.Router();

// ROUTES FOR USER
apiRouter.route('/authenticate').post(userController.authenticate);
apiRouter.route('/register').post(authorize(Role.Admin), userController.register);
apiRouter.route('/user/:id').get(userController.getUserById);
apiRouter.route('/user/:id').put(authorize(Role.Admin), userController.updateUserById);
apiRouter.route('/user/:id').delete(authorize(Role.Admin), userController.deleteUserById);
apiRouter.route('/users').get(authorize(Role.Admin), userController.getAllUsers);
apiRouter.route('/user/update-pwd/:id').put(authorize([Role.Caisse, Role.CSAF, Role.Admin, Role.Agent]), userController.updatePassword);
apiRouter.route('/user/reset-pwd/:id').put(authorize(Role.Admin), userController.resetPassword);

// ROUTES FOR PROFIL
apiRouter.route('/profil').post(authorize(Role.Admin), profilController.createProfil);
apiRouter.route('/profils').get(authorize(Role.Admin), profilController.getAllProfils);
apiRouter.route('/profil/:id').delete(authorize(Role.Admin), profilController.deleteProfileById);

// ROUTES FOR AGENT
apiRouter.route('/agent').post(authorize(Role.Admin), agentController.createAgent);
apiRouter.route('/agents').get(authorize([Role.Caisse, Role.CSAF, Role.Admin, Role.Agent]), agentController.getAllAgent);
apiRouter.route('/agents/zone/:id').get(authorize([Role.Caisse, Role.CSAF, Role.Admin]), agentController.getAgentsByZone);
apiRouter.route('/agents/no-account').get(authorize(Role.Admin), agentController.getAllAgentsWithoutAccount);
apiRouter.route('/agent/:id').get(authorize([Role.Caisse, Role.CSAF, Role.Admin, Role.Agent]), agentController.getAgentByIdWithDetail);
apiRouter.route('/agent/matricule').post(authorize([Role.Caisse, Role.CSAF, Role.Admin, Role.Agent]), agentController.getAgentByMatricule);
apiRouter.route('/agent/:id').put(authorize(Role.Admin), agentController.updateAgent);
apiRouter.route('/agent/:id').delete(authorize(Role.Admin), agentController.deleteAgent);
apiRouter.route('/agents/import').post(authorize([Role.Caisse, Role.CSAF, Role.Admin]), agentController.importPersonnel);

// ROUTES FOR ARTICLE
apiRouter.route('/article').post(authorize([Role.Caisse, Role.Admin, Role.CSAF]), articleController.createArticle);
apiRouter.route('/articles').get(authorize([Role.Caisse]), articleController.getAllArticle);
apiRouter.route('/article/:id').get(authorize([Role.Caisse, Role.Admin, Role.CSAF]), articleController.getArticleById);
apiRouter.route('/article/:id').put(authorize([Role.Caisse, Role.Admin, Role.CSAF]), articleController.updateArticle);
apiRouter.route('/article/:id').delete(authorize([Role.Caisse, Role.Admin, Role.CSAF]), articleController.deleteArticle);

// ROUTES FOR DIRECTION
apiRouter.route('/direction').post(authorize(Role.Admin), directionController.createDirection);
apiRouter.route('/directions').get(authorize([Role.Admin, Role.Agent, Role.Caisse, Role.CSAF]), directionController.getAllDirections);
apiRouter.route('/direction/:id').get(authorize([Role.Admin, Role.Agent, Role.Caisse, Role.CSAF]), directionController.getDirectionById);
apiRouter.route('/direction/:id').put(authorize(Role.Admin), directionController.updateDirection);
apiRouter.route('/direction/:id').delete(authorize(Role.Admin), directionController.deleteDirection);

// ROUTES FOR FILIALE SECONDAIRE
apiRouter.route('/filialeSecondaire').post(authorize(Role.Admin), secondaireController.createFilialeSecondaire);
apiRouter.route('/filialesSecondaires').get(authorize([Role.Admin, Role.Agent, Role.Caisse, Role.CSAF]), secondaireController.getAllFilialesSecondaires);
apiRouter.route('/filialeSecondaire/:id').get(authorize([Role.Admin, Role.Agent, Role.Caisse, Role.CSAF]), secondaireController.getFilialeSecondaireById);
apiRouter.route('/filialeSecondaire/:id').put(authorize(Role.Admin), secondaireController.updateFilialeSecondaire);
apiRouter.route('/filialeSecondaire/:id').delete(authorize(Role.Admin), secondaireController.deleteFilialeSecondaire);

// ROUTES FOR ORDER
apiRouter.route('/order').post(authenticateToken, authorize([Role.Admin, Role.Agent, Role.Caisse]), orderController.createOrder);
apiRouter.route('/orders').get(authorize([Role.Admin, Role.Agent, Role.Caisse, Role.CSAF]), orderController.getAllOrders);
apiRouter.route('/order/:id').get(authorize([Role.Admin, Role.Agent, Role.Caisse, Role.CSAF]), orderController.getOrderById);
apiRouter.route('/order/:id').put(authorize([Role.Admin, Role.Agent]), orderController.updateOrder);
apiRouter.route('/order/:id').delete(authorize(Role.Admin), orderController.deleteOrder);


// EXPORT MODULE
export default apiRouter;