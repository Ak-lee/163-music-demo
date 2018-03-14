# 注意事项

上传文件前，先开 ` node server.js 8080`  以便 `admin.html`  获取七牛上传文件必须的`uptoken`

`server.js 8080`  会读取当前目录下的  `qiniu-config.json`  。里面保存了了生成 `uptoken` 必须的 `secretKey`  和  `accessKey` 。出于安全考虑，并没有把这个配置文件上传到 github