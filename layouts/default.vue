<template>
  <div class="wrapper" :class="{ 'nav-open': $sidebar.showSidebar }">
    <notifications></notifications>

    <!-- Left Sidebar // Barra lateral izquieda -->
    <side-bar :background-color="sidebarBackground" short-title="CT" title="Creative Tim">
      <template slot-scope="props" slot="links">

        <sidebar-item :link="{
          name: 'Dashboard',
          icon: 'tim-icons icon-atom',
          path: '/dashboard'
        }"></sidebar-item>

        <sidebar-item :link="{
        name: 'Alarms',
        icon: 'tim-icons icon-bell-55',
        path: '/alarms'
      }"></sidebar-item>

        <sidebar-item :link="{
          name: 'Devices',
          icon: 'tim-icons icon-bulb-63',
          path: '/devices'
        }"></sidebar-item>

        <sidebar-item :link="{
          name: 'Device Simulator',
          icon: 'tim-icons icon-atom',
          path: '/dsimulator'
        }"></sidebar-item>

        </sidebar-item>


      </template>
    </side-bar>

    <div class="main-panel" :data="sidebarBackground">
      <dashboard-navbar></dashboard-navbar>
      <router-view name="header"></router-view>

      <div :class="{ content: true }" @click="toggleSidebar">
        <zoom-center-transition :duration="200" mode="out-in">
          <!-- your content here -->
          <nuxt />
        </zoom-center-transition>
      </div>
      <content-footer></content-footer>
    </div>
  </div>
</template>
<script>


  import PerfectScrollbar from 'perfect-scrollbar';
  import 'perfect-scrollbar/css/perfect-scrollbar.css';
  import mqtt from 'mqtt'

  function hasElement(className) {
    return document.getElementsByClassName(className).length > 0;
  }

  function initScrollbar(className) {
    if (hasElement(className)) {
      new PerfectScrollbar(`.${className}`);
    } else {
      // try to init it later in case this component is loaded async
      setTimeout(() => {
        initScrollbar(className);
      }, 100);
    }
  }

  import { SlideYDownTransition, ZoomCenterTransition } from 'vue2-transitions';

  export default {
    components: {
      ZoomCenterTransition
    },
    data() {
      return {
        sidebarBackground: 'primary', //vue|blue|orange|green|red|primary
        connection: {
          host: 'localhost',
          port: 8083,
          endpoint: '/mqtt',
          clean: true, // Reserved session
          connectTimeout: 4000, // Time out
          reconnectPeriod: 4000, // Reconnection interval
          // Certification Information
          clientId: null,
          username: null,
          password: null,
        },
        subscription: {
          topic: '',
          qos: 0,
        },
        client: {
          connected: false,
        },
        subscribeSuccess: false,
      };



    },
    mounted() {
      this.initScrollbar();
      setTimeout(() => {
        this.startMqtt();
      }, 2000);
    },

    methods: {



      startMqtt() {

        console.log("Starting MQTT");

        this.connection.clientId = "web_" + this.$store.state.auth.userData.name + "_" + Math.floor(Math.random() * 1000000 + 1);
        this.connection.username = this.$store.state.auth.userData.mqttUsername;
        this.connection.password = this.$store.state.auth.userData.mqttPassword;
        this.subscription.topic = this.$store.state.auth.userData._id + "/#";

        const { host, port, endpoint, ...options } = this.connection
        const connectUrl = `ws://${host}:${port}${endpoint}`

        try {
          this.client = mqtt.connect(connectUrl, options)
        } catch (error) {
          console.log('mqtt.connect error', error);
          return;
        }


        this.client.on('connect', () => {

          console.log('Connection succeeded!')
          const { topic, qos } = this.subscription

          this.client.subscribe(topic, { qos }, (err) => {
            if (err) {
              console.log('Subscribe to topics error', err);
              return;
            }
            this.subscribeSuccess = true
            console.log('Subscribed to topic' + topic)
          })

        });

        this.client.on('message', (topic, message) => {



          try {

            var obj = JSON.parse(message.toString());
            this.$store.commit('setNewRealTimeData', obj);

          } catch (error) {
            console.log(error)
          }



        })


        this.client.on('error', error => {
          console.log('Connection failed', error)
        })

        this.client.on("reconnect", (error) => {
          console.log("reconnecting:", error);
        });

        //escucho si se emite un mensaje desde devices (agrega o borra)
        this.$nuxt.$on('time-to-send-mqtt-message', (toSend) => {

          var msg = JSON.stringify(toSend.msg);

          this.client.publish(toSend.topic, msg);

        })

      },




      toggleSidebar() {
        if (this.$sidebar.showSidebar) {
          this.$sidebar.displaySidebar(false);
        }
      },
      initScrollbar() {
        let docClasses = document.body.classList;
        let isWindows = navigator.platform.startsWith('Win');
        if (isWindows) {
          // if we are on windows OS we activate the perfectScrollbar function
          initScrollbar('sidebar');
          initScrollbar('main-panel');
          initScrollbar('sidebar-wrapper');

          docClasses.add('perfect-scrollbar-on');
        } else {
          docClasses.add('perfect-scrollbar-off');
        }
      }
    }

  };
</script>

<style lang="scss">
  $scaleSize: 0.95;

  @keyframes zoomIn95 {
    from {
      opacity: 0;
      transform: scale3d($scaleSize, $scaleSize, $scaleSize);
    }

    to {
      opacity: 1;
    }
  }

  .main-panel .zoomIn {
    animation-name: zoomIn95;
  }

  @keyframes zoomOut95 {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
      transform: scale3d($scaleSize, $scaleSize, $scaleSize);
    }
  }

  .main-panel .zoomOut {
    animation-name: zoomOut95;
  }

  pre {
    padding: 5px;
    margin: 5px;
  }

  .string {
    color: rgb(93, 240, 93);
  }

  .number {
    color: rgb(53, 88, 247);
  }

  .boolean {
    color: blue;
  }

  .null {
    color: rgb(247, 222, 247);
  }

  .key {
    color: #fd5d93;
    font-weight: bold;
  }
</style>