import React from 'react';
import { Chessboard } from 'react-chessboard';

export default function ChessboardComponent({ fen, onDrop, onDragStart, onSnapEnd, isWhite }) {
  return (
    <Chessboard
      boardWidth={600}
      position={fen}
      onPieceDrop={onDrop}
      onPieceDragBegin={onDragStart}
      onPieceDragEnd={onSnapEnd}
      boardOrientation={isWhite ? 'white' : 'black'}
      allowDragOutsideBoard={false}
      className="border-4 border-gray-700 rounded"
    />
  );
}
