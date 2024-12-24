import { RenderSystem } from "XrFrame/systems";

const themejournal= require('../../utils/theme.js');
Page({
  data: {
    records: [
      { id: 0, date: "2024-10-19", sleepStatus: "按时睡觉", note: "无" },
      { id: 1, date: "2024-10-20", sleepStatus: "熬夜", note: "赶周末ddl" },
      { id: 2, date: "2024-10-21", sleepStatus: "按时睡觉", note: "第二天上早八" },
    ],
    sleepStatusInput: "", // 睡眠情况输入
    noteInput: "", // 小记输入
  },
  onShow() {
    // 页面显示时根据全局夜间模式状态切换主题
    themejournal.applyTheme(this);
    this.fetchRecords();
  },

  fetchRecords() {
    const url = "http://124.220.46.241:8000/api/sleep-records/";

    wx.request({
      url: url,
      method: "GET",
      header: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + wx.getStorageSync("access_token"),
      },
      success: (res:any) => {
        if (res.statusCode === 200) {
          // 将后端返回的记录更新到前端
          this.setData({
            records: res.data.map((record: any) => ({
              id: record.id,
              date: record.date,
              sleepStatus: record.sleep_status, // 后端字段名是 sleep_status
              note: record.note,
            })),
          });
        } else {
          wx.showToast({
            title: "获取记录失败，请稍后再试",
            icon: "none",
          });
        }
      },
      fail: (err) => {
        console.error("网络错误", err);
        wx.showToast({
          title: "网络错误，请稍后再试",
          icon: "none",
        });
      },
    });
  },

  onDeleteRecord(e: any) {
    const id = e.currentTarget.dataset.id; // 获取记录的 ID
  
    wx.showModal({
      title: "删除确认",
      content: "确定要删除这条记录吗？",
      success: (res) => {
        if (res.confirm) {
          // 调用后端接口删除记录
          const url = "http://127.0.0.1:8000/api/sleep-records/";
  
          wx.request({
            url: url,
            method: "DELETE",
            data: { id: id },
            header: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + wx.getStorageSync("access_token"),
            },
            success: (res:any) => {
              if (res.statusCode === 200) {
                wx.showToast({
                  title: "删除成功",
                  icon: "success",
                });
  
                // 从前端 records 中移除已删除的记录
                const updatedRecords = this.data.records.filter(
                  (record) => record.id !== id
                );
                this.setData({
                  records: updatedRecords,
                });
              } else {
                wx.showToast({
                  title: res.data.error || "删除失败",
                  icon: "none",
                });
              }
            },
            fail: (err) => {
              console.error("网络错误", err);
              wx.showToast({
                title: "网络错误，请稍后再试",
                icon: "none",
              });
            },
          });
        }
      },
    });
  },

  // 输入框绑定事件
  onInputSleepStatus(e: any) {
    this.setData({
      sleepStatusInput: e.detail.value,
    });
  },

  onInputNote(e: any) {
    this.setData({
      noteInput: e.detail.value,
    });
  },

  // 提交表单
  submitRecord() {
    const { sleepStatusInput, noteInput } = this.data;

    // 校验输入
    if (!sleepStatusInput || !noteInput) {
      wx.showToast({
        title: "请填写完整信息",
        icon: "none",
      });
      return;
    }

    // 获取当前日期
    const today = new Date();
    const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`; // YYYY-MM-DD 格式

    // 后端接口 URL
    const url = "http://124.220.46.241:8000/api/sleep-records/";

    // 提交数据到后端
    wx.request({
      url: url,
      method: "POST",
      data: {
        
        date: date,
        sleep_status: sleepStatusInput,
        note: noteInput,
      },
      header: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + wx.getStorageSync("access_token"),
      },
      success: (res:any) => {
        if (res.statusCode === 201) {
          wx.showToast({
            title: "提交成功",
          });

          // 更新前端显示
          this.setData({
            records: [
              ...this.data.records,
              { id: res.data.id, date: date, sleepStatus: sleepStatusInput, note: noteInput },
            ],
            sleepStatusInput: "",
            noteInput: "",
          });
        } else {
          wx.showToast({
            title: "提交失败，请稍后再试",
            icon: "none",
          });
        }
      },
      fail: (err) => {
        console.error("网络错误", err);
        wx.showToast({
          title: "网络错误，请稍后再试",
          icon: "none",
        });
      },
    });
  },
});
