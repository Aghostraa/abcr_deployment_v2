import React, { useState, useEffect } from 'react';

interface EmojiRainProps {
  emojis: string[];
  duration: number;
  count: number;
}

interface EmojiProps {
  emoji: string;
  style: React.CSSProperties;
}

const Emoji: React.FC<EmojiProps> = ({ emoji, style }) => {
  return <div style={style}>{emoji}</div>;
};

const EmojiRain: React.FC<EmojiRainProps> = ({ emojis, duration, count }) => {
  const [emojiElements, setEmojiElements] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const newEmojiElements = Array.from({ length: count }, (_, i) => {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const delay = Math.random() * duration;
      const leftPosition = Math.random() * 100;
      
      const style: React.CSSProperties = {
        position: 'fixed',
        top: '-50px',
        left: `${leftPosition}vw`,
        fontSize: `${Math.random() * 20 + 10}px`,
        userSelect: 'none',
        animation: `fall ${duration / 1000}s linear ${delay}ms forwards`,
      };

      return <Emoji key={i} emoji={emoji} style={style} />;
    });

    setEmojiElements(newEmojiElements);

    const timer = setTimeout(() => {
      setEmojiElements([]);
    }, duration + 1000);

    return () => clearTimeout(timer);
  }, [emojis, duration, count]);

  return (
    <>
      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(-50px);
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
      {emojiElements}
    </>
  );
};

export default EmojiRain;