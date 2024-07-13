import React from 'react';

export default function GameStatus({ status, fen }) {
  return (
    <div className="mt-4 p-4 bg-white shadow-md rounded">
      <p className="text-lg font-semibold">Status: {status}</p>
      <p className="text-sm font-mono">FEN: {fen}</p>
    </div>
  );
}
