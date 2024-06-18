## Markdown-Notes-Taker
#### A simple Web Application using Text processing, Markdown libraries, persistent storage, REST API with file upload.
![Screenshot 2024-06-18 084529](https://github.com/ANMOLAGRAWAL7/Markdown-Notes-Taker/assets/138976989/1b5e9668-fe3e-430a-93b3-3f2ea2c93c77)

## Features of the Application:
---
### 1. Markdown to html render:
  --> Used [marked](https://www.npmjs.com/package/marked) npm for parsing marked down text to html
### 2. Grammar check feature:
--> Used [language tool](https://dev.languagetool.org/public-http-api) API to check for correct grammar syntax
### 3. Word pattern search within the note
--> Used KPM algorithm to find word patterns
### 4. Markdown file upload feature
--> Used [multer](https://www.npmjs.com/package/multer) npm to do file handling in javascript
### 5. Restful-API endpoints to Create, Read, Update and Delete notes
---
## Techstack:
1.HTML, CSS, JAVASCRIPT for Frontend \
2.NODE-JS,EXPRESS-JS,JAVASCRIPT For Backend \
3.Database: POSTGRES-SQL  

![Screenshot 2024-06-18 100616](https://github.com/ANMOLAGRAWAL7/Markdown-Notes-Taker/assets/138976989/19aea697-7de0-44b4-82ff-8aad6a4dba1f)
![Screenshot 2024-06-18 100714](https://github.com/ANMOLAGRAWAL7/Markdown-Notes-Taker/assets/138976989/7f5943aa-834e-4150-92f8-4e6dd8cd06ab)

### STEPS TO RUN THE APPLICATION:
1.Cd over to your folder \
2.Setup postgres databse as:
-->const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: your postgres database name,
  password:your postgres password,
  port: your postgres port,
});
3.run npm i \
4.run node index.js \
5.Headover to your browser at http://localhost:3000

