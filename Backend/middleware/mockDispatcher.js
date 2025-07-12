// middleware/mockDispatcher.js
const { match } = require("path-to-regexp");
const _ = require("lodash");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Middleware principal para despachar mocks según la configuración almacenada.
 */
module.exports = async (req, res, next) => {
  if (req.baseUrl.startsWith("/configure-mock")) return next();

  // Sanitiza query params
  for (const key in req.query) {
    if (typeof req.query[key] === "string") {
      req.query[key] = req.query[key].trim();
    }
  }
  // Sanitiza body params
  if (typeof req.body === "object" && req.body !== null) {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    }
  }

  const method = req.method.toUpperCase();
  const configs = await prisma.mockConfig.findMany({
    where: { metodo: method },
    include: { variations: true },
  });

  let matchedConfig = null;
  let routeParams = {};

  for (const config of configs) {
    const matcher = match(config.ruta, {
      decode: decodeURIComponent,
      end: true,
    });
    const matchResult = matcher(req.path);
    if (matchResult) {
      routeParams = matchResult.params || {};
      matchedConfig = config;
      break;
    }
  }

  if (!matchedConfig) return next();

  // Matching de variaciones
  let selectedVariation = null;
  if (matchedConfig.variations && matchedConfig.variations.length > 0) {
    selectedVariation = matchedConfig.variations.find((variation) => {
      const cond = variation.condition || {};
      return (
        Object.entries(cond.queryParams || {}).every(
          ([k, v]) => req.query[k] == v
        ) &&
        Object.entries(cond.bodyParams || {}).every(
          ([k, v]) => req.body[k] == v
        ) &&
        Object.entries(cond.headers || {}).every(
          ([k, v]) => req.headers[k.toLowerCase()] == v
        )
      );
    });
  }

  // Determina valores finales
  const status =
    (selectedVariation && selectedVariation.overrideStatusCode) ||
    parseInt(matchedConfig.statusCode.match(/\d{3}$/)?.[0] || 200, 10);
  const contentType =
    (selectedVariation && selectedVariation.overrideContentType) ||
    matchedConfig.contentType;
  const template =
    (selectedVariation && selectedVariation.overrideTemplate) ||
    matchedConfig.responseTemplate;

  // Renderiza la plantilla usando lodash.template y pasa todas las variables
  let body;
  try {
    body = _.template(template)({
      params: routeParams,
      query: req.query,
      body: req.body,
      headers: req.headers,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Error en la plantilla: " + e.message });
  }

  res.status(status).type(contentType).send(body);
};
