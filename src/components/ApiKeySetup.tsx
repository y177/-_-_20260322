// === src/components/ApiKeySetup.tsx ===

import React, { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiKeySetupProps {
  onSave: (key: string) => void;
  onValidate: (key: string) => Promise<boolean>;
  isOpen: boolean;
}

const ApiKeySetup: FC<ApiKeySetupProps> = ({ onSave, onValidate, isOpen }) => {
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'success' | 'fail' | null>(null);

  const handleSave = async () => {
    if (!inputKey.trim()) return;

    setIsValidating(true);
    setValidationResult(null);

    const isValid = await onValidate(inputKey.trim());

    if (isValid) {
      setValidationResult('success');
      setTimeout(() => {
        onSave(inputKey.trim());
        setInputKey('');
        setValidationResult(null);
      }, 800);
    } else {
      setValidationResult('fail');
    }

    setIsValidating(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-8 mx-4 w-full max-w-md"
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🔑</div>
              <h2 className="text-2xl font-bold text-gray-800">Gemini API 키 설정</h2>
              <p className="text-gray-500 text-sm mt-2">
                Google AI Studio에서 발급받은 API 키를 입력해주세요.
                <br />키는 내 기기에만 안전하게 저장됩니다.
              </p>
            </div>

            <div className="relative mb-4">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setValidationResult(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="AIza..."
                className="w-full border-2 border-lavender-200 rounded-xl px-4 py-3 pr-12 text-gray-700 focus:outline-none focus:border-lavender-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-xl"
                aria-label={showKey ? '키 숨기기' : '키 보기'}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>

            {validationResult === 'fail' && (
              <motion.p
                className="text-red-500 text-sm mb-3 text-center"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ❌ 유효하지 않은 API 키입니다. 다시 확인해주세요.
              </motion.p>
            )}
            {validationResult === 'success' && (
              <motion.p
                className="text-green-500 text-sm mb-3 text-center"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ✅ API 키가 확인되었습니다!
              </motion.p>
            )}

            <motion.button
              onClick={handleSave}
              disabled={!inputKey.trim() || isValidating}
              className="w-full bg-gradient-to-r from-purple-400 to-teal-400 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isValidating ? '🔍 확인 중...' : '저장하기'}
            </motion.button>

            <p className="text-xs text-gray-400 text-center mt-4">
              API 키는 서버로 전송되지 않으며, 이 기기의 브라우저에만 저장됩니다.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApiKeySetup;
