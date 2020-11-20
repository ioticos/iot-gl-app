export default (context, inject) => {

    const startMqtt = () => {

        const options = {
          connectTimeout: 5000,
          // Authentication
          clientId: "dash_client_" + Math.floor(Math.random() * 1000000 + 1),
          username: "user",
          password: "password",
          keepalive: 60,
          clean: true,
          reconnectPeriod: 5000,
        };
    
        // WebSocket connect url
        const WebSocket_URL = "ws://127.0.0.1:8083/mqtt";
    
        var client = mqtt.connect(WebSocket_URL, options);
    
        client.on("connect", () => {
          console.log("Conexión MQTT exitosa!");
    
          client.subscribe(
            "userId/#", {
              qos: 0,
            },
            (err) => {
              console.log(
                "Suscripción a sdata exitosa"
              );
            }
          );
    
    
          client.subscribe(
            "appSender",
            (err) => {
              console.log(
                "Suscripción appSender  exitosa..."
              );
            }
          );
        });
    
    
        client.on("reconnect", (error) => {
          console.log("reconnecting:", error);
        });
    
        client.on("error", (error) => {
          //actualizamos las credenciales en caso de error...
          console.log("Connect Error:", error);
          client.options.clientId = "client_id_" + Math.floor(Math.random() * 1000000 + 1);
        });
    
        client.on("message", (topic, message) => {
          console.log(topic + " ,  " + message.toString())

          context.store.commit('setNewRealTimeData', JSON.parse(message.toString()))

          $nuxt.$emit('mqttMessage', {
            msg: message,
            topic: topic
          })
        });
    
    
      }
    
      inject('startMqtt', startMqtt);

}