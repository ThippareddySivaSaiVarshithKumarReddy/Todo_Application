const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
const format = require("date-fns/format");
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

const outputResult = (eachObj) => {
  return {
    id: eachObj.id,
    todo: eachObj.todo,
    priority: eachObj.priority,
    status: eachObj.status,
    category: eachObj.category,
    dueDate: eachObj.due_date,
  };
};

//API-1
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
    //Scenario 3
    case priority !== undefined && status !== undefined:
      query = `select * from todo where priority="${priority}" and status="${status}";`;
      todoSelect = await db.all(query);
      response.status(200);
      response.send(todoSelect.map((eachObj) => outputResult(eachObj)));
      break;
    //Scenario 7
    case priority !== undefined && category !== undefined:
      query = `select * from todo where priority="${priority}" and category="${category}";`;
      todoSelect = await db.all(query);
      response.status(200);
      response.send(todoSelect.map((eachObj) => outputResult(eachObj)));
      break;
    //Scenario 5
    case category !== undefined && status !== undefined:
      query = `select * from todo where category="${category}" and status="${status}";`;
      todoSelect = await db.all(query);
      response.status(200);
      response.send(todoSelect.map((eachObj) => outputResult(eachObj)));
      break;
    //Scenario 1
    case status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        query = `select * from todo where status="${status}";`;
        todoSelect = await db.all(query);
        response.status(200);
        response.send(todoSelect.map((eachObj) => outputResult(eachObj)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    //Scenario 2
    case priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        query = `select * from todo where priority="${priority}";`;
        todoSelect = await db.all(query);
        response.status(200);
        response.send(todoSelect.map((eachObj) => outputResult(eachObj)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    //Scenario 6
    case category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        query = `select * from todo where category="${category}";`;
        todoSelect = await db.all(query);
        response.status(200);
        response.send(todoSelect.map((eachObj) => outputResult(eachObj)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    //Scenario 4
    case search_q !== undefined:
      query = `select * from todo where todo like "%${search_q}%";`;
      todoSelect = await db.all(query);
      response.status(200);
      response.send(todoSelect.map((eachObj) => outputResult(eachObj)));
      break;
  }
});

//API-2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `select * from todo where id=${todoId};`;
  const todo = await db.get(query);
  response.send(outputResult(todo));
});

//API-3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isValid(new Date(date))) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    const query = `select * from todo where due_date="${newDate}";`;
    const todo = await db.all(query);
    response.send(todo.map((eachObj) => outputResult(eachObj)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API-4
app.post("/todos/", async (request, response) => {
  const { id, todo, status, priority, category, dueDate } = request.body;
  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const newDate = format(new Date(dueDate), "yyyy-MM-dd");
          const query = `insert into todo (id,todo,priority,status,category,due_date) values(${id},"${todo}","${priority}","${status}","${category}","${newDate}" );`;
          console.log(await db.run(query));
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
});

//API-5
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
    //Scenario 1
    case status !== "":
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        query = `update todo set status="${status}" where id=${todoId};`;
        await db.run(query);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    //Scenario 2
    case priority !== "":
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        query = `update todo set priority="${priority}" where id=${todoId};`;
        await db.run(query);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    //Scenario 2
    case todo !== "":
      query = `update todo set todo="${todo}" where id=${todoId};`;
      await db.run(query);
      response.send("Todo Updated");
      break;
    //Scenario 4
    case category !== "":
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        query = `update todo set category="${category}" where id=${todoId};`;
        await db.run(query);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    //Scenario 5
    case dueDate !== "":
      if (isValid(new Date(dueDate))) {
        const newDate = format(new Date(dueDate), "yyyy-MM-dd");
        query = `update todo set due_date="${newDate}" where id=${todoId};`;
        await db.run(query);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

//API-6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `delete from todo where id=${todoId};`;
  const deleteQuery = await db.run(query);
  response.send("Todo Deleted");
});

module.exports = app;
