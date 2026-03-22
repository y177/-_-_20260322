// === src/components/LoadingMagic.tsx ===

import React, { FC } from 'react';
import { motion } from 'framer-motion';

interface LoadingMagicProps {
  step: 'parsing' | 'generating';
  completedImages: number;
  totalImages: number;
}

const MAGIC_MESSAGES = [
  '이야기 속 보물을 찾고 있어요 ✨',
  '마법사가 그림을 그리고 있어요 🪄',
  '별빛을 모으는 중이에요 ⭐',
  '동화나라 친구들을 불러오고 있어요 🌈',
  '색연필로 그림을 칠하고 있어요 🎨',
];

const LoadingMagic: FC<LoadingMagicProps> = ({ step, completedImages, totalImages }) => {
  const messageIndex = completedImages % MAGIC_MESSAGES.length;

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 마법 애니메이션 */}
      <div className="relative w-32 h-32 mb-8">
        {/* 회전하는 별들 */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 text-yellow-400 text-xl"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: '0 0',
            }}
            animate={{
              rotate: [deg, deg + 360],
              x: [Math.cos((deg * Math.PI) / 180) * 50, Math.cos(((deg + 360) * Math.PI) / 180) * 50],
              y: [Math.sin((deg * Math.PI) / 180) * 50, Math.sin(((deg + 360) * Math.PI) / 180) * 50],
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3,
              delay: i * 0.3,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            ⭐
          </motion.div>
        ))}

        {/* 중앙 마법 지팡이 */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-5xl"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🪄
        </motion.div>
      </div>

      {/* 진행 메시지 */}
      <motion.div
        className="text-center"
        key={completedImages}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {step === 'parsing' ? (
          <>
            <p className="text-xl font-bold text-purple-600 mb-2">이야기를 분석하고 있어요</p>
            <p className="text-gray-500">{MAGIC_MESSAGES[0]}</p>
          </>
        ) : (
          <>
            <p className="text-xl font-bold text-purple-600 mb-2">
              {completedImages + 1}번째 장면을 그리고 있어요 ✨
            </p>
            <p className="text-gray-500">{MAGIC_MESSAGES[messageIndex]}</p>
          </>
        )}
      </motion.div>

      {/* 진행 바 (이미지 생성 중) */}
      {step === 'generating' && totalImages > 0 && (
        <div className="mt-6 w-full max-w-xs">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>진행 중</span>
            <span>{completedImages} / {totalImages} 장면</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedImages / totalImages) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* 로딩 점 애니메이션 */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-purple-400"
            animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default LoadingMagic;
