import agentService from './../services/agent.service.js';

export function createAgent(req, res, next) {
    agentService.createAgent(req.body).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function getAllAgent(req, res, next) {
      // Récupérer les paramètres de requête (page et pageSize)
      const { page, pageSize } = req.query;
  
      // Passer les paramètres au service
      agentService.getAllAgent({ page, pageSize }).then((result) => {
          if (result.data) {
              res.status(200).json(result);
          } else {
              res.status(400).json(result);
          }
      }).catch(err => next(err));
  }
  

export function getAgentsByZone(req, res, next) {
    agentService.getAgentsByZone(parseInt(req.params.id)).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function getAllAgentsWithoutAccount(req, res, next) {
    agentService.getAllAgentsWithoutAccount().then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function getAgentByIdWithDetail(req, res, next) {
    agentService.getAgentByIdWithDetail(parseInt(req.params.id)).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function getAgentByMatricule(req, res, next) {
    agentService.getAgentByMatricule(req.body.matricule).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

export function updateAgent(req, res, next) {
    agentService.updateAgent(parseInt(req.params.id), req.body).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json({ data: null, message: 'Une erreur est survenue lors de l\'exécution de la requête.'});
    }).catch(err => next(err));
}

export function deleteAgent(req, res, next) {
    agentService.deleteAgent(parseInt(req.params.id)).then((result) => {
        result.data.length === 0 ? res.status(200).json(result) : res.status(400).json({ data: null, message: 'Une erreur est survenue lors de l\'exécution de la requête.'});
    }).catch(err => next(err));
}

export function importPersonnel(req, res, next) {
    agentService.importPersonnel(req.body).then((result) => {
        result.data ? res.status(200).json(result) : res.status(400).json(result);
    }).catch(err => next(err));
}

// Si vous avez besoin de ces fonctions plus tard, vous pouvez les décommenter et les exporter également.

// export function getQuantiteCommandeByArticleForAgent(req, res, next) {
//     agentService.getQuantiteCommandeByArticleForAgent(req.params.id).then((result) => {
//         result.data ? res.status(200).json(result) : res.status(400).json(result);
//     }).catch(err => next(err));
// }

// export function getMasseForAgentForActivePeriode(req, res, next) {
//     agentService.getMasseForAgentForActivePeriode(req.query.id).then((result) => {
//         result.data ? res.status(200).json(result) : res.status(400).json(result);
//     }).catch(err => next(err));
// }

export default {
    createAgent,
    getAllAgent,
    getAgentsByZone,
    getAllAgentsWithoutAccount,
    getAgentByIdWithDetail,
    getAgentByMatricule,
    updateAgent,
    deleteAgent,
    importPersonnel,
    // getQuantiteCommandeByArticleForAgent,
    // getMasseForAgentForActivePeriode
};
