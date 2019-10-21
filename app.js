"use strict";

// load modules
const express = require("express");
const morgan = require("morgan");
const Sequelize = require("sequelize"); //importing sequelize

// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";

// create the Express app
const app = express();
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./fsjstd-restapi.db"
});

//Define Your Sequelize Models

class User extends Sequelize.Model {} //created book class
User.init(
  {
    //initializes the model object
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true //properties of the user
    },
    firstName: {
      type: Sequelize.STRING
    },
    lastName: {
      type: Sequelize.STRING
    },
    emailAddress: Sequelize.STRING, //key, value
    password: Sequelize.STRING
  },
  { sequelize, modelName: "user" }
);

User.associate = models => {
  User.hasMany(models.Course, { foreignKey: "userId", allowNull: false });
  // TODO Add associations.
};

class Course extends Sequelize.Model {} //created Course class
Course.init(
  {
    //initializes the model object
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true //properties of the user
    },

    title: {
      type: Sequelize.STRING //properties of the course
    },
    description: {
      type: Sequelize.TEXT
    },
    estimatedTime: {
      type: Sequelize.STRING, //key, value
      allowNull: true
    },
    materialsNeeded: {
      type: Sequelize.STRING,
      allowNull: true
    }
  },
  { sequelize, modelName: "course" }
);
Course.associate = models => {
  Course.belongsTo(models.User, { foreignKey: "userId", allowNull: false });
};
//Define associations between your models Within your User model,
//define a HasMany association between your User and Course models
//(i.e. a "User" has many "Courses").
// Within your Course model, define a BelongsTo association
//between your Course and User models (i.e. a "Course" belongs to a single "User").

sequelize.authenticate().then(function(err) {
  console.log("Connection successful");
});

// setup morgan which gives us http request logging
app.use(morgan("dev"));

// TODO setup your api routes here

// setup a friendly greeting for the root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the REST API project!"
  });
});

//GET /api/users 200 - Returns the currently authenticated user
app.get("/api/users", (req, res) => {
  res.status(200).json({
    message: "User authenticated"
  });
});
//POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content
app.post("/api/users", (req, res) => {
  console.log(req)
  // User.create({
  //   firstName: req.data.firstName,
  //   lastName: req.data.lastName,
  //   email: req.data.email,
  //   password: req.data.password
  // }); 
  res.set("Location", "/");
  res.status(201).json({
    message: ""
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found"
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

// set our port
app.set("port", process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get("port"), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
