const express = require('express');
const router = express.Router();
const axios = require('axios');
const { checkAuth } = require('../middlewares/authentication.js');
const colors = require('colors');


//models import
import Resource from '../models/emqx_resource.js';
import SaverRule from '../models/emqx_saver_rule.js';
import AlarmRule from '../models/emqx_alarm_rule.js';
import EmqxAuthRule from '../models/emqx_auth.js';
import Data from '../models/data.js';

import Device from '../models/device.js';

const auth = {
    auth: {
        username: 'admin',
        password: 'emqxsecret'
    }
};

var saverResource = null;
var alarmResource = null;



// ******************************
// ******     A   P   I     *****
// ******************************

router.post('/get-saver-rules', checkAuth, async (req, res) => {

    const userId = req.userData._id;

    const rules = await getSaverRules(userId);

    if (rules) {

        const response = {
            status: "success",
            rules: rules
        }

        return res.json(response);

    } else {

        const response = {
            status: "error",
        }

        return res.json(response);
    }

});

router.post('/update-saver-rules-status', checkAuth, async (req, res) => {

    const rule = req.body.rule;

    const r = await updateSaverRuleStatus(rule.emqxRuleId, rule.status)


    if (r.status == "success") {


        return res.json(r);

    } else {

        const response = {
            status: "error",
        }

        return res.json(response);
    }

});

router.post('/get-alarm-rules', checkAuth, async (req, res) => {

    const userId = req.userData._id;

    const alarms = await getAlarmRules(userId);

    if (alarms) {

        const response = {
            status: "success",
            alarms: alarms
        }

        return res.json(response);

    } else {

        const response = {
            status: "error",
        }

        return res.json(response);
    }

});

router.post('/create-alarm-rule', checkAuth, async (req, res) => {


    var newRule = req.body.newRule;
    newRule.userId = req.userData._id;

    var r = await createAlarmRule(newRule);

    if (r == "success") {

        const response = {
            status: "success",
        }

        return res.json(response);

    } else {
        const response = {
            status: "error",
        }

        return res.json(response);
    }

});

router.post('/update-alarm-rule', checkAuth, async (req, res) => {


    var rule = req.body.rule;

    var r = await updateAlarmRuleStatus(rule.emqxRuleId, rule.status);

    if (r == "success") {

        const response = {
            status: "success",
        }

        return res.json(response);

    } else {
        const response = {
            status: "error",
        }

        return res.json(response);
    }

});

router.post('/delete-alarm-rule', checkAuth, async (req, res) => {


    var rule = req.body.rule;

    var r = await deleteAlarmRule(rule.emqxRuleId);

    if (r == "success") {

        const response = {
            status: "success",
        }

        return res.json(response);

    } else {
        const response = {
            status: "error",
        }

        return res.json(response);
    }

});

router.get('/test', async (req, res) => {


    var rule = {
        userId: "userid",
        dId: "did",
        status: false,
        variable: "temp",
        condition: ">",
        value: 22,
        triggerTime: 33,
    }



    //var r = await deleteSaverRule("did")
    //var r = await createAlarmRule(rule)
    //var r = await updateAlarmRuleStatus('rule:77dc33d5',false);
    //var r = await deleteAlarmRule("rule:48c72d32")
    //var r = await deleteAllAlarmRules("userid","did");
    //var r = await getAlarmRules("userid")
    var r = await generateMqttCredentialsForUser("userid", "did");

    res.json(r);



    /**
        var  r = await EmqxAuthRule.create({
        userId:"userid",
        dId: "did",
        username: "userid",
        password: "password",
        publish:['userid/did/sdata'],
        subscribe: ['userid/did/actdata'],
        type: "device",
        time: Date.now()
    });

     */
});



// ******************************
// ******    WEB HOOKS      *****
// ******************************


router.post('/saver-webhook', async (req, res) => {

    try {
        
        if (req.headers.token != "121212") {
            res.sendStatus(404);
            return
        }

        if (req.headers.token == "121212") {

            const data = req.body;
            var result = await Device.find({ dId: data.payload.dId });

            if (result.length == 1) {
                data.payload.time = Date.now();
                await Data.create(data);
            }

        }

        res.sendStatus(200);

    } catch (error) {
        console.log(error)
    }


});


router.post('/alarms-webhook', async (req, res) => {

    console.log(req.body)
    res.sendStatus(200);

});



// ******************************
// ****** F U N C T I O N S *****
// ******************************

