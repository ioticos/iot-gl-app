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


    //buscamos los dispositivos
    var devices = await Device.find({ userId: userId });

    devices = JSON.parse(JSON.stringify(devices));

    //buscamos las saverrules
    const saverRules = await global.getSaverRules(userId);

    //buscamos las alarmRules
    const alarmRules = await global.getAlarmRules(userId);

    

    //vamos a incluir savers rules en devices
    devices.forEach((device, index)=> {
        devices[index].saverRule = saverRules.filter(saverRule => saverRule.dId == device.dId);
        devices[index].alarmRules = alarmRules.filter(alarmRule => alarmRule.dId == device.dId);
    });

    console.log(devices);

    const response = {
      status: "success",
      devices: devices
    }

    return res.json(response);

  } catch (error) {
console.log(error);
    const response = {
      status: "error",
      error: error
    }

    return res.json(response);

  }

});

router.post('/new-device', checkAuth, async (req, res) => {

  try {

    const newDevice = await Device.create({
      userId: req.userData._id,
      dId: req.body.dId,
      name: req.body.name,
      selected: true ,
      analogValue: 0,
      time: Date.now()
    });

    //generamos saver rule
    await global.createSaverRule(newDevice.userId, newDevice.dId, true);

    //generamos credenciales mqtt para le device
    await global.generateMqttCredentialsForDevice(newDevice.userId, newDevice.dId);

    //dejamos el recien creado como seleccionado
    await Device.updateMany({ userId: newDevice.userId }, { selected: false }); //todos a false
    await Device.updateOne({ userId: newDevice.userId, dId: newDevice.dId }, { selected: true }) //solo el reciente a true

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


    //borramos reglas saver del device
    await global.deleteSaverRule(dId);

    //borramos reglas alarm del device
    await global.deleteAllAlarmRules(userId, dId)

    //borramos credenciales mqtt del dispositivo
    await global.deleteMqttDeviceCredentials(dId);


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