import { createContext, useContext, useState, ReactNode } from "react";

interface GameContextType {
    hasWon: boolean;
    setHasWon: (won: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [hasWon, setHasWon] = useState(false);

    return (
        <GameContext.Provider value={{ hasWon, setHasWon }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error("useGame must be used within a GameProvider");
    }
    return context;
};

