const express = require("express");
const fs = require("node:fs");
const app = express();
const multer = require("multer");
const upload = multer();

app.use(express.json());

const loadNotes = () => {
    try {
        const data = fs.readFileSync('notes.json', 'utf8');
        notes = JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            notes = [];
        } else {
            console.error('Error loading notes:', error.message);
        }
    }
};

const saveNotes = () => {
    try {
        const jsonNotes = JSON.stringify(notes, null, 2);
        fs.writeFileSync('notes.json', jsonNotes, 'utf8');
    } catch (error) {
        console.error('Error saving notes:', error.message);
    }
};

let notes = [];
app.get("/", (req, res) => {
    res.send("Hello!＼(^o^)／");
})

app.get("/UploadForm.html", (req, res) => {
    res.sendFile(__dirname + '/static/UploadForm.html');
})

app.get("/notes", (req, res) => {
    res.json(notes);
})

app.get("/notes/:note_name", (req, res) => {
    const note_name = req.params.note_name;

    const exists = notes.find(note => note.note_name === note_name);
    if (exists) {
        res.send(exists.note);
    } else {
        res.status(404).end();
    }
})

app.post("/upload", upload.none(), (req, res) => {
    const note_name = req.body.note_name;
    const note = req.body.note;

    const exists = notes.some(note => note.note_name === note_name);
    if (exists) {
        res.status(400).end();
    }
    else {
        notes.push({ note_name: note_name, note: note });
        saveNotes();
        res.status(201).end();
    }
})

app.delete("/notes/:note_name", (req, res) => {
    const note_name = req.params.note_name;

    const noteIndex = notes.findIndex(note => note.note_name === note_name);

    if (noteIndex !== -1) {
        notes.splice(noteIndex, 1);
        saveNotes();
        res.status(200).end();
    }
    else {
        res.status(400).end();
    }
})

app.put("/notes/:note_name", (req, res) => {
    const note_name = req.params.note_name;

    let new_note = '';

    req.on('data', chunk => {
        new_note += chunk
    });

    const noteIndex = notes.findIndex(note => note.note_name === note_name);

    req.on('end', () => {
        if (!new_note) {
            res.status(400).send("The request body should contain the updated note text.");
            return;
        }
        if (noteIndex !== -1) {
            notes[noteIndex].note = new_note;
            saveNotes();
            res.status(201).end();
        } else {
            res.status(400).end();
        }
    });
})

loadNotes();

app.listen(8000);