const cookieparser = process.server ? require('cookieparser') : undefined

export const state = () => ({
    auth: null,
    devices: [],
    selectedDevice: {},
    realTimeData: [],
    selectedRealTimeData: {}
})

export const mutations = {

    setAuth(state, auth) {
        state.auth = auth
    },

    setDevices(state, devices) {
        state.devices = devices;
    },

    setSelectedDevice(state, device) {
        state.selectedDevice = device;
    },

    setNewRealTimeData(state, data) {

        //buscamos si ese device ya tiene realtimedata y nos traemos el index
        var deviceIndex = state.realTimeData.findIndex(item => item.dId == data.dId);

        if (deviceIndex == -1) {

            var newData = {
                dId: data.dId,
                values: {
                    temp: {
                        value: null,
                        time: Date.now(),
                    },
                    hum: {
                        value: null,
                        time: Date.now(),
                    },
                    light: {
                        value: null,
                        time: Date.now(),
                    },
                },
            }

            state.realTimeData.push(newData);

            //utilizo assign solo para pisar las variables que vienen en newData.values
            if (data.values.temp) {
                state.realTimeData[state.realTimeData.length - 1].values.temp.value = data.values.temp
                state.realTimeData[state.realTimeData.length - 1].values.temp.time = data.time
            }

            if (data.values.hum) {
                state.realTimeData[state.realTimeData.length - 1].values.hum.value = data.values.hum
                state.realTimeData[state.realTimeData.length - 1].values.hum.time = data.time
            }

            if (data.values.light) {
                state.realTimeData[state.realTimeData.length - 1].values.light.value = data.values.light
                state.realTimeData[state.realTimeData.length - 1].values.light.time = data.time
            }



        } else {

            //utilizo assign solo para pisar las variables que vienen en newData.values
            //utilizo assign solo para pisar las variables que vienen en newData.values
            if (data.values.temp) {
                state.realTimeData[deviceIndex].values.temp.value = data.values.temp
                state.realTimeData[deviceIndex].values.temp.time = data.time
            }

            if (data.values.hum) {
                state.realTimeData[deviceIndex].values.hum.value = data.values.hum
                state.realTimeData[deviceIndex].values.hum.time = data.time
            }

            if (data.values.light) {
                state.realTimeData[deviceIndex].values.light.value = data.values.light
                state.realTimeData[deviceIndex].values.light.time = data.time
            }

        }

        


    }
}


export const actions = {

    readToken() {

        let auth = null;
        try {
            auth = JSON.parse(localStorage.getItem('auth'))
        } catch (err) {
            console.log(err)
        }
        //grabamos auth 
        this.commit('setAuth', auth)


    },


    //esto se ejecuta en cada refresh en lado servidor
    nuxtServerInit({ commit }, { req }) {

        let auth = null;

        if (req.headers.cookie) {

            const parsed = cookieparser.parse(req.headers.cookie) //leemos la cookie

            try {
                auth = JSON.parse(parsed.auth)
                //console.log(auth) (notar como este console.log se imprime del lado del servidor)
            } catch (err) {
                // No se encontró cookie válida
            }
        }


        //grabamos auth 
        commit('setAuth', auth)

    },
}