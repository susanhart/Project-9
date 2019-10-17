'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const Sequelize = require("sequelize"); //importing sequelize

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

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
      primaryKey: true, //properties of the user  
    },
    firstName: {
      type: Sequelize.STRING,
    },
    lastName: {
      type: Sequelize.STRING,
    },
    emailAddress: Sequelize.STRING, //key, value
    password: Sequelize.STRING
  },
  { sequelize, modelName: "user" }
); 

class Course extends Sequelize.Model {} //created Course class
Course.init(
  {
    //initializes the model object
    id: {
      type: Sequelize.INTEGER, 
      primaryKey: true, //properties of the user
    },
    userId: { //user ID references the User model and uses the id key, this is called a one-to-one relationship
      references: {
        model: User,
        key: 'id',
      }},
      title: {
         type: Sequelize.STRING, //properties of the book
      },
      description: {
      type: Sequelize.TEXT,
      },
      estimatedTime: Sequelize.STRING, //key, value
      materialsNeeded: Sequelize.STRING
  },
  { sequelize, modelName: "course" }
); 

sequelize.authenticate().then(function(err) {
  console.log('Connection successful');
})

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// TODO setup your api routes here

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
