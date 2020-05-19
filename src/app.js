const express = require("express");
const cors = require("cors");
const {uuid, isUuid} = require("uuidv4"); // Universal Unique ID 

const app = express();

app.use(express.json());
app.use(cors());

// print Method, Url and duration time in each request
function logRequest(request, response, next){
  const {method, url} = request;

  const logLabel = `[${method.toUpperCase()}], ${url}`;

  console.time(logLabel)
  next();
  console.timeEnd(logLabel);
}

function validateRepositoryID(request, response, next){
  const {id} = request.params;

  // Verify if the request ID is in uuid format
  if (!isUuid(id)){
    return response.status(400).json({error : 'Invalid Repository ID.'});
  }

  return next();
}

app.use(logRequest);
app.use("/repositories/:id", validateRepositoryID);

const repositories = [];

app.get("/repositories", (request, response) => {
  const {title} = request.query;

  // If title is not empty, return all repositories that contains title
  // Else return all repositories
  const results = title
    ? repositories.filter(repository => repository.title.includes(title))
    : repositories;

  return response.json(results);
});

app.post("/repositories", (request, response) => {
  const {title, url, techs} = request.body;

  const repository = {id: uuid(), title, url, techs, likes: 0};
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
  const {id} = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id == id);
  
  if (repositoryIndex < 0){
    return response.status(400).json({error: 'Repository not found.'});
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

// POST method because now we have two entities: repository and likes
// So we can create differents business rules for each one
app.post("/repositories/:id/like", (request, response) => {
  const {id} = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id == id);
  
  if (repositoryIndex < 0){
    return response.status(400).json({error: 'Repository not found.'});
  }

  repositories[repositoryIndex].likes++;

  return response.status(204).send();
});

module.exports = app;