/*
 AUTH EMQX FUNCTIONS
*/
global.generateMqttCredentialsForUser = async function generateMqttCredentialsForUser(userId) {

    //primero corroboramos si ya existe una regla
    var rule = await EmqxAuthRule.find({ type: "user", userId: userId });

    //si no existe creamos una nueva
    if (rule.length == 0) {

        const newRule = {
            userId: userId,
            username: makeid(10),
            password: makeid(10),
            publish: [userId + "/#"],
            subscribe: [userId + "/#"],
            type: "user",
            time: Date.now()
        }

        const result = await EmqxAuthRule.create(newRule);

        return {
            status: "success",
            action: "created",
            mqttUsername: result.username,
            mqttPassword: result.password
        }

    }

    const newUsername = makeid(10);
    const newPassword = makeid(10);

    const result = await EmqxAuthRule.updateOne({ type: "user", userId: userId }, { $set: { username: newUsername, password: newPassword } });

    // update response example
    //{ n: 1, nModified: 1, ok: 1 }

    if (result.n == 1 && result.ok == 1) {
        return {
            status: "success",
            action: "updated",
            mqttUsername: newUsername,
            mqttPassword: newPassword
        }
    }

}

global.deleteMqttUserCredentials = async function deleteMqttUserCredentials(userId) {


    await EmqxAuthRule.deleteMany({ userId: userId, type: "user" });

    return {
        status: "success",
        action: "deleted",
    }

}

global.generateMqttCredentialsForDevice = async function generateMqttCredentialsForDevice(userId, dId) {

    //primero corroboramos si ya existe una regla
    var rule = await EmqxAuthRule.find({ type: "device", userId: userId, dId: dId });

    //si no existe creamos una nueva
    if (rule.length == 0) {

        const newRule = {
            userId: userId,
            dId: dId,
            username: makeid(10),
            password: makeid(10),
            publish: [userId + "/#"],
            subscribe: [userId + "/#"],
            type: "device",
            time: Date.now()
        }

        const result = await EmqxAuthRule.create(newRule);

        return {
            status: "success",
            action: "created",
            mqttUsername: result.username,
            mqttPassword: result.password
        }

    }

    const newUsername = makeid(10);
    const newPassword = makeid(10);

    const result = await EmqxAuthRule.updateOne({ type: "device", userId: userId, dId: dId }, { $set: { username: newUsername, password: newPassword } });


    // update response example
    //{ n: 1, nModified: 1, ok: 1 }

    if (result.n == 1 && result.ok == 1) {
        return {
            status: "success",
            action: "updated",
            mqttUsername: newUsername,
            mqttPassword: newPassword
        }
    }

}

global.deleteMqttDeviceCredentials = async function deleteMqttDeviceCredentials(dId) {


    await EmqxAuthRule.deleteMany({ dId: dId, type: "device" });

    return {
        status: "success",
        action: "deleted",
    }

}

/*
 SAVER RULES FUNCTIONS
*/

global.getSaverRules = async function getSaverRules(userId) {

    try {
        const rules = await SaverRule.find({ userId: userId });
        return rules;
    } catch (error) {
        return "error";
    }

}

global.createSaverRule = async function createSaverRule(userId, dId, status) {

    try {

        const url = "http://localhost:8085/api/v4/rules";

        const topic = userId + "/" + dId + "/sdata";

        const rawsql = "SELECT topic, payload FROM \"" + topic + "\" WHERE payload.save = 1";

        var newRule = {
            rawsql: rawsql,
            actions: [{
                name: "data_to_webserver",
                params: {
                    $resource: saverResource.id,
                    payload_tmpl: '{"userId":"' + userId + '","payload":${payload},"topic":"${topic}"}'
                }
            }],
            description: topic,
            enabled: status
        }


        //save rule in emqx - grabamos la regla en emqx
        const res = await axios.post(url, newRule, auth);

        if (res.data.data) {

            //save rule in mongo -- grabamos regla en mongo
            await SaverRule.create({

                userId: userId,
                dId: dId,
                emqxRuleId: res.data.data.id,
                status: status

            }).then(async (mongoRule) => {

                const url = "http://localhost:8085/api/v4/rules/" + mongoRule.emqxRuleId;

                const payload_templ = '{"userId":"' + userId + '","payload":${payload},"topic":"${topic}","emqxRuleId":"' + mongoRule.emqxRuleId + '"}';

                newRule.actions[0].params.payload_tmpl = payload_templ;

                const res = await axios.put(url, newRule, auth);


                console.log("New Saver Rule Created...".green);
                return "success";

            }).catch((err) => {
                console.log(err)
                console.log("Hubo un error creando mongo o EmqxRule")
                return "error";
            });

        } else {

            console.log("Error creating emqx saver rule");
            console.log(res.data);
            return "error";

        }

    } catch (error) {

        console.log(error);
        return "error";

    }

}


