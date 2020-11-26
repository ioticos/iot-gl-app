<template>
  <div>
    <div class="row">
      <div class="col-sm-12">
        <card>

          <div slot="header">
            <h4 class="card-title">Create new Alarm Rule</h4>
          </div>

          <div class="row">

            <div class="col-3">
              <el-select required class="select-success" placeholder="Variable" v-model="newRule.variable"
                style="margin-top: 25px;">
                <el-option class="text-dark" value="temp" label="Temperature"></el-option>
                <el-option class="text-dark" value="hum" label="Humidity"></el-option>
                <el-option class="text-dark" value="light" label="Light"></el-option>
              </el-select>
            </div>

            <div class="col-3">
              <el-select required class="select-warning" placeholder="Condition" v-model="newRule.condition"
                style="margin-top: 25px;">
                <el-option class="text-dark" value="=" label="="></el-option>
                <el-option class="text-dark" value=">" label=">"></el-option>
                <el-option class="text-dark" value=">=" label=">="></el-option>
                <el-option class="text-dark" value="<" label="<"></el-option>
                <el-option class="text-dark" value="<=" label="<="></el-option>
                <el-option class="text-dark" value="!=" label="!="></el-option>
              </el-select>
            </div>

            <div class="col-3">
              <base-input label="Value" v-model="newRule.value" type="number"></base-input>
            </div>

            <div class="col-3">
              <base-input label="Trigger Time" v-model="newRule.triggerTime" type="number"></base-input>
            </div>



          </div>
          <br><br>
          <div class="row">
            <div class="col-12">
              <h3>If <span class="text-success">{{newRule.variable}}</span> is <span
                  class="text-warning">{{newRule.condition}}</span> than {{newRule.value}} while {{newRule.triggerTime}}
                minutes</h3>
            </div>

          </div>

          <br><br>

          <div class="row pull-right">

            <div class="col-12">
              <base-button @click="createNewRule()" native-type="submit" type="primary" class="mb-3" size="lg" :disabled="$store.state.devices.length == 0" >
                Add Alarm Rule
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
            <h4 class="card-title">Alarm Rules</h4>
          </div>

          <el-table v-if="$store.state.devices.length > 0" :data="$store.state.selectedDevice.alarmRules">

            <el-table-column min-width="50" label="#" align="center">
              <div class="photo" slot-scope="{ row, $index }">
                {{$index + 1}}
              </div>
            </el-table-column>

            <el-table-column prop="variable" label="Variable"></el-table-column>

            <el-table-column prop="condition" label="Condition"></el-table-column>

            <el-table-column prop="value" label="Value"></el-table-column>

            <el-table-column prop="triggerTime" label="Trigger Time"></el-table-column>

            <el-table-column prop="counter" label="Matches"></el-table-column>


            <el-table-column header-align="right" align="right" label="Actions">
              <div slot-scope="{ row, $index }" class="text-right table-actions">

                <el-tooltip content="Delete" effect="light" placement="top">
                  <base-button @click="deleteDevice(row)" type="danger" icon size="sm" class="btn-link">
                    <i class="tim-icons icon-simple-remove "></i>
                  </base-button>
                </el-tooltip>

                <el-tooltip content="Rule Status" style="margin-left: 20px;">
                  <i class="fas fa-exclamation-triangle" :class="{'text-warning': row.status}"></i>
                </el-tooltip>
               
                <!-- no ato row.status al v model porque al cambiar de status cambiaria directo sobre store lo que daría error en 
                  cambio uso el value, al accionar el switch no cambiará el objeto, pero podré cambiar el valor en la función -->
                <el-tooltip content="Change Rule Status" style="margin-left: 5px;">
                  <base-switch @click="updateStatusRule(row)" :value="row.status" type="primary" on-text="ON"
                    off-text="OFF" style="margin-top: 10px;"></base-switch>
                </el-tooltip>

              </div>
            </el-table-column>

          </el-table>
          <h4 v-else class="card-title">No Alarm Rules</h4>


        </card>

      </div>
    </div>

    <Json :value="$store.state.devices"></Json>

  </div>
