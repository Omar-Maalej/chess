import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import socket from './socket/socket';
import ChessboardComponent from "./components/Chessboard";
import GameStatus from "./components/GameStatus";
import HomePage from "./components/HomePage";

export default function PlayGame() {
  const [game, setGame] = useState(new Chess());
  const [gameId, setGameId] = useState(null);
  const [status, setStatus] = useState("");
  const [isGameCreated, setIsGameCreated] = useState(false);
  const [fen, setFen] = useState(game.fen());
  const [isWhite, setIsWhite] = useState(true);

  useEffect(() => {
    socket.on('gameCreated', ({ gameId }) => {
      setGameId(gameId);
      setIsGameCreated(true);
      setIsWhite(true);
    });

    socket.on('gameJoined', ({ fen, gameId }) => {
      if (fen) {
        game.load(fen); // Update the game state with the FEN
        setGameId(gameId);
        setIsGameCreated(true);
        setIsWhite(false);
        setFen(fen);
      } else {
        console.error("Received invalid FEN string");
      }
    });

    socket.on('moveMade', ({ fen }) => {
      if (fen) {
        game.load(fen); // Update the game state with the FEN
        setFen(fen);
      } else {
        console.error("Received invalid FEN string");
      }
    });

    socket.on('error', (message) => {
      alert(`${message}`);
    });

    socket.on('playerJoined', ({ playerId }) => {
      setStatus(`Player ${playerId} joined the game.`);
    });

    // Clean up the effect
    return () => {
      socket.off('gameCreated');
      socket.off('gameJoined');
      socket.off('moveMade');
      socket.off('playerJoined');
      socket.off('error');
    };
  }, []);

  const createGame = () => {
    socket.emit('createGame');
  };

  const joinGame = () => {
    const gameId = prompt('Enter game ID to join:');
    if (gameId) {
      socket.emit('joinGame', gameId);
    }
  };

  useEffect(() => {
    updateStatus();
  }, [fen]);

  function onDragStart(sourceSquare, piece) {
    if (game.isGameOver()) return false;
    return true;
  }

  function onDrop(sourceSquare, targetSquare) {
    const possibleMoves = game.moves({ verbose: true });
    const move = possibleMoves.find(
      m => m.from === sourceSquare && m.to === targetSquare
    );

    if (
      (game.turn() === "w" && !isWhite) ||
      (game.turn() === "b" && isWhite)
    ) {
      return false;
    }

    if (!move) {
      console.log("Illegal move");
      return false;
    }
    move.promotion = "q";

    socket.emit('makeMove', { gameId, move });

    game.move(move);
    setFen(game.fen());
    return true;
  }

  function onSnapEnd() {
    setFen(game.fen());
  }

  function updateStatus() {
    let status = "";

    let moveColor = "White";
    if (game.turn() === "b") {
      moveColor = "Black";
    }

    if (game.isCheckmate()) {
      status = `Game over, ${moveColor} is in checkmate.`;
    } else if (game.isDraw()) {
      status = "Game over, drawn position";
    } else {
      status = `${moveColor} to move`;

      if (game.isCheck()) {
        status += `, ${moveColor} is in check`;
      }
    }

    setStatus(status);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <HomePage createGame={createGame} joinGame={joinGame} isGameCreated={isGameCreated} gameId={gameId} />
      {isGameCreated && (
         <div className="space-y-4">
          <p className="text-lg font-semibold">Game ID: {gameId}</p>
          <ChessboardComponent
            fen={fen} 
            onDrop={onDrop} 
            onDragStart={onDragStart} 
            onSnapEnd={onSnapEnd} 
            isWhite={isWhite} 
          />
          <GameStatus status={status} fen={fen} />
          </div>
      )}
    </div>
  );
}