async function updateSaverRuleStatus(emqxRuleId, status) {

    const url = "http://localhost:8085/api/v4/rules/" + emqxRuleId;

    const newRule = {
        enabled: status
    }

    const res = await axios.put(url, newRule, auth);

    if (res.data.data) {
        await SaverRule.updateOne({ emqxRuleId: emqxRuleId }, { status: status })
        console.log("Saver Rule Status Updated...".green);
        return {
            status: "success",
            action: "updated"
        };
    }


}


global.deleteSaverRule = async function deleteSaverRule(dId) {
    try {

        const mongoRule = await SaverRule.findOne({ dId: dId });

        const url = "http://localhost:8085/api/v4/rules/" + mongoRule.emqxRuleId;

        const emqxRule = await axios.delete(url, auth);

        const deleted = await SaverRule.deleteOne({ dId: dId });

        return "success";

    } catch (error) {

        console.log(error);
        return "error";

    }
}



/*
 ALARMS RULES FUNCTIONS
*/

global.getAlarmRules = async function getAlarmRules(userId) {

    try {
        const rules = await AlarmRule.find({ userId: userId });
        return rules;
    } catch (error) {
        return "error";
    }

}

async function createAlarmRule(newAlarm) {

    try {

        const url = "http://localhost:8085/api/v4/rules";

        const topic = newAlarm.userId + "/" + newAlarm.dId + "/sdata";

        const rawsql = "SELECT username, topic, payload FROM \"" + topic + "\" WHERE payload.values." + newAlarm.variable + " " + newAlarm.condition + " " + newAlarm.value + " AND is_not_null(payload.values." + newAlarm.variable + ")";

        var newRule = {
            rawsql: rawsql,
            actions: [{
                name: "data_to_webserver",
                params: {
                    $resource: alarmResource.id,
                    payload_tmpl: '{"userId":"' + newAlarm.userId + '","payload":${payload},"topic":"${topic}"}'
                }
            }],
            description: topic,
            enabled: newAlarm.status
        }


        //save rule in emqx - grabamos la regla en emqx
        const res = await axios.post(url, newRule, auth);

        if (res.data.data) {

            //save rule in mongo -- grabamos regla en mongo
            await AlarmRule.create({

                userId: newAlarm.userId,
                dId: newAlarm.dId,
                emqxRuleId: res.data.data.id,
                status: newAlarm.status,
                variable: newAlarm.variable,
                value: newAlarm.value,
                condition: newAlarm.condition,
                triggerTime: newAlarm.triggerTime,


            }).then(async (mongoRule) => {

                const url = "http://localhost:8085/api/v4/rules/" + mongoRule.emqxRuleId;

                const payload_templ = '{"userId":"' + newAlarm.userId + '","payload":${payload},"topic":"${topic}","emqxRuleId":"' + mongoRule.emqxRuleId + '","value":' + newAlarm.value + ',"condition":"' + newAlarm.condition + '","variable":"' + newAlarm.variable + '","triggerTime":' + newAlarm.triggerTime + '}';

                newRule.actions[0].params.payload_tmpl = payload_templ;

                const res = await axios.put(url, newRule, auth);


                console.log("New Alarm Rule Created...".green);


            }).catch((err) => {
                console.log(err)
                console.log("Hubo un error creando mongo o EmqxRule")
            });

            return "success";

        } else {

            console.log("Error creating emqx saver rule");
            console.log(res.data);
            return "error";

        }

    } catch (error) {

        console.log(error);
        return "error";

    }

}

async function updateAlarmRuleStatus(emqxRuleId, status) {

    const url = "http://localhost:8085/api/v4/rules/" + emqxRuleId;

    const newRule = {
        enabled: status
    }

    const res = await axios.put(url, newRule, auth);

    if (res.data.data) {

        await AlarmRule.updateOne({ emqxRuleId: emqxRuleId }, { status: status })


        console.log("Saver Rule Status Updated...".green);

        return "success";
    }

}

//delete only one rule
async function deleteAlarmRule(emqxRuleId) {
    try {

        const url = "http://localhost:8085/api/v4/rules/" + emqxRuleId;

        const emqxRule = await axios.delete(url, auth);

        const deleted = await AlarmRule.deleteOne({ emqxRuleId: emqxRuleId });

        return "success";

    } catch (error) {

        console.log(error);
        return "error";

    }
}


