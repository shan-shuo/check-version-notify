(async function () {
  let timer = null;

  self.addEventListener("message", ({ data }) => {
    if (data.type === "start" && !timer) {
      timer = self.setInterval(async () => {
        self.postMessage({
          type: "get",
          value: await getETag(),
        });
      }, data.value.time);
      return;
    }

    if (data.type === "end" && timer) {
      clearInterval(timer);
      timer = null;
    }
  });

  // 获取根目录的ETag
  async function getETag() {
    const headers = (await fetch("/")).headers;
    return headers.get("ETag");
  }

  // 初始化
  self.postMessage({
    type: "init",
    value: await getETag(),
  });
})();
