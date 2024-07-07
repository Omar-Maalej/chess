import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

export default function PlayGame() {
  const [game, setGame] = useState(new Chess());
  const [gameId, setGameId] = useState(null);
  const [status, setStatus] = useState("");
  const [isGameCreated, setIsGameCreated] = useState(false);
  const [fen, setFen] = useState(game.fen());
  const [pgn, setPgn] = useState(game.pgn());
  const [isWhite, setIsWhite] = useState(true);

  useEffect(() => {
    socket.on('gameCreated', ({ gameId }) => {
      console.log("in game created")
      setGameId(gameId);
      setIsGameCreated(true);
      setIsWhite(true);
      console.log(`Game created with ID: ${gameId}`);
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
      console.log(`Game joined with ID: ${gameId}`)
    });

    socket.on('moveMade', ({ fen }) => {
      console.log("is white : ", isWhite)
      if (fen) {
        game.load(fen); // Update the game state with the FEN
        setFen(fen);
      } else {
        console.error("Received invalid FEN string");
      }
      console.log(`Move made in game with ID: ${gameId}`)
    });

    socket.on('playerJoined', ({ playerId }) => {
      console.log(`Player ${playerId} joined the game.`);
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
    console.log("onDragStart", piece, sourceSquare)
    // do not pick up pieces if the game is over
    console.log(game.isGameOver());
    if (game.isGameOver()) return false;
    console.log(  (game.turn() === "w" && sourceSquare.search(/^b/)!== -1 ) ||
    (game.turn() === "b" && sourceSquare.search(/^w/)!== -1 ))
  

    return true;
  }

  function onDrop(sourceSquare, targetSquare) {
    // check if the move is legal
    const possibleMoves = game.moves({ verbose: true });
    const move = possibleMoves.find(
      m => m.from === sourceSquare && m.to === targetSquare
    );

    if (
      (game.turn() === "w" && !isWhite ) ||
      (game.turn() === "b" && isWhite )
    ) {
      return false;
    }

    if (!move) {
      console.log("Illegal move");
      return false;
    }
    move.promotion = "q";

    // Emit the move to the server
    socket.emit('makeMove', { gameId, move });

    // Make the move locally
    game.move(move);
    setFen(game.fen());
    setPgn(game.pgn());
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
    <div>
      {(!isGameCreated) ? (
        <div>
          <button onClick={createGame}>Create Game</button>
          <button onClick={joinGame}>Join Game</button>
        </div>
      ) : (
        <div>
          <p>Game ID: {gameId}</p>
          <Chessboard
            boardWidth={600}
            position={fen}
            onPieceDrop={onDrop}
            onPieceDragBegin={onDragStart}
            onPieceDragEnd={onSnapEnd}
            boardOrientation= {isWhite ? 'white' : 'black'}
            allowDragOutsideBoard={false}
          />
          <div>
            <p>Status: {status}</p>
            <p>FEN: {fen}</p>
            <p>PGN: {pgn}</p>
          </div>
        </div>
      )}
    </div>
  );
}
