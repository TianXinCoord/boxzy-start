# BOXZY 预约确认邮件

本目录是可供服务端接入的邮件内容，未连接发送服务，不会自行发送邮件。正式上线营销邮件不在本次范围内。

## 模板与用途

- `signup-confirmation.html`：简单品牌 HTML，内联样式、系统字体，无脚本、外链图片或网页字体依赖。
- `signup-confirmation.txt`：同内容纯文本版本，与 HTML 放在同一封 multipart 邮件中。
- `render-confirmation.cjs`：服务端渲染函数，输出 subject、html、text；需要传入真实的 HTTPS 退订地址。不得把密钥或退订令牌生成逻辑放在浏览器。
- `../docs/BOXZY-预约确认邮件预览.html`：已填入示例退订地址的离线预览，开发应使用上面的源模板，不直接发送预览文件。

主题：You’re on the BOXZY list!

目的：确认预约已保存，并说明未来会收到上线通知。邮件不要求再次确认；包含已确认的早期预约新客福利：上线时获得 2 个免费 Starter Boxes（总价值 $10）。领取方式、新客识别、每人限领规则、截止日期由业务与后台确认，模板不虚构领取按钮或已到账状态。当前仍采用提交成功即预约的流程；若以后增加双重确认，需要另改页面状态和模板。

## 什么时候发

服务端校验邮箱 → 在同一个数据库事务内创建新预约及确认邮件任务 → 事务提交成功后返回前端 success: true → 后台任务调用邮件服务。

仅首次成功创建新预约时产生一条确认任务。首屏、奖品/玩法区、页尾适用同一规则。格式错误、保存失败、刷新、返回页面、查看奖品都不发邮件。同一邮箱重复提交返回 alreadySubscribed: true，不新建任务。更换为另一个从未预约的邮箱并成功保存后，向新地址发送；旧记录不被取消。

## 去重、失败和退订

数据库对规范化邮箱设置唯一约束，使用稳定 signup_id 和模板用途 `signup-confirmation-v1` 建立邮件任务唯一键，不按 IP 去重。请求重试与队列重试复用该键；服务商支持幂等键时也传入。服务商幂等窗口不能替代本地持久去重。

保存预约与邮件任务一起提交，避免预约已保存却丢失邮件任务。发送超时或临时故障由后台退避重试，记录 attempts、provider_message_id、last_error；达到配置上限交由运营处理。邮件失败不撤销预约、不把网页已成功改成失败，也不要求用户重新提交。服务商接收请求不等于送达：通过回调区分 accepted、delivered、bounced，永久退信或投诉停止后续投递。页面继续使用 We’ll email you at launch.，不能写“确认邮件已送达”。

退订 URL 必须由服务端为该预约生成不可猜测的签名令牌，不在 URL 中暴露邮箱。退订后停止上线更新，并抑制尚未发送的确认任务；已退订地址重复提交不能悄悄恢复订阅，重新订阅机制后续单独确认。

## 接入前需要填写

真实发送服务、已验证发件域名、From 显示名 BOXZY、真实发件地址及 Reply-To、退订端点、发送任务及回调处理。模板不写死上线日期，以免延期使确认邮件失效。

渲染示例（仅开发示例，不发邮件）：

```js
const { renderConfirmation } = require('./render-confirmation.cjs');
const content = renderConfirmation({ unsubscribeUrl: signedUnsubscribeUrl });
// In your server worker: send to the saved signup email using content.subject/html/text.
```

## 开发验收

新邮箱只发一次；同一邮箱并发提交不重复；存储失败不发；队列重试不多发；邮件暂时失败不影响预约成功；退订后不再投递。检查实际 Gmail、Apple Mail、Outlook 的收到效果与链接。当前只完成 HTML 浏览器预览和渲染验证，未实发、未进行真实邮件客户端验收。

参考：[HTML 与纯文本](https://postmarkapp.com/developer/user-guide/send-email-with-api/send-a-single-email)、[发送幂等](https://resend.com/changelog/idempotency-keys)。本目录不指定服务商。
