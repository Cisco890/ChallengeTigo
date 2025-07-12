const request = require("supertest");
const app = require("../app");

describe("API de Mocks", () => {
  let mockId;

  it("Debe rechazar rutas inválidas", async () => {
    const res = await request(app).post("/configure-mock").send({
      ruta: "/api/:", // inválida
      metodo: "GET",
      statusCode: "Ok_200",
      contentType: "application/json",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("Debe crear un mock simple", async () => {
    const res = await request(app).post("/configure-mock").send({
      ruta: "/api/hello",
      metodo: "GET",
      statusCode: "Ok_200",
      contentType: "application/json",
      responseTemplate: '{"msg": "hola"}',
    });
    expect(res.statusCode).toBe(201);
    mockId = res.body.id;
  });

  it("Debe responder al mock simple", async () => {
    const res = await request(app).get("/api/hello");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: "hola" });
  });

  it("Debe crear un mock con parámetro de ruta y plantilla dinámica", async () => {
    await request(app).post("/configure-mock").send({
      ruta: "/api/user/:id",
      metodo: "GET",
      statusCode: "Ok_200",
      contentType: "application/json",
      responseTemplate: '{"userId": "<%= params.id %>"}',
    });
    const res = await request(app).get("/api/user/123");
    expect(res.statusCode).toBe(200);
    expect(res.body.userId).toBe("123");
  });

  it("Debe crear un mock con variaciones condicionales", async () => {
    await request(app)
      .post("/configure-mock")
      .send({
        ruta: "/api/login",
        metodo: "POST",
        statusCode: "Ok_200",
        contentType: "application/json",
        responseTemplate: '{"status": "ok", "role": "user"}',
        variations: [
          {
            condition: { bodyParams: { usuario: "admin" } },
            overrideStatusCode: 200,
            overrideTemplate: '{"status": "ok", "role": "admin"}',
            overrideContentType: "application/json",
          },
          {
            condition: { bodyParams: { usuario: "banned" } },
            overrideStatusCode: 403,
            overrideTemplate: '{"status": "forbidden"}',
            overrideContentType: "application/json",
          },
        ],
      });

    // Caso admin
    let res = await request(app).post("/api/login").send({ usuario: "admin" });
    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe("admin");

    // Caso banned
    res = await request(app).post("/api/login").send({ usuario: "banned" });
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe("forbidden");

    // Caso user normal
    res = await request(app).post("/api/login").send({ usuario: "otro" });
    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe("user");
  });

  it("Debe sanitizar espacios en query y body", async () => {
    await request(app)
      .post("/configure-mock")
      .send({
        ruta: "/api/sanitiza",
        metodo: "POST",
        statusCode: "Ok_200",
        contentType: "application/json",
        responseTemplate: '{"valor": "<%= body.valor %>"}',
        bodyParams: { valor: "test" },
      });
    const res = await request(app)
      .post("/api/sanitiza")
      .send({ valor: " test " });
    expect(res.statusCode).toBe(200);
    expect(res.body.valor).toBe("test");
  });

  it("Debe aplicar rate limiting", async () => {
    // Simula muchas peticiones rápidas
    let limited = false;
    for (let i = 0; i < 110; i++) {
      const res = await request(app).get("/api/hello");
      if (res.statusCode === 429) {
        limited = true;
        break;
      }
    }
    expect(limited).toBe(true);
  }, 15000);
});
