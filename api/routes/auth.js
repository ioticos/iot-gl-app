const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//models import
import User from '../models/user.js';

router.post('/login', async (req, res) => {

    try {
        const email = req.body.email.toLowerCase();
        const password = req.body.password;
        
        //looking for user with email ...
        var user = await User.findOne({ email: email });
        
        if (!user) {
    
            const response = {
                status: "error",
                error: "Invalid Credentials"
            }
       
            return res.json(response);
        }
    
        //comparing passwords
        if (bcrypt.compareSync(password, user.password)) {
            
            //deleting password with mongoose method. (delete user.passwort do not work because user is a mongoose object)
            user.set('password', undefined, {strict: false} );

            //Generating token
            const token = jwt.sign({userData: user}, 'securePasswordHere', { expiresIn: 60 * 60 * 24 * 30 }) // 30 days...

            const mqttCredentials = await global.generateMqttCredentialsForUser(user._id);

            user = user.toObject();
            user.mqttUsername = mqttCredentials.mqttUsername;
            user.mqttPassword = mqttCredentials.mqttPassword;
    
            const response = {
                token: token,
                userData: user,
            }

            console.log(response)
            
            return res.json(response);
    
        } else {
    
            const response = {
                status: "error",
                error: "Invalid Credentials"
            }
    
            return res.json(response);
        }
    } catch (error) {

        console.log("Error in try catch auth.js /login".red);
        console.log (error);

        const response = {
            status: "error",
            error: "Invalid Credentials"
        }

        return res.json(response);
    }

});

module.exports = router