<template>
  <div class="booking-page">
    <el-card shadow="never">
      <el-row :gutter="16">
        <el-col :md="12" :xs="24">
          <el-form :model="form" :rules="rules" ref="form" label-width="88px">
            <el-form-item label="参观日期" prop="date">
              <el-date-picker v-model="form.date" type="date" placeholder="选择日期" style="width:100%" :picker-options="dateOptions" @change="onDateChange" />
            </el-form-item>
            <el-form-item label="时段" prop="time">
              <div class="time-row">
                <el-time-select v-model="startStr" placeholder="开始" :picker-options="{ start: '08:00', step: '00:30', end: '20:00' }" />
                <span class="sep">至</span>
                <el-time-select v-model="endStr" placeholder="结束" :picker-options="{ start: '08:30', step: '00:30', end: '21:00', minTime: startStr }" />
              </div>
              <div v-if="booked.length" class="tips">已被预约：
                <span v-for="b in booked" :key="b.id" class="tag">{{ b.start_time.slice(0,5) }}-{{ b.end_time.slice(0,5) }}</span>
              </div>
            </el-form-item>
            <el-form-item label="人数" prop="people">
              <el-input-number v-model="form.people" :min="1" :max="50" />
            </el-form-item>
            <el-form-item label="联系人" prop="contact">
              <el-input v-model="form.contact" placeholder="姓名" />
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="手机号" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input type="textarea" v-model="form.remark" :rows="3" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submit">提交预约</el-button>
              <el-button @click="reset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :md="12" :xs="24">
          <el-card shadow="never">
            <div slot="header" class="clearfix">
              <span>预约日历</span>
              <span v-if="selectedInfo" style="float:right;color:#666">{{ selectedInfo }}</span>
            </div>
            <el-calendar v-model="calendarDate" @panel-change="onCalendarPanelChange">
              <template slot="dateCell" slot-scope="{date, data}">
                <div class="cell" @click="clickCalendarDate(data.day)">
                  <div>{{ data.day.split('-').slice(2).join('-') }}</div>
                  <div v-if="monthHeat[data.day]" :class="['dot', heatClass(monthHeat[data.day])]" :title="dotTitle(data.day)">{{ monthHeat[data.day] }}</div>
                </div>
              </template>
            </el-calendar>
          </el-card>
          <el-card shadow="never" style="margin-top:12px">
            <div slot="header">当天预约</div>
            <el-timeline v-if="booked.length">
              <el-timeline-item v-for="b in booked" :key="b.id" :timestamp="b.start_time.slice(0,5)+'-'+b.end_time.slice(0,5)">
                {{ b.contact }}（{{ b.people }}人）
              </el-timeline-item>
            </el-timeline>
            <div v-else class="tips">当日暂无预约</div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { createBooking, listBookings, monthBookings } from '@/api/booking'
