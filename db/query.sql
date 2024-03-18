-- SELECT role.id, role.title, role.salary, department.name AS department
-- FROM role
-- JOIN department ON role.department_id = department.id

SELECT e.id,
       e.first_name,
       e.last_name,
       r.title,
       d.name AS department,
       r.salary,
       CONCAT(m.first_name, ' ', m.last_name) AS manager
FROM employee AS e
JOIN role AS r ON e.role_id = r.id
JOIN department AS d ON r.department_id = d.id
LEFT JOIN employee AS m ON e.manager_id = m.id;