// We can solve this by creating our own asyncForEach() method:
// thanks to Sebastien Chopin - Nuxt Creator :) 
// https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}


//delete all the rules of one device - borra todas las reglas de un dispositivo
// we use userId to handle when we have multiple users with the same device
// tenemos en cuenta el userId, pora explicar que puede ser útil si desarrollamos un sistema  a donde
// dos usuarios puedan tener registrados un mismo dispositivo
global.deleteAllAlarmRules = async function deleteAllAlarmRules(userId, dId) {
    try {

        const rules = await AlarmRule.find({ userId: userId, dId: dId });

        if (rules.length > 0) {


            asyncForEach(rules, async (rule) => {
                console.log(rule)
                const url = "http://localhost:8085/api/v4/rules/" + rule.emqxRuleId;
                const res = await axios.delete(url, auth);
                console.log(res.data)
            });


            await AlarmRule.deleteMany({ userId: userId, dId: dId });

        }

        return "success";

    } catch (error) {
        console.log(error);
        return "error";
    }
}




function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


// ****************************************
// ******** EMQX RESOURCES MANAGER ********
// ****************************************


/* This manager corroborates that there are 2 resources,
If there are none, then create them.
If there are one or more than two, issue a warning.
To manually delete the resources and restart node */

/* Este administrador corrobora que existan 2 recursos,
Si no hay ninguno, entonces los crea.
Si hay uno o más de dos, lanza advertencia. 
Para borrar manualmente los recursos y reiniciemos node */


async function listResources() {

    const url = "http://localhost:8085/api/v4/resources/";

    const res = await axios.get(url, auth);
    const size = res.data.data.length;

    if (size == 0) {
        console.log("***** Creating emqx webhook resources *****".green)
        createResources();
    } else if (size == 2) {

        //splitting resources
        res.data.data.forEach(resource => {

            if (resource.description == "ALARMS WEBHOOK") {
                alarmResource = resource;

                console.log("▼ ▼ ▼ ALARM RESOURCE FOUND ▼ ▼ ▼ ".bgBlue);
                console.log(alarmResource);
                console.log("▲ ▲ ▲ ALARM RESOURCE FOUND ▲ ▲ ▲ ".bgBlue);
                console.log("\n");
                console.log("\n");
            }

            if (resource.description == "SAVER WEBHOOK") {
                saverResource = resource;

                console.log("▼ ▼ ▼ SAVER RESOURCE FOUND ▼ ▼ ▼ ".bgBlue);
                console.log(saverResource);
                console.log("▲ ▲ ▲ SAVER RESOURCE FOUND ▲ ▲ ▲ ".bgBlue);
                console.log("\n");
                console.log("\n");
            }

        });

        console.log("***** Emqx webhooks resources count ok! *****".green);



    } else {

        function printWarning() {
            console.log("DELETE ALL WEBHOOK EMQX RESOURCES AND RESTART NODE - youremqxdomain:8085/#/resources".red);
            setTimeout(() => {
                printWarning();
            }, 1000);
        }

        printWarning();

    }

}


async function createResources() {

    //delete all posible resources
    await Resource.deleteMany({});

    const url = "http://localhost:8085/api/v4/resources";

    const data = {
        "type": "web_hook",
        "config": {
            url: "http://localhost:3001/api/saver-webhook",
            headers: {
                token: "121212"
            },
            method: "POST"
        },
        description: "SAVER WEBHOOK"
    }

    const data2 = {
        "type": "web_hook",
        "config": {
            url: "http://localhost:3001/api/alarms-webhook",
            headers: {
                token: "121212"
            },
            method: "POST"
        },
        description: "ALARMS WEBHOOK"
    }

    const res1 = await axios.post(url, data, auth);

    const res2 = await axios.post(url, data2, auth);

    await Resource.create({
        rId: res1.data.data.id,
        type: res1.data.data.type,
        description: res1.data.data.description,
        url: res1.data.data.config.url
    })

    await Resource.create({
        rId: res2.data.data.id,
        type: res2.data.data.type,
        description: res2.data.data.description,
        url: res2.data.data.config.url
    })

    setTimeout(() => {
        console.log("***** Emqx WH resources created! :) *****".green)
    }, 1000);

}

//start Emqx Resource Manager
setTimeout(() => {
    listResources();
}, 1000);



module.exports = router;



