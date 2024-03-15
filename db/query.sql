SELECT role.id, role.title, role.salary, department.name AS department
FROM role
-- WHERE role.title IS NOT NULL
JOIN department ON role.department_id = department.id