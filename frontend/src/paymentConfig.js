/**
 * 付款配置文件
 * 修改这里的信息来自定义付款页面
 */

export const PAYMENT_CONFIG = {
  // 测试报告价格
  price: '1.9',

  // 客服联系方式
  wechatId: 'your_wechat_id',  // 修改为你的微信号
  qqNumber: '',                 // 可选：QQ号

  // 收款码图片路径（相对于 public 目录）
  qrCodeImage: '/my-qrcode.png',

  // 付款说明文本
  instructions: [
    '扫码支付后截图保存付款凭证',
    '添加客服微信发送付款截图',
    '客服确认后立即发送兑换码',
    '输入兑换码即可查看测试结果'
  ],

  // 是否显示付款备注提示
  showPaymentNote: true,

  // 客服工作时间提示
  serviceHours: '客服在线时间：9:00-22:00'
};
