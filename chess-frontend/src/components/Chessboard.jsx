import React from 'react';
import { Chessboard } from 'react-chessboard';

export default function ChessboardComponent({ fen, onDrop, onDragStart, onSnapEnd, isWhite }) {
  return (
    <div className='mx-auto'>
      <Chessboard
      boardWidth={600}
      position={fen}
      onPieceDrop={onDrop}
      onPieceDragBegin={onDragStart}
      onPieceDragEnd={onSnapEnd}
      boardOrientation={isWhite ? 'white' : 'black'}
      //allowDragOutsideBoard={false} this is bugged in the first move
    />
    </div>
  
  );
}
