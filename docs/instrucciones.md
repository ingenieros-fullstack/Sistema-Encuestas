¡Perfecto 🚀! Ahora que ya tienes el `docker-compose.yml`, el `.env`, y las carpetas (`mysql_data`, `mysql_init`, `backend`, `frontend`), te explico **paso a paso cómo levantar los contenedores**.

---

# 🐳 Levantar los contenedores con Docker Compose

### 🔹 1. Ubícate en la carpeta raíz del proyecto

Abre tu terminal (PowerShell en tu caso) y muévete a la ruta del proyecto:

```powershell
cd C:\Users\ruta\ruta\proyecto-encuestas
```

Aquí debe estar tu `docker-compose.yml`.

---

### 🔹 2. Construir las imágenes

Ejecuta el siguiente comando:

```powershell
docker-compose build
```

👉 Esto lee los **Dockerfile** de `backend/` y `frontend/`, descarga la imagen de **MySQL 8.0**, y genera las imágenes personalizadas.

---

### 🔹 3. Levantar los contenedores

Una vez construidas las imágenes, corre:

```powershell
docker-compose up
```

Esto levanta todo y te muestra los logs en la terminal.

* Si quieres que corran en **segundo plano (background)**:

```powershell
docker-compose up -d
```

---

### 🔹 4. Verificar los contenedores

Revisa que estén corriendo:

```powershell
docker ps
```

Deberías ver algo como:

```
CONTAINER ID   IMAGE             NAME                PORTS
xxxxxx         mysql:8.0         encuesta_mysql      0.0.0.0:3306->3306/tcp
xxxxxx         encuesta_backend  encuesta_backend    0.0.0.0:4000->4000/tcp
xxxxxx         encuesta_frontend encuesta_frontend   0.0.0.0:5173->5173/tcp
```

---

### 🔹 5. Probar los servicios

* **MySQL** → disponible en `localhost:3306` con los datos del `.env`.
* **Backend** → disponible en `http://localhost:4000` (cuando implementes las rutas en Express).
* **Frontend** → disponible en `http://localhost:5173` (servidor Vite).

---

### 🔹 6. Apagar los contenedores

Si los levantaste con `up -d` (modo background):

```powershell
docker-compose down
```

👉 Si además quieres borrar la base de datos (carpeta `mysql_data`), usa:

```powershell
docker-compose down -v
```

---

✅ Con esto ya tienes un flujo completo:

1. **Primera vez**: `docker-compose up --build` → crea imágenes y levanta todo.
2. **Siguientes veces**: `docker-compose up -d` → arranca en segundo plano.
3. **Parar**: `docker-compose down`.
4. **Reiniciar limpio**: `docker-compose down -v && docker-compose up --build`.

---

👉 ¿Quieres que te prepare un **script PowerShell (`up.ps1`)** que haga automáticamente el reinicio limpio (`down -v` + `up --build`), para que no tengas que escribir los comandos manualmente?
