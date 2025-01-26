import "./homepage.css";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";

const Homepage = () => {
  const [typingStatus, setTypingStatus] = useState("human1");
  return (
    <div className="homepage">
      <img src="/orbital.png" alt="" className="orbital" />
      <div className="left">
        <h1>Estate AI</h1>
        <h2>Revolutionizing Real Estate with AI-Powered Solutions</h2>
        <h3>
          Find properties that match your exact preferences, and let our AI
          guide you through every step of the process with ease and confidence.
        </h3>
        <Link to="/dashboard">Get Started</Link>
      </div>
      <div className="right">
        <div className="imgContainer">
          <div className="bgContainer">
            <div className="bg"></div>
          </div>
          <img src="/bot.png" alt="" className="bot" />
          <div className="chat">
            <img
              src={
                typingStatus === "human1"
                  ? "/human1.jpeg"
                  : typingStatus === "human2"
                  ? "/human2.jpeg"
                  : "bot.png"
              }
              alt=""
            />
            <TypeAnimation
              sequence={[
                "Human1: We are looking to purchase an estate in New York",
                2000,
                () => {
                  setTypingStatus("bot");
                },
                "Bot: I can help you find an estate in Los Angeles",
                2000,
                () => {
                  setTypingStatus("human2");
                },
                "Human2: We are considering an estate in Miami",
                2000,
                () => {
                  setTypingStatus("bot");
                },
                "Bot: Let me show you some options for estates in Orlando",
                2000,
                () => {
                  setTypingStatus("human1");
                },
              ]}
              wrapper="span"
              repeat={Infinity}
              cursor={true}
              omitDeletionAnimation={true}
            />
          </div>
        </div>
      </div>
      <div className="terms">
        <img src="/logo.png" alt="" />
        <div className="links">
          <Link to="/">Terms of Services</Link>
          <span>|</span>
          <Link to="/">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
