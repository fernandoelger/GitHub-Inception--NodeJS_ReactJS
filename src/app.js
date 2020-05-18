const express = require("express");
const cors = require("cors");
const {uuid, isUuid} = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];


function logRequest(request, response, next){
  const {method, url} = request;

  const logLabel = `[${method.toUpperCase()}], ${url}`;

  console.time(logLabel)
  next();
  console.timeEnd(logLabel);
}

app.use(logRequest);

app.get("/repositories", (request, response) => {
  const {title} = request.query;

  const results = title
    ? repositories.filter(repository => repository.title.includes(title))
    : repositories;

  return response.json(results);
});

app.post("/repositories", (request, response) => {
  const {title, url, techs} = request.body;

  const repository = {id: uuid(), title, url, techs};
  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const {id} = request.params;
  const {title, url, techs} = request.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id == id);
  
  if (repositoryIndex < 0){
    return response.status(400).json({error: 'Repository not found.'});
  }

  const repository = {id, title, url, techs}
  repositories[repositoryIndex] = repository;

  return response.status(200).json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  // TODO
});

app.post("/repositories/:id/like", (request, response) => {
  // TODO
});

module.exports = app;