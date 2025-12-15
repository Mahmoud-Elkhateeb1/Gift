import FoldedCard from "@/components/FoldedCard";
import DinoGame from "@/components/DinoGame";
import { useGame } from "@/contexts/GameContext";

const Index = () => {
  const { hasWon, setHasWon } = useGame();

  return (
    <div className="min-h-screen bg-background">
      {!hasWon ? (
        <DinoGame onWin={() => setHasWon(true)} />
      ) : (
        <FoldedCard />
      )}
    </div>
  );
};

export default Index;