</template>


<script>
  import { Select, Option } from 'element-ui';
  import { Table, TableColumn } from 'element-ui';
  export default {
    components: {
      [Option.name]: Option,
      [Select.name]: Select,
      [Table.name]: Table,
      [TableColumn.name]: TableColumn

    },
    name: 'alarms',
    middleware: 'authenticated',
    data() {
      return {

        newRule: {
          dId: null,
          status: true,
          variable: null,
          value: null,
          condition: null,
          triggerTime: null,
        },
        alarmRules: [],
        switch1: true
      };
    },
    created(){

    },
    mounted() {

    },
    methods: {

      updateStatusRule(rule) {

        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.accessToken
          }
        }

        var ruleCopy = JSON.parse(JSON.stringify(rule));

        ruleCopy.status = !ruleCopy.status;

        const toSend = { rule: ruleCopy };

        this.$axios.post("/update-alarm-rule", toSend, axiosHeaders)
          .then(res => {
            if (res.data.status == "error") {
              this.$notify({ type: 'warning', icon: 'tim-icons icon-alert-circle-exc', message: 'Error' });
              return;
            } else if (res.data.status == "success") {
              $nuxt.$emit('time-to-get-devices');
              this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', message: 'Success! Alarm Rule was updated' });
 
              return;
            }

          })
          .catch(e => {
            this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: 'Error' });
            console.log(e)
            return;
          });

      },

      createNewRule() {

        if (this.newRule.variable == null) {
          this.$notify({ type: 'warning', icon: 'tim-icons icon-alert-circle-exc', message: ' Variable must be selected' });
          return;
        }

        if (this.newRule.condition == null) {
          this.$notify({ type: 'warning', icon: 'tim-icons icon-alert-circle-exc', message: ' Condition must be selected' });
          return;
        }

        if (this.newRule.value == null) {
          this.$notify({ type: 'warning', icon: 'tim-icons icon-alert-circle-exc', message: ' Value is empty' });
          return;
        }

        if (this.newRule.triggerTime == null) {
          this.$notify({ type: 'warning', icon: 'tim-icons icon-alert-circle-exc', message: ' Trigger Time is empty' });
          return;
        }

        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.accessToken
          }
        }

        this.newRule.dId = this.$store.state.selectedDevice.dId;

        var toSend = {
          newRule: this.newRule
        }

        this.$axios.post("/create-alarm-rule", toSend, axiosHeaders)
          .then(res => {
            if (res.data.status == "error") {
              this.$notify({ type: 'warning', icon: 'tim-icons icon-alert-circle-exc', message: 'Error' });
              return;
            } else if (res.data.status == "success") {
              $nuxt.$emit('time-to-get-devices');
              this.newRule.variable = null;
              this.newRule.condition = null;
              this.newRule.value = null;
              this.newRule.triggerTime = null;
              

              this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', message: 'Success! Alarm Rule was added' });
              return;
            }

          })
          .catch(e => {
            this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: 'Error' });
            console.log(e)
            return;
          });

      },

      deleteDevice(rule) {

        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.accessToken
          }
        }

        this.$axios.post("/delete-alarm-rule", { rule: rule }, axiosHeaders)
          .then(res => {
            if (res.data.status == "error") {
              this.$notify({ type: 'warning', icon: 'tim-icons icon-alert-circle-exc', message: 'Error' });
              return;
            } else if (res.data.status == "success") {
              this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', message: 'Success! Alarm Rule was deleted' });
              $nuxt.$emit('time-to-get-devices');
              return;
            }

          })
          .catch(e => {
            this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: 'Error' });
            console.log(e)
            return;
          });

      },


    }
  };
</script>
<style></style>