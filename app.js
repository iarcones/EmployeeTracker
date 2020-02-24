const inquirer = require("inquirer")
require("console.table");

menu()

function menu () {
    inquirer
        .prompt([
            {
                type: "list",
                name: "cmd",
                message: "what do you want?",
                choices: [ "add", "view", "update", "delete" ]
            },
            {
                type: "list",
                name: "option",
                message: "VIEW: what do you want?",
                choices: [ "employee", "role", "department", "employee by manager" ],
                when: function (answer) {
                    return answer.cmd === "view"
                }
            },
            {
                type: "list",
                name: "option",
                message: "UPDATE: what do you want?",
                choices: [ "employee role", "employee manager" ],
                when: function (answer) {
                    return answer.cmd === "update"
                }
            },
            {
                type: "list",
                name: "option",
                // message: "ADD and DELETE: what do you want?",
                message: function (answer) {
                    if (answer.cmd === "add") { return "ADD: what do you want?" } else { return " DELETE: what do you want?" }
                },
                choices: [ "employee", "role", "department" ],
                when: function (answer) {
                    return answer.cmd === "delete" || answer.cmd === "add"
                }
            }

        ])
        .then(({ cmd, option }) => {
            console.log("responses:", cmd, option)

            switch (cmd) {
                case "add":
                    switch (option) {
                        case "employee":
                            addEmployee()
                            break;
                        case "role":
                            addRole()
                            break;
                        case "department":
                            addDepartment()
                            break;
                    }
                    break;
                case "view":
                    switch (option) {
                        case "employee":
                            viewEmployee()
                            break;
                        case "role":
                            viewRole()
                            break;
                        case "department":
                            viewDepartment()
                            break;
                        case "employee by manager":
                            viewEmployeeByManager()
                            break;
                    }
                    break;
                case "update":
                    switch (option) {
                        case "employee role":
                            updateEmployeeRole()
                            break;
                        case "employee manager":
                            updateEmployeeManager()
                            break;
                    }
                    break;

            }
        });
}

async function addDepartment () {

    const departmentRec = await inquirer
        .prompt([
            {
                type: 'input',
                name: "name",
                message: "Department name:",
            },

        ])
    console.log(departmentRec)
    result = await insertDepartment(departmentRec)
    menu()

}

async function addRole () {
    const departmentDb = await getDepartment()
    const departmentChoices = departmentDb.map(elem => {
        return {
            name: elem.name,
            value: elem.id
        }
    })

    const roleRec = await inquirer
        .prompt([
            {
                type: 'input',
                name: "title",
                message: "Title:",
            },
            {
                type: 'input',
                name: "salary",
                message: "Salary:",
            },
            {
                type: 'list',
                name: "department_id",
                message: "Department:",
                choices: departmentChoices
            },
        ])

    result = await insertRole(roleRec)
    menu()

}

async function addEmployee () {
    const rolesDB = await getRoles()
    const rolesChoices = rolesDB.map(elem => {
        return {
            name: elem.title,
            value: elem.id
        }
    })
    const managerDB = await getEmployees()
    const managerChoices = managerDB.map(elem => {
        return {
            name: elem.first_name + " " + elem.last_name,
            value: elem.id
        }
    })
    managerChoices.push({
        name: "no manager",
        value: null
    })


    const employeeRec = await inquirer
        .prompt([
            {
                type: 'input',
                name: "first_name",
                message: "First name:",
            },
            {
                type: 'input',
                name: "last_name",
                message: "Last name:",
            },
            {
                type: 'list',
                name: "role_id",
                message: "Role:",
                choices: rolesChoices
            },
            {
                type: 'list',
                name: "manager_id",
                message: "Manager:",
                choices: managerChoices
            },
        ])

    result = await insertEmployee(employeeRec)
    menu()

}

async function viewDepartment () {
    const result = await getDepartment()
    console.table(result)
    menu()
}

async function viewRole () {
    const result = await getRolesExtended()
    console.table(result)
    menu()
}

