import orderService from "./../services/order.service.js";

export function createOrder(req, res, next) {
  orderService
    .createOrder(req.body, req.user)
    .then((result) => {
      if (result.data) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    })
    .catch((err) => next(err));
}

export function getAllOrders(req, res, next) {
  const { page, pageSize } = req.query;

  orderService
    .getAllOrders({ page, pageSize })
    .then((result) => {
      if (result.data) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    })
    .catch((err) => next(err));
}

export function getOrderById(req, res, next) {
  orderService
    .getOrderById(parseInt(req.params.id))
    .then((result) => {
      if (result.data) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    })
    .catch((err) => next(err));
}

export function updateOrder(req, res, next) {
  orderService
    .updateOrder(parseInt(req.params.id), req.body)
    .then((result) => {
      if (result.data) {
        res.status(200).json(result);
      } else {
        res
          .status(400)
          .json({
            data: null,
            message:
              "Une erreur est survenue lors de l'exécution de la requête.",
          });
      }
    })
    .catch((err) => next(err));
}

export function deleteOrder(req, res, next) {
  orderService
    .deleteOrder(parseInt(req.params.id))
    .then((result) => {
      if (result.data.length === 0) {
        res.status(200).json(result);
      } else {
        res
          .status(400)
          .json({
            data: null,
            message:
              "Une erreur est survenue lors de l'exécution de la requête.",
          });
      }
    })
    .catch((err) => next(err));
}

export default {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
