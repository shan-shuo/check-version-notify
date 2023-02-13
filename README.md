# check-version-notify
纯前端实现校验项目是否有新版本，如果页面隐藏，给予用户桌面通知

# 使用方式

1. vue项目把`versionWorker.js`文件放在`public`文件下中
2. 在需要使用的地方引入`versionUpdate.js`文件, 并通过下方代码方式使用

```js
  import VersionUpdate from "../utils/versionUpdate";

  const versionUpdate = new VersionUpdate();
  versionUpdate.on("update", () => {
    console.log(
      `有新的版本信息, 旧版本: ${versionUpdate.oldVersion}, 新版: ${versionUpdate.newVersion}`
    );
  });
  versionUpdate.on("no-update", () => {
    console.log(`暂时没有新版本， 当前版本: ${versionUpdateoldVersion}`);
  });