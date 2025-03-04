

(One time only)
<!-- - To create the database:
    - You can use either mysql Workbench or use vscode extension ( Create a connection, export sql, give the connections name and its password in db.php)
    - uncomment the following lines in 'ScholarWatch.sql' to execute once, then recomment them:
        - ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password'; 
        - CREATE SCHEMA `scholarwatch` ; -->

(One time Only)
<!-- - To set the environment for backend:
    - install xampp
    - Go to the directory where you have xampp installed.
    - replace '/xampp/htdocs' folder with '/scholarwatch/htdocs' folder.
    - update your database credentials in '/htdocs/scholarwatch/include/db.php' -->

- To run the backend: 
    - Run xampp (Apache and MYSQl)

- To run the web app (react only):
    - cd /webapp
    - npm install (if required)
    - npm run build
    - npm start

-After you have made the changes use the following command to push the changes:
    -git status  //to check status
    -git add .  //to add all changes
    -git commit -m "Your descriptive message here"  //to commit them wiht a message
    -git branch //ensure you are on your own branch, your branch is highlighted green
    -git checkout <branch_name> //switch if needed
    -git push origin <branch_name>





