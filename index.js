const inquirer = require('inquirer');
const fs = require('fs');
const mysql = require('mysql2');

const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // MySQL password
    password: '1antarticA',
    database: 'employees_db',
  },
  console.log(`Connected to the classlist_db database.`)
);
// Select what to do
const destinationSelect = {
  type: 'list',
  message: 'What would you like to do?',
  choices: [
    'View All Departments',
    'View All Roles',
    'View All Employees',
    'Add a Department',
    'Add a Role',
    'Add an Employee',
    'Update an Employee Role',
  ],
  name: 'destinationSelect',
};
// Question for adding department
const addDepartmentQuestion = {
  type: 'input',
  message: 'What is the name of the new department?',
  name: 'departmentName',
};
// Questions for adding a role
const addRoleQuestion = [
  {
    type: 'input',
    message: 'What is the name of the role?',
    name: 'roleName',
  },
  {
    type: 'input',
    message: 'what is the salary of the role?',
    name: 'salaryQuestion',
  },
  {
    type: 'list',
    message: 'Which department does the role belong to?',
    name: 'departmentListQuestion',
  },
];
// Questions for adding an employee
const addEmployeeQuestion = [
  {
    type: 'input',
    message: 'What is the employees first name?',
    name: 'employeeFirstName',
  },
  {
    type: 'input',
    message: 'What is the employees last name?',
    name: 'employeeLastName',
  },
  {
    type: 'list',
    message: 'What is the employees role',
    name: 'employeeRole',
  },
  {
    type: 'list',
    message: 'Who is the employees manager?',
    name: 'employeeManager',
  },
];
// Questions for updating an employee
const updateEmployeeQuestion = [
  {
    type: 'list',
    message: 'Which employees role do you want to update?',
    name: 'employeeSelectUpdate',
  },
  {
    type: 'list',
    message: 'Which role do you want to assign the selected employee',
    name: 'roleSelectUpdate',
  },
];

selectDestination();
// function to get back to destination select 
function selectDestination() {
  inquirer.prompt(destinationSelect).then(answer => {
    if (answer.destinationSelect === 'View All Departments') {
      db.query('SELECT * FROM department', function (err, results) {
        if (err) {
          console.log(err);
        } else {
          console.table(results);
          selectDestination();
        }
      });
    } else if (answer.destinationSelect === 'View All Roles') {
      db.query(
        'SELECT role.id, role.title, role.salary, department.name AS department FROM role JOIN department ON role.department_id = department.id',
        function (err, results) {
          if (err) {
            console.log(err);
          } else {
            console.table(results);
            selectDestination();
          }
        }
      );
    } else if (answer.destinationSelect === 'View All Employees') {
      db.query(
        `SELECT e.id, 
          e.first_name, 
          e.last_name, 
          r.title, 
          d.name AS department, 
          r.salary, 
          CONCAT(m.first_name, ' ', m.last_name) AS manager
          FROM employee AS e
          JOIN role AS r ON e.role_id = r.id
          JOIN department AS d ON r.department_id = d.id
          LEFT JOIN employee AS m ON e.manager_id = m.id;`,
        function (err, results) {
          if (err) {
            console.log(err);
          } else {
            console.table(results);
            selectDestination();
          }
        }
      );
    } else if (answer.destinationSelect === 'Add a Department') {
      addDepartment();
    } else if (answer.destinationSelect === 'Add a Role') {
      addRole();
    } else if (answer.destinationSelect === 'Add an Employee') {
      addEmployee();
    } else if (answer.destinationSelect === 'Update an Employee Role') {
      updateEmployeeRole();
    }
  });
}

function addDepartment() {
  inquirer.prompt(addDepartmentQuestion).then(answer => {
    db.query(
      `INSERT INTO department (name)
              VALUES ("${answer.departmentName}")`,
      function (err, results) {
        if (err) {
          console.log(err);
        } else {
          console.log(`${answer.departmentName} added`);
          db.query('SELECT * FROM department', function (err, results) {
            if (err) {
              console.log(err);
            } else {
              console.table(results);
              selectDestination();
            }
          });
        }
      }
    );
  });
}

