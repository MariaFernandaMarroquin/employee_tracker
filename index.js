// Requiere inquirer and mysql2
const inquirer = require("inquirer");
const mysql = require('mysql2');

//Connect to database
const db = mysql.createConnection(
  {
    host: '127.0.0.1',
    user: 'root',
    password: 'pass123',
    database: 'employees_db'
  },
  console.log(`WELCOME TO EMPLOYEE TRACKER! Connected succesfully to the employees_db database. ✅`)
);

//Questions for user
const questions = [
  {
    type: "list",
    message: "What would you like to do?",
    name: "choice",
    choices: ["View All Departments", "Add Department", "View All Roles", "Add Role", "View All Employees", "Add New Employee", "Update Employee", "Exit"],
  }
];

const addDepartment = [
  {
    type: "input",
    name: "departmentName",
    message: "Name of the new department:",
  }
];

//Function for db.queries
async function queryFunc(data) {
  if (data.choice === "View All Departments") {
    db.query("SELECT * FROM departments", (err, results) => {
      console.table(results);
      init();
    });
  } else if (data.choice === "Add Department") {
    inquirer.prompt(addDepartment).then((answer) => {
      const department = answer.departmentName;
      db.query(`INSERT INTO departments (department_name) VALUES (?) `, department, () => {
        return init();
      })
    })
  } else if (data.choice === "View All Roles") {
    db.query("SELECT * FROM roles", (err, rolesResults) => {
      console.table(rolesResults);
      init();
    });
  } else if (data.choice === "Add Role") {
    const [departmentOptions] = await db.promise().query(`SELECT * FROM departments`); //Pulling the array out of the array
    console.log(departmentOptions);
    const addRole = [
      {
        type: "input",
        name: "role",
        message: "What is the name of the role?"
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of the role?"
      },
      {
        type: "list",
        message: "Which department does the role belong to?",
        name: "department",
        choices: departmentOptions.map((dp) => {
          return {
            name: dp.department_name,
            value: dp.id
          }
        }) 
      }
    ];
    inquirer.prompt(addRole).then((answer) => {
      const params = [answer.role, answer.salary, answer.department]
      db.query(
        `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`, params, () => {
        return init();
      })
    })
  }
}

//Function to initialize app
function init() {
  inquirer.prompt(questions).then((data) => {
    if (data.choice) {
      queryFunc(data);
    } else if (data.choice === "Exit") {
      console.log("Thanks for using Employee Tracker 👋")
    }
  })
}

init();
