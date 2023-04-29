<template>
  <div class="parameter-setting">
    <h3>{{ data.name }} 参数设置</h3>
    <div class="form-item">
      <label for="param1">参数1:</label>
      <input type="text" id="param1" v-model="params.param1" />
    </div>
    <div class="form-item">
      <label for="param2">参数2:</label>
      <input type="text" id="param2" v-model="params.param2" />
    </div>
    <div class="form-item">
      <label for="param3">参数3:</label>
      <input type="text" id="param3" v-model="params.param3" />
    </div>
    <div class="button-group">
      <button @click="saveParams">保存</button>
      <button @click="close">关闭</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      params: {
        param1: '',
        param2: '',
        param3: '',
      },
    };
  },
  methods: {
    saveParams() {
      // 处理参数保存逻辑
      console.log(this.params);
    },
    close() {
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.parameter-setting {
  padding: 16px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-item {
  margin-bottom: 8px;
}

.form-item label {
  display: inline-block;
  width: 100px;
  text-align: right;
  margin-right: 8px;
}

.button-group {
  margin-top: 16px;
  text-align: right;
}

.button-group button {
  margin-left: 8px;
}
</style>