function addRole() {
  // Fetch department list from the database
  db.query('SELECT * FROM department', function (err, results) {
    if (err) {
      console.log(err);
    } else {
      // Extract department names from the results
      const departmentNames = results.map(department => department.name);

      // Add department list to the addRoleQuestion
      addRoleQuestion[2].choices = departmentNames;

      // Prompt the user with updated addRoleQuestion

      inquirer.prompt(addRoleQuestion).then(answer => {
        // Fetch department list from the database
        db.query('SELECT * FROM department', function (err, results) {
          if (err) {
            console.log(err);
          } else {
            // Debugging: Print out department list and selected department name
            console.log('Department List:', results);
            console.log('Selected Department:', answer.departmentListQuestion);

            // Find the department object based on department name
            const selectedDepartment = results.find(department => department.name === answer.departmentListQuestion);

            // Get the department id from the selected department object
            const departmentId = selectedDepartment.id;

            db.query(
              `INSERT INTO role (title, salary, department_id)
                VALUES ("${answer.roleName}", ${answer.salaryQuestion}, ${departmentId})`,
              function (err, results) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(`${answer.roleName} added`);
                  db.query(
                    'SELECT role.id, role.title, role.salary, department.name AS department FROM role JOIN department ON role.department_id = department.id',
                    function (err, results) {
                      if (err) {
                        console.log(err);
                      } else {
                        console.table(results);
                        selectDestination();
                      }
                    }
                  );
                }
              }
            );
          }
        });
      });
    }
  });
}

