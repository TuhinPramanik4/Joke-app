const path = require("path");
const express = require('express');
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();


mongoose.connect('Url of the data base ').then(()=>console.log("MongoDB connected"));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


app.set('view engine','ejs');
app.set("views",path.resolve("./views"));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); 
    },
  });
  const upload = multer({ storage });
const Creator = require('./models/creator');
const StringModel = require('./models/input');

let lastJokeId = null; 

app.get('/fetch-jokes', async (req, res) => {
    try {
        const jokes = await StringModel.find();
        
        if (jokes.length === 0) {
            return res.status(404).json({ error: 'No jokes found' });
        }

     
        let filteredJokes = jokes.filter(joke => joke._id.toString() !== lastJokeId);

       
        if (filteredJokes.length === 0) {
            filteredJokes = jokes;
        }

        const randomIndex = Math.floor(Math.random() * filteredJokes.length);
        const selectedJoke = filteredJokes[randomIndex];

        lastJokeId = selectedJoke._id.toString();

        res.json(selectedJoke);  
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch jokes' });
    }
});

app.get('/index', async (req, res) => {
    try {
      const creators = await Creator.find().sort({ votes: -1, createdAt: 1 });
      res.render('index', { creators });
    } catch (error) {
      res.status(500).send('Error loading creators');
    }
  });
  app.get('/', async (req, res) => {
    try {
      const topCreators = await Creator.find().sort({ votes: -1, createdAt: 1 }).limit(3);
      res.render('home', { topCreators });
    } catch (error) {
      res.status(500).send('Error loading top creators');
    }
  });

app.post('/creators', upload.single('picture'), async (req, res) => {
    const { name, youtubeLink } = req.body;
    const pictureUrl = req.file ? '/uploads/' + req.file.filename : '';
  
    const newCreator = new Creator({ name, youtubeLink, pictureUrl });
    await newCreator.save();
  
    res.redirect('/');
  });
  
app.post('/creators/:id/upvote', async (req, res) => {
    const creator = await Creator.findById(req.params.id);
    if (creator) {
      creator.votes += 1;
      await creator.save();
    }
    res.redirect('/');
  });
  
  app.post('/creators/:id/downvote', async (req, res) => {
    const creator = await Creator.findById(req.params.id);
    if (creator) {
      creator.votes -= 1;
      await creator.save();
    }
    res.redirect('/');
  });

  app.get('/top-creators', async (req, res) => {
    try {
      const topCreators = await Creator.find().sort({ votes: -1, createdAt: 1 }).limit(3);
      res.render('top', { topCreators });
    } catch (error) {
      res.status(500).send('Error loading top creators');
    }
  });
app.get("/",(req,res)=>{
    res.render("home");
})

app.post('/submit', async (req, res) => {
    const userInput = new StringModel({ content: req.body.userInput });
    await userInput.save(); 
    res.redirect('/');  
});
app.get('/submitCreator.ejs', (req, res) => {
    res.render('submitCreator');
});
app.get("/submit",(req,res)=>{
   res.render("submit");
})


app.listen(8000);