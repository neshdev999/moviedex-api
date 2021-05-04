require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const MDATA = require('./movies-data-small.json');
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';

const app = express();
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(morgan(morganSetting));

app.use(function validateBearerToken(req, res, next){
    const apiToken = process.env.API_NEW_TOKEN;
    const authToken = req.get('Authorization');

    debugger
    if(!authToken || authToken.split(' ')[1] !== apiToken){
        return res.status(401).json({error: 'Unauthorized request'});
    }

    // mov to the next middleware
    next();
});

app.use((error, req, res, next) => {
    let response;
    if(process.env.NODE_ENV === 'production'){
        response = { error: {message: 'server error'}}
    }else{
        response = { error }
    }
    res.status(500).json(response);
});



function handleGetMovie(req, res){

    let response = MDATA;

    // filter out movies by genre

    if(req.query.genre){
        response = response.filter(movie =>
                movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
            );
    }

    // filter out movies by country

    if(req.query.country){
        response = response.filter(movie =>
                movie.country.toLowerCase().includes(req.query.country.toLowerCase())
            );
    }

    // filter out movies by average votes

    if(req.query.avgVote){
        response = response.filter(movie => 
                Number(movie['avg_vote']) >= Number(req.query.avgVote)
            );
    }

    res.json(response);

}


app.get('/movie', handleGetMovie);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () =>{
    console.log('Server is listening at http://localhost:${PORT}');
});
