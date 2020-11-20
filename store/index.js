const cookieparser = process.server ? require('cookieparser') : undefined

export const state = () => ({
    auth: null,
    devices:[],
    selectedDevice:{},
    realTimeData:[

    ]
})

export const mutations = {

    setAuth(state, auth) {
        state.auth = auth
    },

    setDevices(state, devices){
        state.devices = devices;
    },

    setSelectedDevice(state, device){
        state.selectedDevice = device;
    },

    setNewRealTimeData(state, data){

        //buscamos si ese device ya tiene realtimedata y nos traemos el index
        var deviceIndex = state.realTimeData.findIndex(item => item.dId == data.dId);

        if (deviceIndex == -1){
            var newData = {
                dId: data.dId,
                values: {
                    temp:null,
                    hum:null,
                    light:null,
                    analog:null
                }
            }

            state.realTimeData.push(newData);
            
            //utilizo assign solo para pisar las variables que vienen en newData.values
            Object.assign(state.realTimeData[state.realTimeData.length - 1].values, data.values);

        }else{
            console.log(deviceIndex);
            //utilizo assign solo para pisar las variables que vienen en newData.values
            Object.assign(state.realTimeData[deviceIndex].values, data.values);
        }

    }



}

export const actions = {

    readToken(){

        console.log("leyendo token");
        
            let auth = null;
                try {
              
                    auth = JSON.parse(localStorage.getItem('auth'))
                    console.log(auth)
   
                } catch (err) {
                    console.log(err)
                }
            
    
    
            //grabamos auth 
            this.commit('setAuth', auth)
        

    },


    //esto se ejecuta en cada refresh en lado servidor
    nuxtServerInit({ commit }, { req }) {
        console.log("xxxxxxx")
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