import React from "react";
import { useNavigate } from "react-router-dom";

function EntryPage() {
  const navigate = useNavigate();

  return (
    <>
      <div>EntryPage</div>
      <button
        onClick={() => {
          navigate("/3Patti");
        }}
      >
        3 Patti
      </button>

      <button
        onClick={() => {
          navigate("/dev");
        }}
      >
        Dev
      </button>

      <button
        onClick={() => {
          navigate("/socket");
        }}
      >
        Test Socket
      </button>

      <button
        onClick={() => {
          navigate("/uiExperiment");
        }}
      >
        UI experimentation
      </button>

      <button
        onClick={() => {
          navigate("/gameArena");
        }}
      >
        Game Arena
      </button>

      <button
        onClick={() => {
          navigate("/chat");
        }}
      >
        Chat Space
      </button>

      <button
        onClick={() => {
          navigate("/seat");
        }}
      >
        Seat Component
      </button>
    </>
  );
}

export default EntryPage;
