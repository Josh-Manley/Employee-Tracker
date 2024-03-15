const inquirer = require('inquirer');
const fs = require("fs");
const mysql = require('mysql2');

const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // MySQL password
    password: '1antarticA',
    database: 'employees_db'
  },
  console.log(`Connected to the classlist_db database.`)
);

const destinationSelect = {
  type: 'list',
  message: 'What would you like to do?',
  choices: ['View All Departments', 'View All Roles', 'View All Employees',
  'Add a Department', 'Add a Role', 'Add an Employee', 'Update an Employee Role'],
  name: 'destinationSelect'
}

inquirer.prompt(destinationSelect).then((answer) => {
  if (answer.destinationSelect === 'View All Departments') {
    db.query('SELECT * FROM department', function (err, results) {
      if (err) {
        console.log(err);
      } else {
        console.table(results);
      }
    });
  } else if (answer.destinationSelect === 'View All Roles') {
    db.query('SELECT * FROM role', function (err, results) {
      if (err) {
        console.log(err);
      } else {
        console.table(results);
      }
    });
  }
});