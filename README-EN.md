# sistema-nutricion-tesis-backend

REST API contained in an ExpressJS server that serves as a backend for the mobile application for the degree project
**Sistema de Información Nutricional y Recomendación de Sustituciones Saludables de Productos Procesados para la Prevención de DMT2 en Cuenca**.

- This project contains both the business layer and the data layer (which accesses a Neo4j AuraDB graph database), as well as a conversational agent that uses the OpenAI API.

1. Recommended Versions (Development)

- NodeJS v12.18.3.
- NPM 6.14.6.
- Neo4j v5.x

2. Steps to Execute

- Clone or download this repository and run `npm install` to install the dependencies.
- Set the environment variables in the `.env` file according to the characteristics of your environment.
- Run `npm start` to start the server.

3. Environment Variable Considerations

- At the moment server errors are shown in client error pages because the `NODE_ENV` environment variable is in `development` mode by default. Set `NODE_ENV` to `production` mode to deploy the application and not show server errors on the client side.
- The `debug` logger is used for console debugging purposes in development. In order to view the `debug` logs, the `DEBUG` environment variable must be initialized to `sistema-nutricion-tesis-backend:*`. Set `DEBUG` to an empty string to display nothing (for production).

4. Example `.env` file

```
#### General Environment Variables #####

# HTTP port for the NodeJS application (3000 by default)
PORT='4000'
# Levels of the DEBUG utility to display these logs in the console
DEBUG='system-nutrition-thesis-backend:*'
# How to use the NodeJS application (default development)
NODE_ENV='development'

#### DB Neo4j variables #####

DATABASE_USERNAME="username"
DATABASE_PASSWORD="password"
DATABASE_URL="url"

#### OpenAI Variables (GPT) ####

OPENAI_API_KEY="apikey"
OPENAI_CHAT_COMPLETION_MODEL="gpt-3.5-turbo"

```

5. Authors

- Victor Herrera
- Pablo Solano

Students of Systems Engineering of the Faculty of Engineering of the University of Cuenca.