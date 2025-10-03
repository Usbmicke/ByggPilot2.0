
'use client';

import { ChatMessage as ChatMessageType } from '@/app/contexts/ChatContext';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { memo } from 'react';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      <div className={`p-3 rounded-lg max-w-xl ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <ReactMarkdown
          components={{
            // Anpassa renderingen av länkar och andra element här om det behövs
          }}
          remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};

export default memo(ChatMessage);
