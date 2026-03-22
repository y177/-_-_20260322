// === src/components/BookViewer.tsx ===

import React, { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import type { StoryScene } from '../types/story';

interface BookViewerProps {
  title: string;
  scenes: StoryScene[];
  onReset: () => void;
}

const PAGE_VARIANTS = {
  enter: (dir: number) => ({
    x: dir > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const BookViewer: FC<BookViewerProps> = ({ title, scenes, onReset }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const scene = scenes[currentPage];
  const totalPages = scenes.length;

  const goNext = () => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      setCurrentPage((p) => p + 1);
    }
  };

  const goPrev = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage((p) => p - 1);
    }
  };

  /** 완성된 동화책 PNG들을 ZIP으로 다운로드 */
  const downloadZip = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(title || 'storybook');

      scenes.forEach((s) => {
        if (s.imageBase64) {
          folder?.file(
            `page-${String(s.pageNumber).padStart(2, '0')}.png`,
            s.imageBase64,
            { base64: true }
          );
        }
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'storybook'}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('다운로드 중 오류가 발생했습니다.');
    }
    setIsDownloading(false);
  };

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-40 bg-black/90 flex items-center justify-center'
    : 'w-full max-w-lg mx-auto';

  return (
    <div className={containerClass}>
      <motion.div
        className={`bg-white rounded-3xl shadow-2xl overflow-hidden ${
          isFullscreen ? 'w-full max-w-xl mx-4' : 'w-full'
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-400 to-teal-400 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg truncate">{title}</h2>
          <div className="flex gap-2">
            <motion.button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white/80 hover:text-white text-xl transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={isFullscreen ? '전체화면 해제' : '전체화면'}
            >
              {isFullscreen ? '⊡' : '⊞'}
            </motion.button>
          </div>
        </div>

        {/* 페이지 컨텐츠 */}
        <div className="relative overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentPage}
              custom={direction}
              variants={PAGE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* 이미지 영역 (60%) */}
              <div className="w-full aspect-[4/3] bg-gradient-to-br from-purple-50 to-teal-50 flex items-center justify-center">
                {scene?.imageBase64 ? (
                  <img
                    src={`data:${scene.mimeType || 'image/png'};base64,${scene.imageBase64}`}
                    alt={`${title} - ${scene.pageNumber}페이지`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="text-4xl"
                    >
                      🌀
                    </motion.div>
                    <p className="text-sm">그림을 그리는 중...</p>
                  </div>
                )}
              </div>

              {/* 텍스트 영역 (40%) */}
              <div className="px-6 py-5 min-h-[140px]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-2 py-1 rounded-full">
                    {scene?.emotion}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed text-base">
                  {scene?.text}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 네비게이션 */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <motion.button
              onClick={goPrev}
              disabled={currentPage === 0}
              className="flex items-center gap-1 text-purple-500 font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
              whileHover={{ scale: currentPage === 0 ? 1 : 1.05 }}
              whileTap={{ scale: currentPage === 0 ? 1 : 0.95 }}
            >
              ← 이전
            </motion.button>

            {/* 페이지 도트 */}
            <div className="flex gap-1.5">
              {scenes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentPage ? 1 : -1);
                    setCurrentPage(i);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentPage
                      ? 'bg-purple-400 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <motion.button
              onClick={goNext}
              disabled={currentPage === totalPages - 1}
              className="flex items-center gap-1 text-purple-500 font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
              whileHover={{ scale: currentPage === totalPages - 1 ? 1 : 1.05 }}
              whileTap={{ scale: currentPage === totalPages - 1 ? 1 : 0.95 }}
            >
              다음 →
            </motion.button>
          </div>

          <p className="text-center text-sm text-gray-400 mb-4">
            {currentPage + 1} / {totalPages} 페이지
          </p>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <motion.button
              onClick={downloadZip}
              disabled={isDownloading}
              className="flex-1 bg-teal-50 border-2 border-teal-300 text-teal-600 font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isDownloading ? '📦 저장 중...' : '📥 ZIP 다운로드'}
            </motion.button>
            <motion.button
              onClick={onReset}
              className="flex-1 bg-purple-50 border-2 border-purple-300 text-purple-600 font-semibold py-2.5 rounded-xl text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🔄 새 이야기
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookViewer;
