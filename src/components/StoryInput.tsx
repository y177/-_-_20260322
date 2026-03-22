// === src/components/StoryInput.tsx ===

import React, { FC, useState } from 'react';
import { motion } from 'framer-motion';

interface StoryInputProps {
  onGenerate: (story: string) => void;
  isDisabled?: boolean;
}

const SAMPLE_STORIES = [
  '토끼가 달나라에서 떡을 만들어요',
  '용감한 공룡이 폭풍우를 헤치고 친구를 구해요',
  '작은 별이 하늘에서 내려와 아이와 친구가 됐어요',
];

const StoryInput: FC<StoryInputProps> = ({ onGenerate, isDisabled = false }) => {
  const [story, setStory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (story.trim() && !isDisabled) {
      onGenerate(story.trim());
    }
  };

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">📖</div>
        <h2 className="text-2xl font-bold text-gray-800">이야기를 들려주세요</h2>
        <p className="text-gray-500 text-sm mt-2">
          아이가 말한 이야기를 입력하면 예쁜 동화책으로 만들어드려요!
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="예: 토끼가 달나라에서 떡을 만들어요. 그런데 갑자기 별똥별이 떨어졌어요..."
          disabled={isDisabled}
          rows={5}
          className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:border-purple-400 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <div className="mt-3 mb-5">
          <p className="text-xs text-gray-400 mb-2">예시 이야기:</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_STORIES.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setStory(sample)}
                disabled={isDisabled}
                className="text-xs bg-purple-50 text-purple-600 border border-purple-200 rounded-full px-3 py-1 hover:bg-purple-100 transition-colors disabled:opacity-50"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={!story.trim() || isDisabled}
          className="w-full bg-gradient-to-r from-purple-400 to-teal-400 text-white font-bold py-4 rounded-2xl text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          whileHover={{ scale: isDisabled ? 1 : 1.02 }}
          whileTap={{ scale: isDisabled ? 1 : 0.98 }}
        >
          ✨ 동화책 만들기
        </motion.button>
      </form>
    </motion.div>
  );
};

export default StoryInput;
