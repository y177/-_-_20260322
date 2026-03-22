// === src/App.tsx ===

import React, { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import ApiKeySetup from './components/ApiKeySetup';
import StoryInput from './components/StoryInput';
import BookViewer from './components/BookViewer';
import ImageGallery from './components/ImageGallery';
import LoadingMagic from './components/LoadingMagic';

import { useApiKey } from './hooks/useApiKey';
import { useStoryGeneration } from './hooks/useStoryGeneration';

type ViewMode = 'book' | 'gallery';

const App: FC = () => {
  const { apiKey, hasApiKey, saveApiKey, clearApiKey, validateApiKey } = useApiKey();
  const { state, generate, reset } = useStoryGeneration();

  const [showApiModal, setShowApiModal] = useState(!hasApiKey);
  const [viewMode, setViewMode] = useState<ViewMode>('book');

  const handleGenerate = (story: string) => {
    if (!hasApiKey) {
      setShowApiModal(true);
      return;
    }
    generate(story, apiKey);
  };

  const handleApiKeySave = (key: string) => {
    saveApiKey(key);
    setShowApiModal(false);
  };

  const handleReset = () => {
    reset();
    setViewMode('book');
  };

  const isLoading = state.step === 'parsing' || state.step === 'generating';

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-100 via-white to-mint-100 font-sans">
      {/* 헤더 */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-2xl mx-auto">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="text-2xl">📚</span>
          <h1 className="text-xl font-bold text-purple-700">이야기 동화관</h1>
        </motion.div>

        <motion.button
          onClick={() => setShowApiModal(true)}
          className="text-sm text-purple-500 border border-purple-200 rounded-full px-3 py-1.5 hover:bg-purple-50 transition-colors"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          🔑 API 키 {hasApiKey ? '변경' : '설정'}
        </motion.button>
      </header>

      {/* API 키 모달 */}
      <ApiKeySetup
        isOpen={showApiModal}
        onSave={handleApiKeySave}
        onValidate={validateApiKey}
      />

      {/* 메인 컨텐츠 */}
      <main className="px-4 pb-16 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {/* 유휴 상태: 입력 폼 */}
          {state.step === 'idle' && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {!hasApiKey && (
                <motion.div
                  className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-yellow-700 text-sm">
                    ⚠️ API 키를 먼저 설정해주세요.{' '}
                    <button
                      onClick={() => setShowApiModal(true)}
                      className="font-semibold underline"
                    >
                      설정하기
                    </button>
                  </p>
                </motion.div>
              )}
              <StoryInput onGenerate={handleGenerate} isDisabled={!hasApiKey} />
            </motion.div>
          )}

          {/* 로딩 상태 */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden"
            >
              <LoadingMagic
                step={state.step as 'parsing' | 'generating'}
                completedImages={state.completedImages}
                totalImages={state.totalImages}
              />

              {/* 생성 중에도 완성된 장면 미리보기 */}
              {state.step === 'generating' && state.scenes.some((s) => s.imageBase64) && (
                <div className="px-6 pb-6">
                  <p className="text-xs text-gray-400 text-center mb-3">완성된 장면 미리보기</p>
                  <div className="grid grid-cols-3 gap-2">
                    {state.scenes.map((scene) =>
                      scene.imageBase64 ? (
                        <motion.div
                          key={scene.pageNumber}
                          className="aspect-square rounded-xl overflow-hidden"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <img
                            src={`data:${scene.mimeType || 'image/png'};base64,${scene.imageBase64}`}
                            alt={`${scene.pageNumber}페이지`}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 완료 상태: 뷰어 */}
          {state.step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 뷰 모드 탭 */}
              <div className="flex gap-2 mb-4 bg-white/60 rounded-2xl p-1 w-fit mx-auto">
                {(['book', 'gallery'] as const).map((mode) => (
                  <motion.button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      viewMode === mode
                        ? 'bg-gradient-to-r from-purple-400 to-teal-400 text-white shadow'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {mode === 'book' ? '📖 동화책' : '🖼️ 갤러리'}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {viewMode === 'book' ? (
                  <motion.div
                    key="book"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <BookViewer
                      title={state.title}
                      scenes={state.scenes}
                      onReset={handleReset}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="gallery"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6"
                  >
                    <ImageGallery title={state.title} scenes={state.scenes} />
                    <motion.button
                      onClick={handleReset}
                      className="w-full mt-4 bg-purple-50 border-2 border-purple-300 text-purple-600 font-semibold py-3 rounded-2xl"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🔄 새 이야기 만들기
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* 에러 상태 */}
          {state.step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center"
            >
              <div className="text-5xl mb-4">😢</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">오류가 발생했어요</h3>
              <p className="text-red-500 text-sm mb-6 bg-red-50 rounded-xl p-3">
                {state.error}
              </p>
              <motion.button
                onClick={handleReset}
                className="bg-gradient-to-r from-purple-400 to-teal-400 text-white font-bold py-3 px-8 rounded-2xl"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                다시 시도하기
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 푸터 */}
      <footer className="text-center text-xs text-gray-400 pb-6">
        <p>놀이치료 이야기 동화관 · 아이들의 이야기를 소중히 담습니다 💜</p>
      </footer>
    </div>
  );
};

export default App;
