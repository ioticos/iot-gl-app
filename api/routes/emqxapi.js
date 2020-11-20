const express = require('express');
const router = express.Router();
const axios = require('axios');
const colors = require('colors');

//models import
import Resource from '../models/emqx_resource.js';
import EmqxRule from '../models/emqx_rule.js';

global.saverResource = null;
global.alarmResource = null;

const auth = {
    auth: {
        username: 'admin',
        password: 'emqxsecret'
    }
};

async function callapi() {
    const url = "http://localhost:8085/api/v4/rules";
    const res = await axios.get(url, auth);
    console.log(res.data);
}

async function createUpdateSaverRule(dId, status) {

    //search for existing rule in mongo db- buscamos si hay una regla previa en mongo
    const rule = await EmqxRule.findOne({ dId: dId });

    if (!rule) {

        try {
            const url = "http://localhost:8085/api/v4/rules";

            const topic = dId + "/sdata";

            //new rule -- preparamos nueva regla
            var newRule = {
                rawsql: "SELECT payload as msg, topic as topic FROM \"" + topic + "\" WHERE msg.save = 1",
                actions: [{
                    name: "data_to_webserver",
                    params: {
                        $resource: global.saverResource.id, 
                        payload_tmpl: ""
                    }
                }],
                description: topic,
                enabled: status
            } 

            //save rule in emqx - grabamos la regla en emques
            const res = await axios.post(url, newRule, auth);

            if (res.data.data) {

                //save rule in mongo -- grabamos regla en mongo
                EmqxRule.create({
                    dId: dId,
                    rawsql: res.data.data.rawsql,
                    id: res.data.data.id,
                    description: res.data.data.description,
                    type: "saver"
                });

                console.log("New Saver Rule Created...".green);
                return "success";
            }else{
                console.log("Error creating emqx saver rule")
                return "error";
            }
        } catch (error) {
            console.log(error);
            return "error";
        }

    }else{

        // if rule already exists, update status rule  - si la regla existe actualizamos el estado de regla
        const url = "http://localhost:8085/api/v4/rules/" + rule.id;

        var newRule = {
            enabled: status
        } 

        const res = await axios.put(url, newRule ,auth);
        return "updated"

    }


}



router.get('/updateCreateRule', async (req, res) => {


    var response = await createUpdateSaverRule("did", true);

    const r = {
        status: response,
    }

    return res.json(r)

});




router.post('/saver-webhook', async (req, res) => {


    var msg = (JSON.parse(req.body.msg))
    console.log(req.headers.token);

    const response = {
        status: "success",
    }

    return res.json(response)

});


router.post('/alarms-webhook', async (req, res) => {

    console.log(req.body.topic)

    const response = {
        status: "success",
    }

    return res.json(response)

});




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
                global.alarmResource = resource;

                console.log("▼ ▼ ▼ ALARM RESOURCE FOUND ▼ ▼ ▼ ".bgBlue);
                console.log(global.alarmResource);
                console.log("▲ ▲ ▲ ALARM RESOURCE FOUND ▲ ▲ ▲ ".bgBlue);
                console.log("\n");
                console.log("\n");
            }

            if (resource.description == "SAVER WEBHOOK") {
                global.saverResource = resource;

                console.log("▼ ▼ ▼ SAVER RESOURCE FOUND ▼ ▼ ▼ ".bgBlue);
                console.log(global.saverResource);
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

    console.log(res1.data);
    console.log(res2.data);

    setTimeout(() => {
        console.log("***** Emqx WH resources created! :) *****".green)
    }, 1000);

}

//start Emqx Resource Manager
setTimeout(() => {
    listResources();
}, 1000);


module.exports = router