# API para Mocks de Servicios REST

## Descripción

Esta API permite definir, gestionar y simular endpoints REST personalizados (mocks) para facilitar el desarrollo y pruebas de sistemas que dependen de servicios externos. Puedes configurar rutas, métodos, parámetros, encabezados, códigos de estado, respuestas dinámicas y variaciones condicionales.

---

## Estructura del Proyecto

```
Backend/
├── app.js
├── package.json
├── .env
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── routes/
│   └── mockConfig.js
├── middleware/
│   └── mockDispatcher.js
└── test/
    └── movkApi.test.js
```

---

## Instalación

1. **Clona el repositorio y entra al directorio:**

   ```bash
   git clone <REPO_URL>
   cd Backend
   ```

2. **Instala las dependencias:**

   ```bash
   npm install
   ```

3. **Configura la base de datos:**

   - Crea un archivo `.env` con tu cadena de conexión PostgreSQL:
     ```
     DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/tu_db
     ```
   - Ejecuta las migraciones:
     ```bash
     npx prisma migrate deploy
     npx prisma generate
     ```

4. **Inicia la API:**
   ```bash
   npm start
   ```
   Por defecto, la API corre en `http://localhost:3001`.

---

## Endpoints Principales

### 1. Configuración de Mocks

#### Crear un mock

**POST** `/configure-mock`

**Body de ejemplo:**

```json
{
  "ruta": "/api/hello",
  "metodo": "GET",
  "queryParams": {},
  "bodyParams": {},
  "headers": {},
  "statusCode": "Ok_200",
  "responseTemplate": "{\"msg\": \"hola\"}",
  "contentType": "application/json"
}
```

#### Crear un mock con parámetro de ruta y plantilla dinámica

```json
{
  "ruta": "/api/user/:id",
  "metodo": "GET",
  "statusCode": "Ok_200",
  "contentType": "application/json",
  "responseTemplate": "{\"userId\": \"<%= params.id %>\"}"
}
```

#### Crear un mock con variaciones condicionales

```json
{
  "ruta": "/api/login",
  "metodo": "POST",
  "statusCode": "Ok_200",
  "contentType": "application/json",
  "responseTemplate": "{\"status\": \"ok\", \"role\": \"user\"}",
  "variations": [
    {
      "condition": { "bodyParams": { "usuario": "admin" } },
      "overrideStatusCode": 200,
      "overrideTemplate": "{\"status\": \"ok\", \"role\": \"admin\"}",
      "overrideContentType": "application/json"
    },
    {
      "condition": { "bodyParams": { "usuario": "banned" } },
      "overrideStatusCode": 403,
      "overrideTemplate": "{\"status\": \"forbidden\"}",
      "overrideContentType": "application/json"
    }
  ]
}
```

---

### 2. Consulta y Gestión de Mocks

- **Listar todos:**  
  `GET /configure-mock`

- **Obtener uno:**  
  `GET /configure-mock/:id`

- **Actualizar:**  
  `PUT /configure-mock/:id`  
  (Mismo formato que POST)

- **Eliminar:**  
  `DELETE /configure-mock/:id`

---

### 3. Ejecución de Mocks

La API intercepta cualquier ruta configurada y responde según la configuración y variaciones.

**Ejemplo de uso con Postman:**

- **GET** `http://localhost:3001/api/hello`  
  Respuesta:

  ```json
  { "msg": "hola" }
  ```

- **GET** `http://localhost:3001/api/user/123`  
  Respuesta:

  ```json
  { "userId": "123" }
  ```

- **POST** `http://localhost:3001/api/login`  
  Body: `{ "usuario": "admin" }`  
  Respuesta:
  ```json
  { "status": "ok", "role": "admin" }
  ```

---

## Variaciones y Plantillas Dinámicas

- Puedes usar variables en la respuesta:
  - `params`: parámetros de ruta (`params.id`)
  - `query`: parámetros de query (`query.q`)
  - `body`: parámetros del body (`body.usuario`)
  - `headers`: encabezados (`headers['user-agent']`)

**Ejemplo de plantilla:**

```json
{
  "responseTemplate": "{\"user\": \"<%= params.id %>\", \"agent\": \"<%= headers['user-agent'] %>\"}"
}
```

---

## Validaciones y Seguridad

- **Validación de rutas y tipos** con `express-validator`.
- **Sanitización** de entradas (espacios, strings).
- **Rate limiting** básico para evitar abuso (100 requests/minuto por IP).
- **Manejo centralizado de errores**.

---

## Pruebas

- Pruebas automáticas con Jest y Supertest.
- Ejecuta los tests con:
  ```bash
  npm test
  ```

---

## Dependencias Principales

- `express`
- `@prisma/client` y `prisma`
- `express-validator`
- `lodash`
- `path-to-regexp`
- `jest` y `supertest` (dev)

---

## Recomendaciones

- Usa Postman para probar los endpoints.
- Consulta `/configure-mock` para ver la configuración actual.
- Si usas plantillas, asegúrate de usar solo las variables disponibles (`params`, `query`, `body`, `headers`).

---

## Arquitectura y Decisiones

- **Modularidad:** Separación de rutas, middleware y lógica de base de datos.
- **Extensible:** Fácil de agregar nuevos métodos HTTP, validaciones o lógica de variaciones.
- **Escalable:** Puedes cambiar el rate limiter o la base de datos fácilmente.

---
## Uso de IA
LLMs utilizadas ChatGPT y Copilot de Visual Studio Code

- **Instrucciones:** Después de leer yo las instrucciones y entenderals, le escribí lo que habia comprendido junto con las instrucciones originales para que me dijera si me faltaba algo y me marcara las partes más importanes.
- **DB:** Hice un boceto de una DB y le pedí que la revisara para agregar cosas que me pudieron haber faltado.
- **Datos para probar:** Le pedí que me diera datos para probar el funcionamiento de la API.
- **Errores de código:** Le iba pidiendo soluciones a errores que se iban presentando conforme programaba.

## Créditos

Desarrollado para el challenge de Tigo Start Summit por Juan Francisco Martínez
