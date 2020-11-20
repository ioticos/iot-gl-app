const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middlewares/authentication.js');

//models import
import Device from '../models/device.js';


router.post('/select-device', checkAuth, async (req, res) => {

  try {

    const dId = req.body.dId;
    const userId = req.userData._id;

    await Device.updateMany({ userId: userId }, { selected: false });

    await Device.updateOne({ userId: userId, dId: dId }, { selected: true })

    const response = {
      status: "success",
    }

    return res.json(response)

  } catch (error) {

    const response = {
      status: "error",
      error: error
    }

    return res.json(response);

  }

});


router.post('/get-devices', checkAuth, async (req, res) => {

  try {

    const userId = req.userData._id;


    const devices = await Device.find({ userId: userId });

    const response = {
      status: "success",
      devices: devices
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

router.post('/new-device', checkAuth, async (req, res) => {

  try {

    const dId = req.body.dId;
    const name = req.body.name;
    const userId = req.userData._id;
    const analogValue = 0;
    const time = Date.now();
    const selected = false;
    const alarms = {
      temp: {
        value: 0,
        act: false,
      },
      hum: {
        value: 0,
        act: false,
      },
      light: {
        value: 0,
        act: false,
      },
    }


    const newDevice = await Device.create({
      dId: dId,
      name: name,
      userId: userId,
      alarms: alarms,
      analogValue: analogValue,
      time: time,
      selected: selected
    });


    //dejamos el recien creado como seleccionado
    await Device.updateMany({ userId: userId }, { selected: false }); //todos a false
    await Device.updateOne({ userId: userId, dId: dId }, { selected: true }) //solo el reciente a true

    const response = {
      status: "success",
    }

    return res.json(response)

  } catch (error) {

    const response = {
      status: "error",
      error: error
    }

    return res.json(response);

  }

});

router.post('/delete-device', checkAuth, async (req, res) => {

  try {

    const userId = req.userData._id;
    const dId = req.body.dId;

    await Device.deleteOne({ userId: userId, dId: dId });


    //traigo los devices despues de la eliminación
    const devices = await Device.find({ userId: userId });


    //si los devices son 0 (no hay mas) respondo una respuesta especial
    if (devices.length == 0) {
      const response = {
        status: "error",
        error: "noDevices"
      }
      return res.json(response);
    }

    
    //los recorro en busquda de si hay un seleccionado
    var found = false;
    devices.forEach(devices => {
      if (devices.selected == true) {
        found = true;
      }
    });

    //si no encontré ningún seleccionado e sporque borré el seleccionado entonces ponemos el primero de la lista como seleccionado
    if (!found) {
      await Device.updateMany({ userId: userId }, { selected: false });
      await Device.updateOne({ userId: userId, dId: devices[0].dId }, { selected: true })
    }


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