import { getCapacity } from '@/api/booking'
export default {
  name: 'BookingIndex',
  data() {
    const phoneValidator = (rule, value, callback) => {
      if (!/^\d{6,20}$/.test(value || '')) return callback(new Error('请输入正确手机号'))
      callback()
    }
    return {
      calendarDate: new Date(),
      form: { date: '', timeRange: [], people: 1, contact: '', phone: '', remark: '' },
      startStr: '',
      endStr: '',
      rules: {
        date: [{ required: true, message: '请选择日期', trigger: 'change' }],
        time: [{ validator: (r, v, cb) => { if (!this.startStr || !this.endStr) cb(new Error('请选择时间段')); else cb(); }, trigger: 'change' }],
        people: [{ required: true, message: '请输入人数', trigger: 'blur' }],
        contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        phone: [{ required: true, validator: phoneValidator, trigger: 'blur' }]
      },
      booked: [],
      monthHeat: {},
      capacity: 20,
      selectedInfo: '',
      dateOptions: { disabledDate(time) { return time.getTime() < new Date(new Date().toDateString()).getTime() } }
    }
  },
  created() {
    this.onDateChange(new Date())
    const d = new Date()
    this.loadMonth(d.getFullYear(), d.getMonth()+1)
    this.loadCapacity()
  },
  methods: {
    async loadCapacity() {
      try {
        const { data } = await getCapacity()
        if (data && data.dailyCapacity) this.capacity = data.dailyCapacity
      } catch (e) {
        // 保持默认容量，避免404提示打断体验
      }
    },
    async loadBooked() {
      if (!this.form.date) return
      const d = new Date(this.form.date)
      const ymd = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
      const { data } = await listBookings(ymd)
      this.booked = Array.isArray(data) ? data : []
      this.selectedInfo = `选中 ${ymd}｜已预约 ${this.booked.length} 条｜剩余 ${Math.max(this.capacity - this.booked.length, 0)} 条`
    },
    async loadMonth(year, month) {
      try {
        const { data } = await monthBookings(year, month)
        const map = {}
        ;(data || []).forEach(r => {
          const d = new Date(r.date)
          const ymd = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
          map[ymd] = r.cnt
        })
        this.monthHeat = map
      } catch (e) {
        // 忽略月份统计失败，保持空热度
        this.monthHeat = {}
      }
    },
    onDateChange(val) {
      this.form.date = val
      this.loadBooked()
    },
    onCalendarPanelChange({ date }) {
      const d = new Date(date)
      this.loadMonth(d.getFullYear(), d.getMonth()+1)
    },
    clickCalendarDate(ymd) {
      const [y,m,dd] = ymd.split('-').map(n=>parseInt(n))
      const d = new Date(y, m-1, dd)
      this.calendarDate = d
      this.onDateChange(d)
    },
    heatClass(cnt) { return cnt>5 ? 'danger' : (cnt>2 ? 'warn' : 'ok') },
    dotTitle(ymd) {
      const cnt = this.monthHeat[ymd] || 0
      const left = Math.max(this.capacity - cnt, 0)
      return `预约 ${cnt} 条，剩余 ${left} 条`
    },
    disabledHours() { return [] },
    disabledMinutes() { return [] },
    conflict(range) {
      if (!Array.isArray(this.booked)) return false
      const sStr = this.startStr
      const eStr = this.endStr
      const toMin = t => parseInt(t.slice(0,2))*60 + parseInt(t.slice(3,5))
      const sMin = toMin(sStr), eMin = toMin(eStr)
      return this.booked.some(b => {
        const bs = toMin(b.start_time.slice(0,5))
        const be = toMin(b.end_time.slice(0,5))
        return !(eMin<=bs || sMin>=be)
      })
    },
    submit() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        if (!this.startStr || !this.endStr) { this.$message.error('请选择时间段'); return }
        const mkDate = (hm) => new Date(`1970-01-01T${hm}:00`)
        this.form.timeRange = [mkDate(this.startStr), mkDate(this.endStr)]
        if (this.conflict(this.form.timeRange)) { this.$message.error('该时段已有预约，请更换时间'); return }
        const payload = { ...this.form }
        if (Array.isArray(payload.timeRange) && payload.timeRange.length === 2) {
          payload.startTime = payload.timeRange[0]
          payload.endTime = payload.timeRange[1]
        }
        const { msg } = await createBooking(payload)
        this.$message.success(msg || '预约成功')
        this.reset()
        this.loadBooked()
        this.$nextTick(() => this.$refs.form.clearValidate(['time']))
      })
    },
    reset() {
      this.$refs.form.resetFields()
      this.startStr = ''
      this.endStr = ''
      this.$nextTick(() => this.$refs.form.clearValidate(['time']))
    }
  }
}
</script>

<style scoped>
.booking-page { padding: 16px; }
.tips { margin-top: 6px; color: #888; }
.tag { margin-right: 8px; }
.time-row { display: flex; align-items: center; }
.sep { margin: 0 8px; color: #888; }
.cell { position: relative; height: 48px; }
.dot { position: absolute; right: 2px; bottom: 2px; color:#fff; padding: 0 4px; border-radius: 8px; font-size: 12px; }
.dot.ok { background:#67C23A }
.dot.warn { background:#E6A23C }
.dot.danger { background:#F56C6C }
</style> 