- To run the web app (react only):
    - cd /webapp
    - npm install 
    - npm run build
    - npm start

- To create the database:
    - uncomment the follow lines in 'ScholarWatch.sql' to execute once, then recomment them:
        -- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password'; 
        -- CREATE SCHEMA `scholarwatch` ;

- To run the backend:
    - install xampp
    - replace '/xampp/htdocs' with '/scholarwatch/htdocs'
    - update your database credentials in '/htdocs/include/db.php'