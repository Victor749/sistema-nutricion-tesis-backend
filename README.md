# sistema-nutricion-tesis-backend

API REST contenida en un servidor ExpressJS que sirve como backend para la aplicación móvil para el proyecto de titulación
**Sistema de Información Nutricional y Recomendación de Sustituciones Saludables de Productos Procesados para la Prevención de DMT2 en Cuenca**.

- En este proyecto se contiene tanto la capa de negocio como la capa de datos (que accede a una base de datos de grafos Neo4j AuraDB), así como un agente conversacional que usa la API de OpenAI.

1. Versiones Recomendadas (Desarrollo)

- NodeJS v12.18.3. 
- NPM 6.14.6.
- Neo4j v5.x

2. Pasos para Ejecutar

- Clonar o descargar este repositorio y ejecutar `npm install` para instalar las dependencias.
- Establezca las variables de entorno en el archivo `.env` según las características de su entorno. 
- Ejecutar `npm start` para iniciar el servidor.

3. Consideraciones de Variables de Entorno

- Por el momento los errores de servidor se muestran en las páginas de error del cliente debido a que la variable de entorno `NODE_ENV` está en modo `development` por defecto. Establecer `NODE_ENV` a modo `production` para desplegar la aplicación y no mostrar errores del servidor en el lado del cliente. 
- Se utiliza el logger `debug` para motivos de depuración por consola en desarollo. Para poder visualizar los logs de `debug` se debe incializar la variable de entorno `DEBUG` a `sistema-nutricion-tesis-backend:*`. Definir `DEBUG` como una cadena vacía para no mostrar nada (para producción).

4. Archivo `.env` de ejemplo

```
#### Variables de Entorno Generales #####

# Puerto HTTP para la app NodeJS (3000 por defecto)
PORT='4000'
# Niveles de la utilidad DEBUG para mostrar dichos log en consola
DEBUG='sistema-nutricion-tesis-backend:*'
# Modo de despliegue de la app NodeJS (development por defecto)
NODE_ENV='development'

#### Variables de BD Neo4j #####

DATABASE_USERNAME="user"
DATABASE_PASSWORD="password"
DATABASE_URL="url"

#### Variables de OpenAI (GPT) #### 

OPENAI_API_KEY="apikey"
OPENAI_CHAT_COMPLETION_MODEL="gpt-3.5-turbo"

```

5. Autores

- Víctor Herrera
- Pablo Solano

Estudiantes de Ingeniería en Sistemas de la Facultad de Ingeniería de la Universidad de Cuenca.