async function viewEmployee () {
    const result = await getEmployeesExtended()
    console.table(result)
    menu()
}

async function viewEmployeeByManager () {
    const managerDB = await getManagers()
    const managerChoices = managerDB.map(elem => {
        return {
            name: elem.first_name + " " + elem.last_name,
            value: elem.id
        }
    })
    const managerRec = await inquirer
        .prompt([
            {
                type: 'list',
                name: "manager_id",
                message: "Manager:",
                choices: managerChoices
            }

        ])

    result = await getEmployeesbyManagers(managerRec.manager_id)
  
    console.table(result)
    menu()
}

async function updateEmployeeRole () {

    const rolesDB = await getRoles()
    const rolesChoices = rolesDB.map(elem => {
        return {
            name: elem.title,
            value: elem.id
        }
    })
    const employeeDB = await getEmployees()
    const employeeChoices = employeeDB.map(elem => {
        return {
            name: elem.first_name + " " + elem.last_name,
            value: elem.id
        }
    })



    const employeeRec = await inquirer
        .prompt([
            {
                type: 'list',
                name: "employee_id",
                message: "Employee:",
                choices: employeeChoices
            },
            {
                type: 'list',
                name: "role_id",
                message: "Role:",
                choices: rolesChoices
            },

        ])

    result = await updateEmployeeRoleDB(employeeRec.employee_id,employeeRec.role_id)
    menu()

}

async function updateEmployeeManager () {

    const employeeDB = await getEmployees()
    const employeeChoices = employeeDB.map(elem => {
        return {
            name: elem.first_name + " " + elem.last_name,
            value: elem.id
        }
    })



    const employeeRec = await inquirer
        .prompt([
            {
                type: 'list',
                name: "employee_id",
                message: "Employee:",
                choices: employeeChoices
            },
            {
                type: 'list',
                name: "manager_id",
                message: "Manager:",
                choices: employeeChoices
            },

        ])

    result = await updateEmployeeManagerDB(employeeRec.employee_id,employeeRec.manager_id)
    menu()

}
// DB  - connection

const util = require("util");
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    // Your username
    user: "root",
    // Your password
    password: "password",
    database: "employees"
});

connection.connect();
// Setting up connection.query to use promises instead of callbacks
// This allows to use the async/await syntax
connection.query = util.promisify(connection.query);

// DB  - access
function getDepartment () {
    return connection.query("SELECT * FROM department")
}

function getRoles () {
    return connection.query("SELECT * FROM role")
}
function getRolesExtended () {
    return connection.query("SELECT role.id, role.title, role.salary, department.name AS department FROM role LEFT JOIN department on role.department_id = department.id")
}
function getEmployees () {
    return connection.query("SELECT * FROM employee")
}
function getEmployeesExtended () {
    return connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id")
}
// pending find all the managers
// function getEmployeesbyManagers (managerId) {
//     return connection.query("SELECT employee.manager_id, employee.first_name, employee.last_name, WHERE employee.manager_id = ? group by employee.manager_id = ?",
//     managerId)
// }
function getManagers () {
    return connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id WHERE employee.manager_id != 'null'" )
}

function insertDepartment (department) {
    return connection.query("INSERT INTO department SET ?", department);
}
function insertRole (role) {
    return connection.query("INSERT INTO role SET ?", role);
}

function insertEmployee (employee) {
    return connection.query("INSERT INTO employee SET ?", employee);
}

function updateEmployeeRoleDB(employeeId, roleId) {
    console.log("updaterole: ", employeeId, roleId)
    return connection.query(
      "UPDATE employee SET role_id = ? WHERE id = ?",
      [roleId, employeeId]
    );
  }

  function updateEmployeeManagerDB(employeeId, managerId) {
    console.log("updatemanager: ", employeeId, managerId)
    return connection.query(
      "UPDATE employee SET manager_id = ? WHERE id = ?",
      [managerId, employeeId]
    );
  }