import { motion } from 'framer-motion';
import { PAYMENT_CONFIG } from '../paymentConfig.js';

export default function PaymentPage({ sessionId, result, onPaymentSuccess }) {
  const handleViewResult = (donated = false) => {
    // 保存到 localStorage
    localStorage.setItem('city-match-paid-result', JSON.stringify({
      sessionId,
      result,
      donated,
      timestamp: Date.now()
    }));

    onPaymentSuccess(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          ☕ 喜欢这个测试吗？
        </h2>
        <p className="text-gray-600 text-center mb-6">
          如果觉得测试有帮助，欢迎打赏支持~
        </p>

        {/* 收款二维码 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-3">微信/支付宝扫码打赏</p>
          <img
            src={PAYMENT_CONFIG.qrCodeImage}
            alt="收款码"
            className="w-48 h-48 mx-auto rounded-lg object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg items-center justify-center hidden">
            <span className="text-gray-400 text-sm">收款码图片未找到</span>
          </div>
          <p className="text-sm text-gray-500 mt-3">建议金额：¥{PAYMENT_CONFIG.price}</p>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={() => handleViewResult(true)}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all shadow-md"
          >
            💖 打赏了，我要看结果
          </button>
          <button
            onClick={() => handleViewResult(false)}
            className="w-full bg-gray-100 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            狠心拒绝
          </button>
        </div>
      </motion.div>
    </div>
  );
}
