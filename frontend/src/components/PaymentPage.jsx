import { useState } from 'react';
import { motion } from 'framer-motion';
import { PAYMENT_CONFIG } from '../paymentConfig.js';

export default function PaymentPage({ sessionId, onPaymentSuccess }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, paymentCode: code.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '验证失败');
        setLoading(false);
        return;
      }

      // 保存到 localStorage
      localStorage.setItem('city-match-paid-result', JSON.stringify({
        sessionId,
        accessToken: data.accessToken,
        result: data.result,
        timestamp: Date.now()
      }));

      onPaymentSuccess(data.result);
    } catch (err) {
      setError('网络错误，请重试');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          查看测试结果
        </h2>

        <div className="mb-6 space-y-4">
          {/* 付款说明 */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">付款说明</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 测试报告费用：<span className="font-bold">¥{PAYMENT_CONFIG.price}</span></li>
              {PAYMENT_CONFIG.instructions.map((instruction, index) => (
                <li key={index}>• {instruction}</li>
              ))}
            </ul>
            {PAYMENT_CONFIG.wechatId && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-sm text-blue-900">
                  客服微信：<span className="font-mono font-bold">{PAYMENT_CONFIG.wechatId}</span>
                </p>
              </div>
            )}
            {PAYMENT_CONFIG.serviceHours && (
              <p className="text-xs text-blue-600 mt-2">{PAYMENT_CONFIG.serviceHours}</p>
            )}
          </div>

          {/* 收款二维码 */}
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-3">微信/支付宝扫码支付</p>

            {/* 使用真实收款码：将图片放到 frontend/public/ 目录 */}
            <img
              src={PAYMENT_CONFIG.qrCodeImage}
              alt="收款码"
              className="w-48 h-48 mx-auto rounded-lg object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />

            {/* 图片加载失败时显示占位符 */}
            <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg items-center justify-center hidden">
              <span className="text-gray-400 text-sm">收款码图片未找到</span>
            </div>

            {PAYMENT_CONFIG.showPaymentNote && (
              <p className="text-xs text-gray-500 mt-2">付款备注：{sessionId.slice(-8)}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输入兑换码
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="XXX-XXX-XXX"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '验证中...' : '验证兑换码'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
