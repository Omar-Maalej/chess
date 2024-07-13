import React from 'react';

export default function GameControls({ createGame, joinGame, isGameCreated, gameId }) {
  return (
    <>
      {!isGameCreated && (
        <div className="space-x-4">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700" 
            onClick={createGame}
          >
            Create Game
          </button>
          <button 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700" 
            onClick={joinGame}
          >
            Join Game
          </button>
        </div>
      )}
    </>
  );
}
