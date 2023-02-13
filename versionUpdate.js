class VersionUpdate {
  oldVersion = "";
  newVersion = "";
  options = {
    time: 60000,
    showNotify: true,
  };
  dispatch = {
    "no-update": [],
    update: [],
  };
  worker;
  hidden = false; // 网页是否在后台隐藏
  notify = false; // 是否有桌面通知权限
  notification; // 桌面通知实例

  constructor(options = {}) {
    this.worker = new Worker("versionWorker.js");
    this.options = Object.assign({}, this.options, options);
    this.init();
  }

  async init() {
    this.notify = await this.hasNotification();

    this.worker.addEventListener("message", ({ data }) => {
      // 初始化
      if (data.type === "init") {
        this.oldVersion = data.value;
        this.newVersion = data.value;
        this.worker.postMessage({
          type: "start",
          value: this.options,
        });
        return;
      }

      // 轮询
      if (data.type === "get") {
        if (data.value !== this.oldVersion) {
          this.newVersion = data.value;
          this.dispatch.update.forEach((fn) => fn());
        } else {
          this.dispatch["no-update"].forEach((fn) => fn());
        }
      }

      // 显示通知
      if (this.showNotification && !this.notification) {
        this.notification = new Notification("项目有新版本了", {
          body: "有新版本了，请返回使用Ctrl + F5刷新页面",
          requireInteraction: true,
          icon: "https://v2.cn.vuejs.org/images/logo.svg",
        });
        this.notification.onclose = () => {
          this.notification = null;
        };
        this.notification.onclick = () => {
          this.notification = null;
        };
      }
    });

    document.addEventListener("visibilitychange", () => {
      const visible = document.visibilityState;
      this.hidden = visible === "hidden" ? true : false;
    });
  }

  // 是否显示通知
  get showNotification() {
    return this.hidden && this.notify && this.oldVersion !== this.newVersion;
  }

  // 获取消息通知权限
  async hasNotification() {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    const permission = await Notification.requestPermission();
    if (permission === "granted") return true;
    return false;
  }

  on(type, fn) {
    if (type === "no-update" || type === "update") {
      if (typeof fn === "function" && !this.dispatch[type].includes(fn))
        this.dispatch[type].push(fn);
    }
  }

  off(type, fn) {
    if (type === "no-update" || type === "update") {
      const index = this.dispatch[type].findIndex((item) => item === fn);
      if (index !== -1) this.dispatch[type].splice(index, 1);
    }
  }

  destroy() {
    this.notification.close();
    this.notification = null;
    this.worker.postMessage({
      type: "end",
    });
  }
}

export default VersionUpdate;
