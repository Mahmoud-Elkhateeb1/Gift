import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Emoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
  speed: number;
  rotation: number;
}

const FoldedCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  const emojiList = ["😭", "❤️", "🫰", "🎀", "💕", "😁"];

  // ❤️ Click = Emoji Burst Only
  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip

    const burst: Emoji[] = [];
    for (let i = 0; i < 15; i++) {
      burst.push({
        id: Date.now() + i,
        emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
        x: Math.random() * 100,
        y: -10,
        speed: 2 + Math.random() * 3,
        rotation: Math.random() * 360,
      });
    }
    setEmojis((prev) => [...prev, ...burst]);
  };

  // 🌧 Continuous non-stop rain
  useEffect(() => {
    const spawn = setInterval(() => {
      const newEmoji: Emoji = {
        id: Date.now(),
        emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
        x: Math.random() * 100,
        y: -10,
        speed: 1.5 + Math.random() * 2,
        rotation: Math.random() * 360,
      };
      setEmojis((prev) => [...prev, newEmoji]);
    }, 400);

    return () => clearInterval(spawn);
  }, []);

  // 🌧 Emoji falling animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setEmojis((prev) =>
        prev
          .map((emoji) => ({
            ...emoji,
            y: emoji.y + emoji.speed,
            rotation: emoji.rotation + 4,
          }))
          .filter((emoji) => emoji.y < 110)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen perspective-1000">
      <div className="relative mb-[60px] flex items-center justify-center gap-3 px-4">
        {/* Birthday emojis with floating animation */}
        <span
          className="text-3xl animate-float"
          style={{ animationDelay: '0s' }}
        >
          🎂
        </span>
        <span
          className="text-3xl animate-float"
          style={{ animationDelay: '0.5s' }}
        >
          🎉
        </span>

        {/* Main birthday text */}
        <div className="birthday-text handwritten text-3xl md:text-4xl leading-relaxed tracking-wide font-bold px-4">
          Happy Birthday to you Salma
        </div>

        {/* More birthday emojis */}
        <span
          className="text-3xl animate-float"
          style={{ animationDelay: '1s' }}
        >
          🎈
        </span>
        <span
          className="text-3xl animate-float"
          style={{ animationDelay: '1.5s' }}
        >
          🎁
        </span>

        {/* Sparkle effects */}
        <span
          className="absolute -top-2 -left-2 text-2xl animate-sparkle"
          style={{ animationDelay: '0s' }}
        >
          ✨
        </span>
        <span
          className="absolute -top-2 -right-2 text-2xl animate-sparkle"
          style={{ animationDelay: '1s' }}
        >
          ⭐
        </span>
        <span
          className="absolute -bottom-2 left-1/4 text-2xl animate-sparkle"
          style={{ animationDelay: '0.5s' }}
        >
          💫
        </span>
        <span
          className="absolute -bottom-2 right-1/4 text-2xl animate-sparkle"
          style={{ animationDelay: '1.5s' }}
        >
          ✨
        </span>
      </div>
      <div
        className={cn(
          "relative w-80 h-96 cursor-pointer transition-transform duration-700 ease-out",
          "transform-style-3d",
          isOpen ? "scale-110" : "hover:scale-105"
        )}
        onClick={(e) => {
          // If click is on heart → DO NOT flip
          if ((e.target as HTMLElement).closest(".heart-btn")) return;
          setIsOpen(!isOpen);
        }}
      >
        {/* 3D Card Container */}
        <div
          className={cn(
            "relative w-full h-full transition-all duration-700",
            "transform-style-3d"
          )}
          style={{
            transformStyle: "preserve-3d",
            transform: isOpen ? "rotateY(-180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT */}
          <div
            className={cn(
              "absolute inset-0 backface-hidden",
              "bg-card rounded-lg shadow-2xl",
              "paper-texture border-2 border-border/30",
              "flex items-center justify-center"
            )}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div className="absolute inset-y-0 left-1/2 w-1 bg-gradient-to-r from-transparent via-black/10 to-transparent" />
            </div>

            {/* ❤️ Main Heart */}
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              className="heart-btn relative z-10 cursor-pointer hover:scale-110 transition-transform"
              onClick={handleHeartClick}
            >
              <path
                d="M60 100 C 20 80, 10 50, 20 35 C 30 20, 45 20, 60 35 C 75 20, 90 20, 100 35 C 110 50, 100 80, 60 100 Z"
                fill="none"
                stroke="hsl(var(--heart-color))"
                strokeWidth="3"
              />
            </svg>

            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/10 to-transparent rounded-b-lg" />
          </div>

          {/* BACK */}
          <div
            className={cn(
              "absolute inset-0 backface-hidden",
              "bg-card rounded-lg shadow-2xl",
              "paper-texture border-2 border-border/30",
              "p-8 flex items-center justify-center"
            )}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Lined Paper */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 h-px bg-card-foreground/10"
                  style={{ top: `${(i + 1) * 8.33}%` }}
                />
              ))}
              <div className="absolute top-0 bottom-0 left-12 w-px bg-accent/20" />
            </div>

            <div className="relative z-10 text-center space-y-4">
              <p className="handwritten text-xl leading-relaxed tracking-wide text-card-foreground">
                It's the birthday of the kindest person in
                {/* <br /> */}
                the company! Happy birthday,
                {/* <br /> */}
                may God bless you and grant you many
                {/* <br /> */}
                more happy and successful years.This is a
                {/* <br /> */}
                small gift I spent all night making;
                <br />
                I hope you like it.That's all.
                <br />
                Finally,always be happy ❤️🫰.
              </p>

              {/* Small heart */}
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                className="heart-btn mx-auto mt-4 cursor-pointer hover:scale-125 transition-transform"
                onClick={handleHeartClick}
              >
                <path
                  d="M20 32 C 10 26, 5 18, 8 12 C 11 6, 16 6, 20 12 C 24 6, 29 6, 32 12 C 35 18, 30 26, 20 32 Z"
                  fill="hsl(var(--heart-color))"
                  opacity="0.6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* "Click to open" text */}
      {!isOpen && (
        <div className="absolute bottom-12 text-center">
          <p className="text-foreground/60 text-sm animate-pulse">Click to open</p>
        </div>
      )}

      {/* Emoji Rain */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {emojis.map((emoji) => (
          <div
            key={emoji.id}
            className="absolute text-4xl transition-all duration-100"
            style={{
              left: `${emoji.x}%`,
              top: `${emoji.y}%`,
              transform: `rotate(${emoji.rotation}deg)`,
            }}
          >
            {emoji.emoji}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoldedCard;
