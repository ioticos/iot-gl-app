<template>
  <div>
    <div class="row">
      <div class="col-sm-12">
        <card>

          <div slot="header">
            <h4 class="card-title">Add new Device</h4>
          </div>

          <div class="row">

            <div class="col-6">
              <base-input v-model="newDevice.name" label="Device Name" type="text" placeholder="Ex: Home, Office..."
                addon-left-icon="tim-icons icon-light-3"></base-input>
            </div>

            <div class="col-6">
              <base-input v-model="newDevice.dId" label="Device ID" type="text" placeholder="Ex: ABC-777-333"
                addon-left-icon="tim-icons icon-link-72"></base-input>
            </div>

          </div>

          <div class="row pull-right">

            <div class="col-12">
              <base-button native-type="submit" type="primary" class="mb-3" size="lg" @click="createNewDevice()">
                Add
              </base-button>
            </div>

          </div>

        </card>
      </div>
    </div>

    <div class="row">
      <div class="col-sm-12">
        <card>
          <div slot="header">
            <h4 class="card-title">Devices</h4>
          </div>

          <el-table :data="$store.state.devices">

            <el-table-column min-width="50" label="#" align="center">
              <div class="photo" slot-scope="{ row, $index }">
                {{$index + 1}}
              </div>
            </el-table-column>

            <el-table-column prop="name" label="Name"></el-table-column>

            <el-table-column prop="dId" label="dId"></el-table-column>

            <el-table-column header-align="right" align="right" label="Actions">
              <div slot-scope="{ row, $index }" class="text-right table-actions">

                <el-tooltip content="Delete" effect="light" :open-delay="300" placement="top">
                  <base-button @click="deleteDevice(row)" type="danger" icon size="sm" class="btn-link">
                    <i class="tim-icons icon-simple-remove "></i>
                  </base-button>
                </el-tooltip>

                <el-tooltip content="Database Saver Indicator" style="margin-left: 20px;">
                  <i class="fas fa-database" :class="{'text-success': row.saverRule[0].status}"></i>
                </el-tooltip>


                <el-tooltip content="Database Saver" style="margin-left: 5px;" >
                  <base-switch @click="updateSaverRuleStatus(row.saverRule[0])" :value="row.saverRule[0].status" type="primary" on-text="ON"
                    off-text="OFF" style="margin-top: 10px;"></base-switch>
                </el-tooltip>


                

              </div>
            </el-table-column>

          </el-table>

        </card>

        <Json :value="$store.state.devices"></Json>

      </div>
    </div>
  </div>



</template>
<script>
  import { Table, TableColumn } from 'element-ui';
  export default {
    middleware: 'authenticated',
    name: 'devices',
    components: {
      [Table.name]: Table,
      [TableColumn.name]: TableColumn,
    },
    data() {
      return {
        saverRules:[],
        newDevice: {
          name: "",
          dId: ""
        },
      };
    },
    mounted(){
 
    },
    methods: {
      updateSaverRuleStatus(rule){
        
        var ruleCopy = JSON.parse(JSON.stringify(rule));

        ruleCopy.status = !ruleCopy.status;

        const toSend = { rule: ruleCopy };

        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.accessToken
          }
        }

        this.$axios.post("/update-saver-rules-status", toSend, axiosHeaders)
          .then(res => {

            if (res.data.status == "error" ) {
              this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: ' Error updating Saver Status...' });
              return;
            }

            if (res.data.status == "success") {
              this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', message: ' Device Saver Status Updated' });
            }

            $nuxt.$emit('time-to-get-devices');

            return;

          })
          .catch(e => {
            console.log(e)
            this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: ' Error deleting ' + device.name });
            return;

          });

      },
      

      deleteDevice(device) {

        var toDelete = {
          dId: device.dId
        }

        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.accessToken
          }
        }

        this.$axios.post("/delete-device", toDelete, axiosHeaders)
          .then(res => {

            if (res.data.status == "error" && res.data.error == "noDevices") {
              this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: ' No device left...' });
            }

            if (res.data.status == "success") {
              this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', message: device.name + ' deleted!' });
            }

            $nuxt.$emit('time-to-get-devices');

            return;

          })
          .catch(e => {
            console.log(e)
            this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: ' Error deleting ' + device.name });
            return;

          });

      },


      getSaverRules() {

        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.accessToken
          }
        }

        this.$axios.post("/get-saver-rules", null, axiosHeaders)
          .then(res => {

            this.saverRules = res.data.rules;

            this.$store.state.devices.forEach((device, index) => {
              const result = this.saverRules.filter(saverRule => saverRule.dId == device.dId);

            });
            
            console.log(this.saverRules);

          })
          .catch(e => {
            this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: 'Error getting rules...' });
            console.log(e)
            return;
          });
      },


      createNewDevice() {

        if (this.newDevice.name == "") {
          this.$notify({ type: 'warning', icon: 'tim-icons icon-alert-circle-exc', message: ' Device Name is Empty :(' });
          return;
        }

        if (this.newDevice.dId == "") {
          this.$notify({ type: 'warning', icon: 'tim-icons icon-alert-circle-exc', message: ' Device ID is Empty :(' });
          return;
        }

        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.accessToken
          }
        }

        this.$axios.post("/new-device", this.newDevice, axiosHeaders)
          .then(res => {

            if (res.data.status == "error" && res.data.error.errors.dId.kind == "unique") {
              this.$notify({ type: 'warning', icon: 'tim-icons icon-alert-circle-exc', message: 'The device is already registered in the system. Try another device' });
              return;
            } else if (res.data.status == "success") {

              $nuxt.$emit('time-to-get-devices');
              this.newDevice.name = "";
              this.newDevice.dId = "";
              this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', message: 'Success! Device was added' });
              
              return;
            }

          })
          .catch(e => {
            this.showNotify("danger", "Error");
            return;
          });

      },
    }
  };
</script>
<style></style>