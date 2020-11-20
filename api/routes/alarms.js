const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middlewares/authentication.js');

//models import
import Device from '../models/device.js';


router.post('/update-alarms', checkAuth, async (req, res) => {

  try {

    const dId = req.body.dId;
    var config = req.body.config;
    const userId = req.userData._id;


    await Device.updateOne({ dId: dId, userId: userId }, {$set:{alarms:config}});

    const response = {
      status: "success",
    }

    return res.json(response)

  } catch (error) {
console.log(error)
    const response = {
      status: "error",
      error: error
    }

    return res.json(response);

  }

});

router.post('/get-alarms', checkAuth, async (req, res) => {

  try {

    const userId = req.userData._id;

    const alarms = await Alarm.find({ userId: userId });

    const response = {
      status: "success",
      alarms: alarms
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