function addEmployee() {
  db.query(
    `SELECT role.id, role.title, role.salary, department.name AS department
            FROM role
            JOIN department ON role.department_id = department.id`,
    function (err, results) {
      if (err) {
        console.log(err);
      } else {
        const roles = results.map(role => role.title);

        addEmployeeQuestion[2].choices = roles;

        db.query(
          `SELECT e.id, 
                        e.first_name, 
                        e.last_name, 
                        r.title, 
                        d.name AS department, 
                        r.salary, 
                        CONCAT(m.first_name, ' ', m.last_name) AS manager
                 FROM employee AS e
                 JOIN role AS r ON e.role_id = r.id
                 JOIN department AS d ON r.department_id = d.id
                 LEFT JOIN employee AS m ON e.manager_id = m.id`,
          function (err, results) {
            if (err) {
              console.log(err);
            } else {
              const employees = results.map(employee => `${employee.first_name} ${employee.last_name}`);

              addEmployeeQuestion[3].choices = employees;

              inquirer.prompt(addEmployeeQuestion).then(answer => {
                db.query(
                  `SELECT role.id, role.title, role.salary, department.name AS department
                      FROM role
                      JOIN department ON role.department_id = department.id`,
                  function (err, results) {
                    if (err) {
                      console.log(err);
                    } else {
                      const selectedRole = results.find(role => role.title === answer.employeeRole);
                      const roleId = selectedRole.id;

                      db.query(
                        `SELECT e.id, 
                                  e.first_name, 
                                  e.last_name, 
                                  r.title, 
                                  d.name AS department, 
                                  r.salary, 
                                  CONCAT(m.first_name, ' ', m.last_name) AS manager
                           FROM employee AS e
                           JOIN role AS r ON e.role_id = r.id
                           JOIN department AS d ON r.department_id = d.id
                           LEFT JOIN employee AS m ON e.manager_id = m.id`,
                        function (err, results) {
                          if (err) {
                            console.log(err);
                          } else {
                            const selectedEmployee = results.find(
                              employee => `${employee.first_name} ${employee.last_name}` === answer.employeeManager
                            );
                            const managerId = selectedEmployee.id;

                            db.query(
                              `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                              VALUES ("${answer.employeeFirstName}", "${answer.employeeLastName}", ${roleId}, ${managerId})`,
                              function (err, results) {
                                if (err) {
                                  console.log(err);
                                } else {
                                  console.log(`${answer.employeeFirstName} ${answer.employeeLastName} added`);
                                  db.query(
                                    `SELECT e.id, 
                                  e.first_name, 
                                  e.last_name, 
                                  r.title, 
                                  d.name AS department, 
                                  r.salary, 
                                  CONCAT(m.first_name, ' ', m.last_name) AS manager
                          FROM employee AS e
                          JOIN role AS r ON e.role_id = r.id
                          JOIN department AS d ON r.department_id = d.id
                          LEFT JOIN employee AS m ON e.manager_id = m.id`,
                                    function (err, results) {
                                      if (err) {
                                        console.log(err);
                                      } else {
                                        console.table(results);
                                        selectDestination();
                                      }
                                    }
                                  );
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              });
            }
          }
        );
      }
    }
  );
}

function updateEmployeeRole() {
  db.query(
    `SELECT e.id, 
    e.first_name, 
    e.last_name, 
    r.title, 
    d.name AS department, 
    r.salary, 
    CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee AS e
    JOIN role AS r ON e.role_id = r.id
    JOIN department AS d ON r.department_id = d.id
    LEFT JOIN employee AS m ON e.manager_id = m.id`,
    function (err, results) {
      if (err) {
        console.log(err);
      } else {
        const employees = results.map(employee => `${employee.first_name} ${employee.last_name}`);
        updateEmployeeQuestion[0].choices = employees;

        db.query(
          `SELECT role.id, role.title, role.salary, department.name AS department
          FROM role
          JOIN department ON role.department_id = department.id`,
          function (err, results) {
            if (err) {
              console.log(err);
            } else {
              const roles = results.map(role => role.title);
              updateEmployeeQuestion[1].choices = roles;

              inquirer.prompt(updateEmployeeQuestion).then(answer => {
                db.query(
                  `SELECT e.id, 
            e.first_name, 
            e.last_name, 
            r.title, 
            d.name AS department, 
            r.salary, 
            CONCAT(m.first_name, ' ', m.last_name) AS manager
            FROM employee AS e
            JOIN role AS r ON e.role_id = r.id
            JOIN department AS d ON r.department_id = d.id
            LEFT JOIN employee AS m ON e.manager_id = m.id`,
                  function (err, results) {
                    if (err) {
                      console.log(err);
                    } else {
                      const selectedEmployee = results.find(
                        employee => `${employee.first_name} ${employee.last_name}` === answer.employeeSelectUpdate
                      );
                      const employeeId = selectedEmployee.id;

                      db.query(
                        `SELECT role.id, role.title, role.salary, department.name AS department
                FROM role
                JOIN department ON role.department_id = department.id`,
                        function (err, results) {
                          if (err) {
                            console.log(err);
                          } else {
                            const selectedRole = results.find(role => role.title === answer.roleSelectUpdate);
                            const roleId = selectedRole.id;

                            db.query(
                              `UPDATE employee
                SET role_id = '${roleId}'
                WHERE id = ${employeeId}`,
                              function (err, results) {
                                if (err) {
                                  console.log(err);
                                } else {
                                  db.query(
                                    `SELECT e.id, 
                      e.first_name, 
                      e.last_name, 
                      r.title, 
                      d.name AS department, 
                      r.salary, 
                      CONCAT(m.first_name, ' ', m.last_name) AS manager
                      FROM employee AS e
                      JOIN role AS r ON e.role_id = r.id
                      JOIN department AS d ON r.department_id = d.id
                      LEFT JOIN employee AS m ON e.manager_id = m.id`,
                                    function (err, result) {
                                      if (err) {
                                        console.log(err);
                                      } else {
                                        console.table(result);
                                        selectDestination();
                                      }
                                    }
                                  );
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              });
            }
          }
        );
      }
    }
  );
}
