const express = require('express');
const router = express.Router();
const Show = require('../models/show');

// Get shows by movie ID
router.get('/movie/:movieId', async (req, res) => {
    // console.log(req.params.movieId);
  try {
    const shows = await Show.find({ movie: req.params.movieId });
    res.json(shows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching shows' });
  }
});

router.post('/', async (req, res) => {
  const { movie, startTime,price, screen, seats } = req.body;
//   console.log(req.body);

  try {
    const newShow = new Show({
      movie,
      startTime,
      price,
      screen,
      seats,
    });
    await newShow.save();
    res.status(201).json(newShow);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating show' });
  }
});

router.get('/:id', async (req, res) => {
    // console.log(req.params.id);
  try {
    const show = await Show.findById(req.params.id).populate('movie');
    console.log(show);
    res.json(show);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching shows' });
  }
});

module.exports = router;
