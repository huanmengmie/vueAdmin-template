<template>
    <el-row style="margin-top:4rem;">
        <el-col :offset="3" :span="18">
            <el-steps :active="activeIndex" simple style="margin-top:3rem;">
              <el-step title="1、验证手机号" icon="el-icon-phone-outline"></el-step>
              <el-step title="2、用户基本信息" icon="el-icon-edit"></el-step>
              <el-step title="3、注册成功" icon="el-icon-success"></el-step>
            </el-steps>
            <div v-if="activeIndex == 1" class="contents">
                <el-form :model="checkPhone" status-icon :rules="rules1" ref="checkPhone" label-width="100px">
                  <el-alert title="" center v-show="countDown > 0" style="margin-bottom:10px;">验证码错误，请{{ countDown }}s后重试</el-alert>
                  <el-form-item label="手机号" prop="phone" required>
                      <el-input type="text" v-model.number="checkPhone.phone" @blur.once="ifErrorCode" auto-complete="off" ref="phone"></el-input>
                  </el-form-item>
                  <el-form-item label="验证" prop="checkProcess" ref="checkProcess" required>
                      <el-slider v-model="checkPhone.checkProcess" :show-tooltip="false" :disabled="forbidSlider" @change="checkSuccess"></el-slider>
                  </el-form-item>
                  <el-form-item label="验证码" prop="inputCode" ref="inputCode" v-show="checkPhone.checkProcess === 100 && legalPhone">
                      <el-input type="text" v-model.number="checkPhone.inputCode" minlength="6" maxlength="6" auto-complete="off" @change="verifyCode" placeholder="请输入6位验证码"></el-input>
                  </el-form-item>
                </el-form>
                <el-button type="info" @click="goNext" :disabled="toSecondDisabled">下一步</el-button>
            </div>
            <div v-else-if="activeIndex == 2" class="contents">
                <el-form :model="customer" status-icon :rules="rules2" ref="customer" label-width="100px">
                    <el-form-item label="用户名" prop="userName" required>
                        <el-input type="text" v-model="customer.userName" maxlength="7" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password" required>
                        <el-input type="password" v-model="customer.password" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="确认密码" prop="checkPassword" required>
                        <el-input type="password" v-model="customer.checkPassword" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm('customer')">提交</el-button>
                        <el-button @click="resetForm('customer')">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div v-else class="contents">
              <strong><el-alert title="恭喜！注册成功" type="success" :closable="false" style="font-size:24px;"></el-alert></strong>
              <img src="http://oyd1cktti.bkt.clouddn.com/register-success.gif" style="width: 100%;height: 100%;">
            </div>
        </el-col>
    </el-row>
</template>
<script>
import { validatePhone } from '@/utils/validate'
import { register, ifExist } from '@/api/customer'
import { setCookie, getCookie } from '@/utils/auth'

export default {
  data() {
    var checkPhone = (rule, value, callback) => {
      if (!validatePhone(value)) {
        this.legalPhone = false
        callback(new Error('请输入正确的手机号'))
      } else {
        this.legalPhone = true
        callback()
      }
    }
    var checkCode = (rule, value, callback) => {
      var reg = /^\d{6}$/
      if (!reg.test(value)) {
        callback(new Error('请输入6位验证码'))
      } else {
        callback()
      }
    }
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.customer.checkPassword !== '') {
          this.$refs.customer.validateField('checkPassword')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.customer.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      activeIndex: 1,
      legalPhone: false,
      forbidSlider: false,
      countDown: 0,
      checkPhone: {
        phone: '',
        checkProcess: 0,
        inputCode: ''
      },
      toSecondDisabled: true,
      customer: {
        password: '',
        checkPassword: '',
        userName: ''
      },
      rules1: {
        phone: [
          { validator: checkPhone, trigger: 'blur', required: true }
        ],
        inputCode: [
          { validator: checkCode, trigger: 'blur', required: true }
        ]
      },
      rules2: {
        userName: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 3, max: 7, message: '长度在 3 到 7 个字符', trigger: 'blur' }
        ],
        password: [
          { validator: validatePass, trigger: 'blur', required: true }
        ],
        checkPassword: [
          { validator: validatePass2, trigger: 'blur', required: true }
        ]
      }
    }
  },
  methods: {
    checkSuccess() {
      if (!this.legalPhone) {
        this.$refs.phone.focus()
        this.checkPhone.checkProcess = 0
        this.$message('请先完善手机号')
        return
      }
      if (this.legalPhone && this.checkPhone.checkProcess === 100) {
        ifExist(this.checkPhone.phone).then(res => {
          if (res.code === 22222 && res.data === false) {
            this.$message('验证码已发送至您的手机请注意查收')
          } else {
            this.$message('该手机号已注册，直接登录或换个手机号')
            this.legalPhone = false
            this.$refs.phone.focus()
          }
        })
      }
    },
    verifyCode() {
      if (this.checkPhone.inputCode === 123456) {
        this.toSecondDisabled = false
      } else if (!this.ifErrorCode()) {
        this.countDown = 60
        setCookie(this.checkPhone.phone, new Date())
        this.timeOut()
      }
    },
    ifErrorCode() {
      const end = getCookie(this.checkPhone.phone.toString())
      if (end !== undefined) {
        const diff = (new Date(end) - new Date() + 60000) / 1000
        console.log(diff)
        if (diff > 0) {
          this.countDown = parseInt(diff)
          this.timeOut()
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    },
    timeOut() {
      this.$refs.checkProcess.resetField()
      this.$refs.inputCode.resetField()
      this.forbidSlider = true
      const _self = this
      var test = setInterval(() => {
        if (_self.countDown > 0) {
          _self.countDown--
        } else {
          _self.forbidSlider = false
        }
      }, 1000)
      setTimeout(() => {
        clearInterval(test)
      }, 120000)
    },
    goNext() {
      this.activeIndex = 2
      this.$nextTick(() => {
        this.$refs.customer.clearValidate()
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.customer.phone = this.checkPhone.phone
          register(this.customer).then(res => {
            this.activeIndex++
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style scoped>
.contents{
  border: 1px dashed #e8e8e8;
  height: 25rem;
  margin-bottom: 2rem;
  padding: 5rem 25rem;
}
/* .step {
    padding: 1rem 0;
}
.step span{
    display: block;
    float: left;
    width: 25%;
    text-align: center;
    height: 2rem;
    border-bottom: 1px solid #e8e8e8;
}
.first{
    margin-left: 25%;
}
.first:before{
    display: block;
    content: "";
    width: 100%;
    transform: translateX(-100%) translateY(2rem);
    border-bottom: 1px solid #e8e8e8;
}
.second:after{
    display: block;
    content: "";
    width: 100%;
    transform: translateX(100%) translateY(.7rem);
    border-bottom: 1px solid #e8e8e8;
}
.active {
    border-bottom: 1px solid #6ab6ef !important;
} */

</style>
