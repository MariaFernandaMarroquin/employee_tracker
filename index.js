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

//Function for db.queries
async function queryFunc(data) {
  if (data.choice === "View All Departments") {
    db.query("SELECT * FROM departments", (err, results) => {
      console.table(results);
      init();
    });
  } else if (data.choice === "Add Department") {
    const addDepartment = [
      {
        type: "input",
        name: "departmentName",
        message: "Name of the new department:",
      }
    ];
    inquirer.prompt(addDepartment).then((answer) => {
      const department = answer.departmentName;
      db.query(`INSERT INTO departments (department_name) VALUES (?) `, department, () => {
        return init();
      })
    })
  } else if (data.choice === "View All Roles") {
    db.query("SELECT roles.id, roles.title, roles.salary, departments.department_name FROM roles LEFT JOIN departments ON roles.department_id = departments.id", (err, rolesResults) => {
      console.table(rolesResults);
      init();
    });
  } else if (data.choice === "Add Role") {
    const [departmentOptions] = await db.promise().query(`SELECT * FROM departments`); //Pulling the array out of the array
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
  } else if (data.choice === "View All Employees") {
    db.query("SELECT employees.id, employees.first_name, employees.last_name, employees.employee_role, employees.manager_name FROM employees", (err, employeesResults) => {
      console.table(employeesResults);
      init();
    });
  } else if (data.choice === "Add New Employee") {
    const [rolesOptions] = await db.promise().query(`SELECT * FROM roles`);
    const [managersOptions] = await db.promise().query (`SELECT * FROM employees`);
    const addEmployee = [
      {
        type: "input",
        name: "first_name",
        message: "What is the first name of the employee?"
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the last name of the employee?"
      },
      {
        type: "list",
        message: "What is the role of the employee?",
        name: "role",
        choices: rolesOptions.map((r) => {
          return {
            name: r.title,
            value: r.title
          }
        }) 
      },
      {
        type: "list",
        message: "Who is the manager of the employee?",
        name: "manager",
        choices: managersOptions.map((mn) => {
          return {
            name: mn.first_name,
            value: mn.first_name
          }
        }) 
      }
    ];
    inquirer.prompt(addEmployee).then((answer) => {
      const params = [answer.first_name, answer.last_name, answer.role, answer.manager]
      db.query(
        `INSERT INTO employees (first_name, last_name, employee_role, manager_name) VALUES (?, ?, ?, ?)`, params, () => {
        return init();
      })
    })
  }
}

//Function to initialize app
function init() {
  const questions = [
    {
      type: "list",
      message: "What would you like to do?",
      name: "choice",
      choices: ["View All Departments", "Add Department", "View All Roles", "Add Role", "View All Employees", "Add New Employee", "Exit"],
    }
  ];
  inquirer.prompt(questions).then((data) => {
    if (data.choice) {
      queryFunc(data);
    } else if (data.choice === "Exit") {
      console.log("Thanks for using Employee Tracker 👋")
    }
  })
}

init();
