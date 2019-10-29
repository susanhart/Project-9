"use strict";

// load modules
const express = require("express");
const morgan = require("morgan"); //request logger that prints stuff out about your server request for you
const Sequelize = require("sequelize"); //importing sequelize

// / This array is used to keep track of user records
// // as they are created.
// const users = [];

// /**
//  * Middleware to authenticate the request using Basic Authentication.
//  * @param {Request} req - The Express Request object.
//  * @param {Response} res - The Express Response object.
//  * @param {Function} next - The function to call to pass execution to the next middleware.
//  */


// // Construct a router instance.
// const router = express.Router();

// // Route that returns the current authenticated user.
// router.get('/users', authenticateUser, (req, res) => {
//   const user = req.currentUser;

//   res.json({
//     name: user.name,
//     username: user.username,
//   });
// });

// // Route that creates a new user.
// router.post('/users', [
//   check('name')
//     .exists({ checkNull: true, checkFalsy: true })
//     .withMessage('Please provide a value for "name"'),
//   check('username')
//     .exists({ checkNull: true, checkFalsy: true })
//     .withMessage('Please provide a value for "username"'),
//   check('password')
//     .exists({ checkNull: true, checkFalsy: true })
//     .withMessage('Please provide a value for "password"'),
// ], (req, res) => {
//   // Attempt to get the validation result from the Request object.
//   const errors = validationResult(req);

//   // If there are validation errors...
//   if (!errors.isEmpty()) {
//     // Use the Array `map()` method to get a list of error messages.
//     const errorMessages = errors.array().map(error => error.msg);

//     // Return the validation errors to the client.
//     return res.status(400).json({ errors: errorMessages });
//   }

//   // Get the user from the request body.
//   const user = req.body;

//   // Hash the new user's password.
//   user.password = bcryptjs.hashSync(user.password);

//   // Add the user to the `users` array.
//   users.push(user);

//   // Set the status to 201 Created and end the response.
//   return res.status(201).end();
// });

// module.exports = router;

// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";

// create the Express app
const app = express();
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./fsjstd-restapi.db"
});

//Allows SERVER to understand the body you are sending

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(express.json());

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
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please enter your first name'
        }
      }
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please enter your last name'
        }
      }
    },
    emailAddress: {
      type: Sequelize.STRING, //key, value
    allowNull: false,
      validate: {
        notNull: {
          msg: 'Please enter your email address'
        }
      }
    },
    password: {
      type: Sequelize.STRING,
    allowNull: false,
      validate: {
        notNull: {
          msg: 'Please enter your password'
        }
      }
  }
},
  { sequelize, modelName: "user" }
);

//Define associations between your models Within your User model,
//define a HasMany association between your User and Course models
//(i.e. a "User" has many "Courses").

// User.associate = models => {
//   User.hasMany(models.Course, { foreignKey: "userId", allowNull: false });
//   // TODO Add associations.
// };

// User.associate = function(models) {
//   User.hasMany(models.Course, {
//  foreignKey: {
//    fieldName: 'userId',
//    allowNull: false,
//  },
// });
// };


class Course extends Sequelize.Model {} //created Course class
Course.init(
  {
    //initializes the model object
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true //properties of the user
    },
    title: {
      type: Sequelize.STRING, //properties of the course
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please enter the course title'
        }
      }
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please enter the course description'
        }
      }
    },
    userId: {
      type: Sequelize.INTEGER,
      references: "user",
      referencesKey: "id",
    },
    estimatedTime: {
      type: Sequelize.STRING,
      allowNull: true
    },
    materialsNeeded: {
      type: Sequelize.STRING,
      allowNull: true
    },
  },
  { sequelize, modelName: "course" }
);

//Define associations between your models 
// Within your Course model, define a BelongsTo association
//between your Course and User models (i.e. a "Course" belongs to a single "User").

// Course.associate = models => {
//   Course.belongsTo(models.User, { foreignKey: "userId", allowNull: false });
// };

// Course.associate = function(models) {
//   Course.belongsTo(models.User, {
//   foreignKey: {
//    fieldName: 'userId',
//    allowNull: false,
//   },
//  });
// };
Course.belongsTo(User);
User.hasMany(Course);


Course.deleteCourse = async function(courseId) {
return Course.destroy({where:{id:courseId}})
}

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

//Create the user routes
//GET /api/users 200 - Returns the currently authenticated user
app.get("/api/users", (req, res) => {
  res.status(200).json({
    message: "User authenticated"
  });
});

//Create the course routes
//GET /api/courses 200 - Returns a list of courses (including the user that owns each course)

app.get("/api/courses", async (req, res) => {
    console.log("we got all courses")
    const courses = await Course.findAll();
      res.status(200).json({
        courses
      }); 
    }); 
   
    // ADD OWNER OF THE COURSE
    //GET /api/courses/:id 200 - Returns a the course (including the user that owns the course) for the provided course ID

    app.get("/api/course/:id", async (req, res) => {
      const id = req.params.id
      const courses = await Course.findByPk(id);
        res.status(200).json({
          courses
        }); 
      }); 
      
    //POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content 

app.post("/api/courses", async (req, res, next) => {
  const course = req.body
  console.log('debugging, here is the course: ',course)
  try{
    const id = await Course.create(course)
    console.log(id)
    res.status(201).end()
  }catch(err){
    console.log(err)
    //res.status(400).end()
    next(err)
  }
})

//PUT /api/courses/:id 204 - Updates a course and returns no content

app.put("/api/course/:id", async (req, res, next) => {
 
  try{

    console.log('id from put', req.params.id)
  const course = await Course.findByPk(req.params.id); 
  console.log('looked up course in PUT: ',course)
  await course.update(req.body);  
  
  res.status(204).end()

  } catch(err) {
    //res.status(400).send({
      next(err);
     // error: err
   // })
  }
})

//Create the course route
//DELETE /api/courses/:id 204 - Deletes a course and returns no content

app.delete("/api/course/:id", async (req, res) => {
  try{
    const course = await Course.findByPk(req.params.id);  
    const ret = await Course.deleteCourse(course.id); 
    console.log(ret) 
    res.status(204).end();
  } catch(err) {
    console.log(err)
    res.status(400).send({
      error: err
    })
  }
})



//Create the user routes
//POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content
app.post("/api/users", async (req, res, next) => {
  try {
//     var bcrypt = require('bcryptjs');
// bcrypt.genSalt(10, function(err, salt) {
//     bcrypt.hash("B4c0/\/", salt, function(err, hash) {
//         // Store hash in your password DB.
//     });
// });
// // Load hash from your password DB.
// bcrypt.compare("B4c0/\/", hash, function(err, res) {
//   // res === true
// });
// bcrypt.compare("not_bacon", hash, function(err, res) {
//   // res === false
// });

// // As of bcryptjs 2.4.0, compare returns a promise if callback is omitted:
// bcrypt.compare("B4c0/\/", hash).then((res) => {
//   // res === true
// });
// bcrypt.hash('bacon', 8, function(err, hash) {
// });
    console.log(req.body)
    const user = await User.create(req.body);
    const validated = await user.validate(); 
   // res.location('/');
    res.status(201).end();
} catch(err){ 
console.log(err)
next(err)
}

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
