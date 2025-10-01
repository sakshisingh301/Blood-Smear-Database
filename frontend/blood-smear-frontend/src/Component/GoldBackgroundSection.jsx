import React from "react";
import "./GoldBackgroundSection.css";
import parrotImage from "../assets/parrot-pexels-anthony.png";

const GoldBackgroundSection = () => {
  return (
    <div className="navbar-gold-section">
      <div className="gold-background">
        <img src={parrotImage} alt="Parrot" className="golden-retriever-image" />
      </div>
    </div>
  );
};

export default GoldBackgroundSection;
