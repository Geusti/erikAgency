const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const videoController = require('../controllers/videoController');

// Lead collection API
router.post('/leads', leadController.submitLead);
router.get('/leads', leadController.listLeads);

// Video chunked stream API
router.get('/videos/:filename', videoController.streamVideo);

module.exports = router;
