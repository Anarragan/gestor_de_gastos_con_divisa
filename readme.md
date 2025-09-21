# 📊 Gestor de Gastos con Conversión de Divisas

Aplicación fullstack (Node.js + Vite) para la **gestión de gastos personales**.  
Permite registrar gastos, listarlos, eliminarlos y convertirlos a diferentes monedas usando una **API externa de divisas**.  
Además, incluye un **sistema de reportes automáticos** vía email, generados con cron jobs.

---

## 🚀 Funcionalidades

- **Gestión de gastos**:
  - Listar todos los gastos registrados.
  - Agregar un gasto nuevo con descripción, monto, moneda y categoría.
  - Eliminar gastos existentes.

- **Conversión de divisas**:
  - Conversión en tiempo real usando la API [ExchangeRate API](https://www.exchangerate-api.com/).
  - Posibilidad de consultar tasas de cambio del día.

- **Reportes automáticos por correo**:
  - Envío semanal (o la frecuencia definida en las variables de entorno).
  - Incluye listado detallado de gastos, total y agrupación por categorías.
  - Configurable para enviarse al correo deseado.

- **Frontend simple (Vite + JS)**:
  - Interfaz para gestionar gastos (lista a la izquierda, formulario al centro).
  - Visualización de tasas de cambio y conversor de divisas.

---

## 🛠️ Tecnologías usadas

- **Backend**: Node.js, Express, TypeScript, Nodemailer, Node-cron, Axios  
- **Frontend**: Vite, HTML, CSS, JavaScript  
- **API externa**: [ExchangeRate API](https://api.exchangerate-api.com/)  
- **Base**: Streams en memoria para manejo de gastos  

---

## 📂 Estructura del proyecto

/backend
/controllers
/routes
/services
/middlewares
/jobs
/models
/streams
index.ts
/frontend
/src
api.js
main.js
style.css
index.html

---

## ⚙️ Variables de entorno

### 🔹 Backend (`.env` en la carpeta `/backend`)

```env
# Puerto del servidor
PORT=3000

# API externa de divisas
API_URL=https://api.exchangerate-api.com/v4/latest/

# Configuración de Gmail para envío de reportes
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_app_password  # App password generado en Gmail
EMAIL_TO=correo_destino@gmail.com

para email pass usar app password de google

🔹 Frontend (.env en la carpeta /frontend)
# URL del backend
VITE_API_URL=http://localhost:3000

▶️ Instrucciones para correr el proyecto
1️⃣ Clonar el repositorio
git clone https://github.com/tuusuario/gestor-gastos.git
cd gestor-gastos

2️⃣ Configurar Backend
cd backend
npm install


Crear el archivo .env con las variables mencionadas.

Ejecutar el servidor:

npm run dev


El backend estará corriendo en http://localhost:3000
.

3️⃣ Configurar Frontend
cd frontend
npm install


Crear el archivo .env con la variable VITE_API_URL.

Ejecutar el servidor de desarrollo:

npm run dev


El frontend estará en http://localhost:5173
.

📧 Reportes automáticos

Los reportes se programan con cron jobs en el backend (/jobs/report.job.ts).

Por defecto se envían cada lunes a las 9AM (zona horaria Bogotá).

Para pruebas puedes usar un cron más corto (ej: cada 2 minutos: */2 * * * *).

El correo contendrá:

Listado de gastos detallados

Total de gastos en moneda base

Resumen por categorías