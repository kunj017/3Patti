import React, { useEffect } from "react";
import "../App.css";
const ArrangeCircle = () => {
  useEffect(() => {
    const circle = document.querySelector(".circle");
    const divs = document.querySelectorAll(".positioned-div");
    const angle = 360 / divs.length;

    divs.forEach((div, index) => {
      const rotation = angle * index;
      const posX =
        Math.cos((rotation * Math.PI) / 180) *
        (circle.offsetWidth / 2 - div.offsetWidth / 2);
      const posY =
        Math.sin((rotation * Math.PI) / 180) *
        (circle.offsetHeight / 2 - div.offsetHeight / 2);
      div.style.transform = `translate(${posX}px, ${posY}px)`;
    });
  }, []);

  return (
    <div className="circle">
      <div className="positioned-div"></div>
      <div className="positioned-div"></div>
      <div className="positioned-div"></div>
      <div className="positioned-div"></div>
      <div className="positioned-div"></div>
      <div className="positioned-div"></div>
      <div className="positioned-div"></div>
      <div className="positioned-div"></div>
    </div>
  );
};

export default ArrangeCircle;
