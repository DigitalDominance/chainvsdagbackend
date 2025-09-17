const express = require('express');

const router = express.Router();

// Example controller function for a route
const getExampleData = (req, res) => {
    res.json({ message: 'This is example data' });
};

// Define routes
router.get('/example', getExampleData);

// Export the router
module.exports = router;