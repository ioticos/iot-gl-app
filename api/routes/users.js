const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

//models import
import User from '../models/user.js';

router.post('/new-user', async(req, res) => {

  try {

    const encryptedPassword = bcrypt.hashSync(req.body.password, 10);

    const newUser = {
      name: req.body.name,
      email: req.body.email,
      password: encryptedPassword
    }

    const user = await User.create(newUser);

    const response = {
      status: "success"
    }

    return res.json(response);

  } catch (error) {

    const response = {
      status: "error",
      error: error
    }

    return res.json(response);
    
  }

});


module.exports = router