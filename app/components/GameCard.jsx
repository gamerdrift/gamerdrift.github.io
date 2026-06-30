// GameCard.jsx
import React from "react";
import "./GameCard.css";
import GlassCard from "./GlassCard";
import NeonButton from "./NeonButton";

export default function GameCard({ game }) {
  const launchUrl = game.gameUrl || game.url || '/';

  return (
    <GlassCard className="game-card">
      <img src={game.coverImage} alt={game.title} className="cover" />
      <h3 className="title">{game.title}</h3>
      <p className="desc">{game.description}</p>
      <NeonButton
        className="play-btn"
        onClick={() => window.open(launchUrl, "_blank")}
      >
        Play Now
      </NeonButton>
    </GlassCard>
  );
}
