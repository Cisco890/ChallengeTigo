// routes/mockConfig.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const rutaValidator = body("ruta")
  .isString()
  .matches(
    /^\/(?:[A-Za-z0-9_-]+|:[A-Za-z0-9_]+)(?:\/(?:[A-Za-z0-9_-]+|:[A-Za-z0-9_]+))*\/?$/
  )
  .withMessage(
    "La ruta debe empezar con / y los parámetros deben tener formato :nombre (ej: /api/:id)"
  );

router.post(
  "/",
  [
    rutaValidator,
    body("metodo").isString(),
    body("statusCode").isString(),
    body("contentType").isString(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const {
        ruta,
        metodo,
        queryParams = {},
        bodyParams = {},
        headers = {},
        statusCode,
        responseTemplate,
        contentType,
        variations,
      } = req.body;

      const mock = await prisma.mockConfig.create({
        data: {
          ruta,
          metodo,
          queryParams,
          bodyParams,
          headers,
          statusCode,
          responseTemplate,
          contentType,
          variations: variations ? { create: variations } : undefined,
        },
        include: { variations: true },
      });

      res.status(201).json(mock);
    } catch (err) {
      next(err);
    }
  }
);

// Lista todas las configuraciones con sus variaciones
router.get("/", async (req, res, next) => {
  try {
    const list = await prisma.mockConfig.findMany({
      include: { variations: true },
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Detalle de una configuración
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const config = await prisma.mockConfig.findUnique({
      where: { id },
      include: { variations: true },
    });
    if (!config) return res.status(404).json({ error: "No encontrado" });
    res.json(config);
  } catch (err) {
    next(err);
  }
});

// Reemplaza una configuración y sus variaciones
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const {
      ruta,
      metodo,
      queryParams,
      bodyParams,
      headers,
      statusCode,
      responseTemplate,
      contentType,
      variations,
    } = req.body;

    const updated = await prisma.mockConfig.update({
      where: { id },
      data: {
        ruta,
        metodo,
        queryParams,
        bodyParams,
        headers,
        statusCode,
        responseTemplate,
        contentType,
        variations: variations
          ? {
              deleteMany: {},
              create: variations,
            }
          : undefined,
      },
      include: { variations: true },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Elimina una configuración
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.mockConfig.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
