const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());
let db = null;
const initializeServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Running");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
initializeServer();

app.get("/todos/", async (request, response) => {
  let {
    search_q = "",
    todo,
    priority,
    status,
    category,
    dueDate,
  } = request.query;
  let query = "";
  let todoSend = "";
  switch (true) {
    case priority !== undefined && status !== undefined:
      query = `select * from todo where priority="${priority}" and status="${status}";`;
      todoSelect = await db.all(query);
      response.status(200);
      response.send(todoSelect);
      break;
    case priority !== undefined && category !== undefined:
      query = `select * from todo where priority="${priority}" and category="${category}";`;
      todoSelect = await db.all(query);
      response.status(200);
      response.send(todoSelect);
      break;
    case category !== undefined && status !== undefined:
      query = `select * from todo where category="${category}" and status="${status}";`;
      todoSelect = await db.all(query);
      response.status(200);
      response.send(todoSelect);
      break;
    case status !== undefined:
      query = `select * from todo where status="${status}";`;
      todoSelect = await db.all(query);
      response.status(200);
      response.send(todoSelect);
      break;
    case priority !== undefined:
      query = `select * from todo where priority="${priority}";`;
      todoSelect = await db.all(query);
      response.status(200);
      response.send(todoSelect);
      break;
    case category !== undefined:
      query = `select * from todo where category="${category}";`;
      todoSelect = await db.all(query);
      response.status(200);
      console.log(todoSelect);
      response.send(todoSelect);
      break;
    case search_q !== undefined:
      console.log(category);
      query = `select * from todo where todo like "%${search_q}%";`;
      todoSelect = await db.all(query);
      response.status(200);
      break;
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `select * from todo where id=${todoId};`;
  const todo = await db.get(query);
  response.send(todo);
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const query = `select * from todo where due_Date="${date}";`;
  const todo = await db.get(query);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, status, priority, category, dueDate } = request.body;
  const query = `insert into todo values(${id},"${todo}","${priority}","${status}","${category}","${dueDate}" );`;
  const todoPost = await db.run(query);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const {
    todo = "",
    status = "",
    priority = "",
    category = "",
    dueDate = "",
  } = request.body;
  const { todoId } = request.params;
  let query = "";
  switch (true) {
    case status !== "":
      query = `update todo set status="${status}" where id=${todoId};`;
      await db.run(query);
      response.send("Status Updated");
      break;
    case priority !== "":
      query = `update todo set priority="${priority}" where id=${todoId};`;
      await db.run(query);
      response.send("Priority Updated");
      break;
    case todo !== "":
      query = `update todo set todo="${todo}" where id=${todoId};`;
      await db.run(query);
      response.send("Todo Updated");
      break;
    case category !== "":
      query = `update todo set category="${category}" where id=${todoId};`;
      await db.run(query);
      response.send("Category Updated");
      break;
    case dueDate !== "":
      query = `update todo set due_date="${dueDate}" where id=${todoId};`;
      await db.run(query);
      response.send("dueDate Updated");
      break;
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `delete from todo where id=${todoId};`;
  const deleteQuery = await db.run(query);
  response.send("Todo Deleted");
});

module.exports = app;
