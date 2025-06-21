import express from "express";
import bodyParser from "body-parser";
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { marked } from "marked";
import env from "dotenv";;
import pg from "pg";
const app = express();
const port = 3000;
env.config();
// Multer File Upload Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: process.env.db_user,
  host: process.env.db_host,
  database: process.env.db_database,
  password:process.env.db_password,
  port: process.env.db_port,
});
db.connect();

app.get("/", (req, res) => {
  res.render("index.ejs");
})

app.post("/getmd", (req, res) => {
  const htmlcont = req.body.content;
  //console.log("html content is:",htmlcont);
  const markedparsed = marked.parse(htmlcont);
  //console.log("marked_content is:",markedparsed);
  res.json({ md: markedparsed });
});

// Upload File Endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    console.log("No file uploaded.");
    return res.status(400).send('No file uploaded.');
  }
  console.log(`File uploaded successfully: ${req.file.filename}`);
  res.json({ message: "File uploaded successfully" });
});

app.get("/getfilehtml", async (req, res) => {
  //console.log("it was called");
  const files = fs.readdirSync('uploads/');
  if (files.length === 0) {
    return res.json({ html: "No files uploaded" });
  }
  const latestFile = files[files.length - 1];
  //console.log(latestFile);
  const filePath = path.join('uploads', latestFile);
  //console.log(filePath);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const renderedHtml = marked.parse(fileContent);
  res.json({ html: renderedHtml });
});

// Grammar Check Endpoint
app.post('/checkgrammar', async (req, res) => {
  const text = req.body.text;
  try {
    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `text=${encodeURIComponent(text)}&language=en-US`
    });
    const data = await response.json();
    //console.log(data);
    res.json({ matches: data.matches });
  } catch (error) {
    console.error('Error checking grammar:', error);
    res.status(500).json({ error: 'Error checking grammar' });
  }
});

app.post("/search", (req, res) => {
  const { content, searchTerm } = req.body;
  // Implementing KMP algorithm for pattern matching
  const KMPSearch = (pattern, text) => {
    const M = pattern.length;
    const N = text.length;
    const lps = Array(M).fill(0);

    let j = 0; // index for pattern[]
    computeLPSArray(pattern, M, lps);

    let i = 0; // index for text[]
    const positions = [];
    while (i < N) {
      if (pattern[j] === text[i]) {
        j++;
        i++;
      }
      if (j === M) {
        positions.push(i - j);
        j = lps[j - 1];
      } else if (i < N && pattern[j] !== text[i]) {
        if (j !== 0) {
          j = lps[j - 1];
        } else {
          i++;
        }
      }
    }
    return positions;
  };

  const computeLPSArray = (pattern, M, lps) => {
    let len = 0;
    let i = 1;
    lps[0] = 0;
    while (i < M) {
      if (pattern[i] === pattern[len]) {
        len++;
        lps[i] = len;
        i++;
      } else {
        if (len !== 0) {
          len = lps[len - 1];
        } else {
          lps[i] = 0;
          i++;
        }
      }
    }
  };
  const positions = KMPSearch(searchTerm, content);
  res.json({ positions });
});
// Notes Dashboard Routes
app.get('/notesdashboard', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM notes ORDER BY created_at DESC');
    //console.log(result.rows);
    const notes = result.rows.map(note => ({
      ...note,
      content: marked.parse(note.content)
    }));
    res.render('notes.ejs', { notes});
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Error fetching notes' });
  }
});

app.post("/addnote",async(req,res)=>{
  const {title,note}=req.body;
 // console.log(title,note);
  try {
    await db.query('INSERT INTO notes (title, content) VALUES ($1, $2)', [title, note]);
    res.json({message:"Success in adding note to the database"});
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Error adding note' });
  }
});

// GET route to fetch a single note for editing
app.get('/editnote/:id', async (req, res) => {
  const noteId = req.params.id;
  try {
    const { rows } = await db.query('SELECT * FROM notes WHERE id = $1', [noteId]);
    if (rows.length === 0) {
      return res.status(404).send('Note not found');
    }
    const note = rows[0];
    res.render('editnote.ejs', { note });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).send('Error fetching note');
  }
});

// POST route to update a note
app.post('/updatenote/:id', async (req, res) => {
  const noteId = req.params.id;
  const { title, content } = req.body;
  const parsedContent = marked.parse(content);
  try {
    await db.query('UPDATE notes SET title = $1, content = $2 WHERE id = $3', [title, parsedContent, noteId]);
    res.redirect('/notesdashboard'); // Redirect to notes dashboard after update
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).send('Error updating note');
  }
});


// Delete Note
app.post('/deletenote/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM notes WHERE id = $1', [id]);
    console.log("note deleted with id:",id);
    res.redirect("/notesdashboard");
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).send('Error deleting note');
  }
});


app.listen(port,'0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
