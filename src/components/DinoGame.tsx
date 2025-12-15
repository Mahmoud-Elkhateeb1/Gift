import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface DinoGameProps {
  onWin: () => void;
}

const DinoGame = ({ onWin }: DinoGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const gameStateRef = useRef({
    catY: 200,
    catVelocity: 0,
    isJumping: false,
    obstacles: [] as { x: number; emoji: string }[],
    gameSpeed: 5,
    score: 0,
    frame: 0,
  });

  const WIN_SCORE = 5; // Win after 5 points

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const GROUND_Y = 250;
    const CAT_WIDTH = 40;
    const CAT_HEIGHT = 40;
    const GRAVITY = 0.6;
    const JUMP_POWER = -12;

    let animationFrameId: number;

    const drawCat = () => {
      ctx.fillStyle = "#ff69b4";
      ctx.font = "40px Arial";
      ctx.fillText("🐱", 50, gameStateRef.current.catY);
    };

    const drawObstacles = () => {
      gameStateRef.current.obstacles.forEach((obstacle) => {
        ctx.font = "40px Arial";
        ctx.fillText(obstacle.emoji, obstacle.x, GROUND_Y);
      });
    };

    const drawGround = () => {
      ctx.strokeStyle = "#6b7280";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y + 20);
      ctx.lineTo(canvas.width, GROUND_Y + 20);
      ctx.stroke();
    };

    const drawScore = () => {
      ctx.fillStyle = "#fff";
      ctx.font = "20px monospace";
      ctx.fillText(`Score: ${gameStateRef.current.score}`, 10, 30);
      ctx.fillText(`Win at: ${WIN_SCORE}`, 10, 55);
    };

    const checkCollision = () => {
      const catLeft = 50;
      const catRight = catLeft + CAT_WIDTH;
      const catBottom = gameStateRef.current.catY;
      const catTop = catBottom - CAT_HEIGHT;

      for (const obstacle of gameStateRef.current.obstacles) {
        const obstacleLeft = obstacle.x;
        const obstacleRight = obstacle.x + 40;
        const obstacleTop = GROUND_Y - 40;
        const obstacleBottom = GROUND_Y;

        if (
          catRight > obstacleLeft &&
          catLeft < obstacleRight &&
          catBottom > obstacleTop &&
          catTop < obstacleBottom
        ) {
          return true;
        }
      }
      return false;
    };

    const gameLoop = () => {
      if (!canvas || !ctx) return;

      // Clear canvas
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update cat position (gravity)
      gameStateRef.current.catVelocity += GRAVITY;
      gameStateRef.current.catY += gameStateRef.current.catVelocity;

      // Ground collision
      if (gameStateRef.current.catY >= GROUND_Y) {
        gameStateRef.current.catY = GROUND_Y;
        gameStateRef.current.catVelocity = 0;
        gameStateRef.current.isJumping = false;
      }

      // Add obstacles
      gameStateRef.current.frame++;
      if (gameStateRef.current.frame % 200 === 0) {
        gameStateRef.current.obstacles.push({
          x: canvas.width,
          emoji: "🎀",
        });
      }

      // Update obstacles
      gameStateRef.current.obstacles = gameStateRef.current.obstacles.filter(
        (obstacle) => {
          obstacle.x -= gameStateRef.current.gameSpeed;
          if (obstacle.x < -40) {
            gameStateRef.current.score++;
            gameStateRef.current.gameSpeed += 0.05;
            return false;
          }
          return true;
        }
      );

      // Check for win
      if (gameStateRef.current.score >= WIN_SCORE) {
        toast.success("🎉 You Win! Opening your special message...");
        setTimeout(() => {
          onWin();
        }, 1500);
        return;
      }

      // Check collision
      if (checkCollision()) {
        setIsGameOver(true);
        toast.error("Game Over! Click to restart");
        return;
      }

      // Draw everything
      drawGround();
      drawCat();
      drawObstacles();
      drawScore();

      setScore(gameStateRef.current.score);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const handleJump = (e: KeyboardEvent | MouseEvent | TouchEvent) => {
      e.preventDefault(); // Prevent default touch behavior
      
      if (e instanceof KeyboardEvent && e.code !== "Space") return;

      if (isGameOver) {
        restartGame();
        return;
      }

      if (!gameStateRef.current.isJumping && gameStateRef.current.catY >= GROUND_Y) {
        gameStateRef.current.catVelocity = JUMP_POWER;
        gameStateRef.current.isJumping = true;
      }
    };

    const restartGame = () => {
      // Cancel any existing animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      gameStateRef.current = {
        catY: 200,
        catVelocity: 0,
        isJumping: false,
        obstacles: [],
        gameSpeed: 5,
        score: 0,
        frame: 0,
      };
      setIsGameOver(false);
      setScore(0);
      
      // Start game loop again
      requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleJump);
    canvas.addEventListener("click", handleJump);
    canvas.addEventListener("touchstart", handleJump);

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleJump);
      canvas.removeEventListener("click", handleJump);
      canvas.removeEventListener("touchstart", handleJump);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isGameOver, onWin]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-6 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground mb-2">Cat Jump Game 🐱</h1>
        <p className="text-muted-foreground">
          Press SPACE or TAP to jump over ribbons 🎀
        </p>
        <p className="text-sm text-accent">
          Reach {WIN_SCORE} points to unlock something special! 💝
        </p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="border-2 border-border rounded-lg shadow-2xl bg-[#1a1a2e] max-w-full touch-none"
          style={{ touchAction: 'none' }}
        />
        {isGameOver && (
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center cursor-pointer"
            onClick={() => {
              const canvas = canvasRef.current;
              if (canvas) {
                canvas.dispatchEvent(new MouseEvent('click'));
              }
            }}
          >
            <div className="text-center space-y-4 pointer-events-none">
              <p className="text-2xl font-bold text-white">Game Over!</p>
              <p className="text-lg text-white">Score: {score}</p>
              <p className="text-muted-foreground">Tap or Click to Restart</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-8 text-center">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Current Score</p>
          <p className="text-3xl font-bold text-primary">{score}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Win Score</p>
          <p className="text-3xl font-bold text-accent">{WIN_SCORE}</p>
        </div>
      </div>
    </div>
  );
};

export default DinoGame;
