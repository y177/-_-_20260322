// === src/components/ImageGallery.tsx ===

import React, { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoryScene } from '../types/story';

interface ImageGalleryProps {
  scenes: StoryScene[];
  title: string;
}

const ImageGallery: FC<ImageGalleryProps> = ({ scenes, title }) => {
  const [selectedScene, setSelectedScene] = useState<StoryScene | null>(null);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">
        🖼️ {title} - 장면 갤러리
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {scenes.map((scene) => (
          <motion.div
            key={scene.pageNumber}
            className="relative aspect-square rounded-2xl overflow-hidden bg-purple-50 cursor-pointer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scene.imageBase64 && setSelectedScene(scene)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: scene.pageNumber * 0.05 }}
          >
            {scene.imageBase64 ? (
              <img
                src={`data:${scene.mimeType || 'image/png'};base64,${scene.imageBase64}`}
                alt={`${scene.pageNumber}페이지`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-2xl"
                >
                  🌀
                </motion.div>
                <span className="text-xs">{scene.pageNumber}페이지</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-2 py-1 text-center">
              {scene.pageNumber}페이지 · {scene.emotion}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 라이트박스 */}
      <AnimatePresence>
        {selectedScene && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedScene(null)}
          >
            <motion.div
              className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`data:${selectedScene.mimeType || 'image/png'};base64,${selectedScene.imageBase64}`}
                alt={`${selectedScene.pageNumber}페이지`}
                className="w-full aspect-square object-cover"
              />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-2 py-1 rounded-full">
                    {selectedScene.emotion}
                  </span>
                  <span className="text-gray-400 text-xs">{selectedScene.pageNumber}페이지</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{selectedScene.text}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageGallery;
