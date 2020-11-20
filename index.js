const express = require('express');
const Joi = require("joi");
const mongoose = require("mongoose");
const app = express();

mongoose.connect('mongodb://localhost/imdb')
    .then(() => console.log('Connected To mongodb'))
    .catch((err) => console.log('Exception Occured ', err));


const movieSchema = new mongoose.Schema({
    name: String,
    description: String,
    boxOfficeCollection: Number,
    budget: Number,
    isHit: Boolean,
    actors: [String],
    releaseDate: Date
})

const movies = [];
//movies - Movie
//actors - Actor
const Movie = mongoose.model('Movie', movieSchema);

//pipeline and middleware
app.use(express.json());

//{boxofficeCollection : {$e : 15}}

app.get('/api/v1/movies', (req, res) => {
    //Movie.find().limit(10).sort({name: 1}).select({name: 1, description: 1, releaseDate: 1}).then((movies) => res.send(movies));
    //Regular Expression => Movie.find({actors: {$in: [/.*manoj.*/i,/.*aamir.*/i]}}).then((movies) => res.send(movies));
    Movie.find().then(movies=> res.send(movies));
});

app.get('/api/v1/movies/:name', (req, res) => {
    const name = req.params.name;
    Movie.find({actors: {$in: [new RegExp(name,"i")]}}).then((movies) => res.send(movies));
});

app.post('/api/v1/movies', (req, res) => {

    //movie document 
    //Schema - Structure of the document that you are creating
    //Model - Compiled Schema which represents a class
    const movie = new Movie(req.body);

    movie.save().then((movie) => res.send(movie));
});

app.put('/api/v1/movies/:id', (req, res) => {
    const id = req.params.id;
    Movie.findByIdAndUpdate(id, req.body, {new: true, upsert: true}).then(result => {
        res.send(result);
    })
});


app.patch('/api/v1/movies/:id', (req, res) => {

    const id = req.params.id;
    Movie.findByIdAndUpdate(id, req.body, {new: true}).then(result => {
        if(!result) {
            res.status(404).send("Movie does not exist");
            return;
        }
        res.send(result);
    })
});

app.delete('/api/v1/movies/:id', (req, res) => {
    const id = req.params.id;
    //if id does not exist, return 404

    Movie.findByIdAndDelete(id, function(result) {
        if(!result) {
            res.status(404).send("Movie not found");
            return;
        }
        res.send(result);
    });
});

app.listen(3000, () => console.log('Listening'));