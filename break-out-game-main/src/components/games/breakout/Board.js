// import React, { useEffect, useRef } from "react";
// import { BallMovement } from "./BallMovement";
// import data from "../../data";
// import WallCollision from "./util/WallCollision";
// import Paddle from "./Paddle";
// import Brick from "./Brick";
// import BrickCollision from "./util/BrickCollision";
// import PaddleHit from "./util/PaddleHit";
// import PlayerStats from "./PlayerStats";s
// import AllBroken from "./util/AllBroke";
// import ResetBall from "./util/ResetBall";

// let bricks = [];
// let { ballObj, paddleProps, brickObj, player } = data;

// export default function Board() {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const render = () => {
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");
//       paddleProps.y = canvas.height - paddleProps.height;

//       // Assign Bricks
//       let newBrickSet = Brick(player.level, bricks, canvas, brickObj);

//       if (newBrickSet && newBrickSet.length > 0) {
//         bricks = newBrickSet;
//       }

//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       PlayerStats(ctx, player, canvas);

//       // Display Bricks
//       bricks.map((brick) => {
//         return brick.draw(ctx);
//       });

//       // Handle Ball Movement
//       BallMovement(ctx, ballObj);

//       // Check all broken
//       AllBroken(bricks, player, canvas, ballObj);

//       if (player.lives === 0) {
//         alert("Game Over! Press ok to restart");

//         player.lives = 10;
//         player.level = 1;
//         player.score = 0;
//         ResetBall(ballObj, canvas, paddleProps);
//         bricks.length = 0;
//       }
//       // Ball and Wall Collision
//       WallCollision(ballObj, canvas, player, paddleProps);

//       // Brick Collision
//       let brickCollision;

//       for (let i = 0; i < bricks.length; i++) {
//         brickCollision = BrickCollision(ballObj, bricks[i]);

//         if (brickCollision.hit && !bricks[i].broke) {
//           // console.log(brickCollision);
//           if (brickCollision.axis === "X") {
//             ballObj.dx *= -1;
//             bricks[i].broke = true;
//           } else if (brickCollision.axis === "Y") {
//             ballObj.dy *= -1;
//             bricks[i].broke = true;
//           }
//           player.score += 10;
//         }
//       }
//       Paddle(ctx, canvas, paddleProps);

//       // Paddle + Ball Collision
//       PaddleHit(ballObj, paddleProps);

//       requestAnimationFrame(render);
//     };
//     render();
//   }, []);

//   return (
//     <div style={{ textAlign: "center" }}>
//       <canvas
//         id="canvas"
//         ref={canvasRef}
//         onMouseMove={(event) =>
//         (paddleProps.x =
//           event.clientX -
//           (window.innerWidth < 900 ? 10 : (window.innerWidth * 20) / 200) -
//           paddleProps.width / 2 -
//           10)
//         }
//         height="500"
//         width={
//           window.innerWidth < 900
//             ? window.innerWidth - 20
//             : window.innerWidth - (window.innerWidth * 20) / 100
//         }
//       />
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import { BallMovement } from "./BallMovement";
import data from "../../data";
import WallCollision from "./util/WallCollision";
import Paddle from "./Paddle";
import Brick from "./Brick";
import BrickCollision from "./util/BrickCollision";
import PaddleHit from "./util/PaddleHit";
import PlayerStats from "./PlayerStats";
import AllBroken from "./util/AllBroke";
import ResetBall from "./util/ResetBall";

let bricks = [];
let { ballObj, paddleProps, brickObj, player } = data;

export default function Board() {
  const canvasRef = useRef(null);
  const [leaderboard, setLeaderboard] = useState([]);

  // Fetch leaderboard from backend
  useEffect(() => {
    fetch("http://localhost:5000/leaderboard")
      .then((res) => res.json())
      .then((data) => setLeaderboard(data))
      .catch((err) => console.error("Error fetching leaderboard:", err));
  }, []);

  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      paddleProps.y = canvas.height - paddleProps.height;

      // Assign Bricks
      let newBrickSet = Brick(player.level, bricks, canvas, brickObj);
      if (newBrickSet && newBrickSet.length > 0) {
        bricks = newBrickSet;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      PlayerStats(ctx, player, canvas);

      // Display Bricks
      bricks.map((brick) => brick.draw(ctx));

      // Handle Ball Movement
      BallMovement(ctx, ballObj);

      // Check all broken
      AllBroken(bricks, player, canvas, ballObj);

      if (player.lives === 0) {
        alert(`Game Over! Score: ${player.score}`);

        // Save score to backend
        fetch("http://localhost:5000/save-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "Player1", score: player.score }),
        });

        player.lives = 10;
        player.level = 1;
        player.score = 0;
        ResetBall(ballObj, canvas, paddleProps);
        bricks.length = 0;

        // Refresh leaderboard
        fetch("http://localhost:5000/leaderboard")
          .then((res) => res.json())
          .then((data) => setLeaderboard(data));
      }

      // Ball and Wall Collision
      WallCollision(ballObj, canvas, player, paddleProps);

      // Brick Collision
      let brickCollision;
      for (let i = 0; i < bricks.length; i++) {
        brickCollision = BrickCollision(ballObj, bricks[i]);

        if (brickCollision.hit && !bricks[i].broke) {
          if (brickCollision.axis === "X") {
            ballObj.dx *= -1;
            bricks[i].broke = true;
          } else if (brickCollision.axis === "Y") {
            ballObj.dy *= -1;
            bricks[i].broke = true;
          }
          player.score += 10;
        }
      }
      Paddle(ctx, canvas, paddleProps);

      // Paddle + Ball Collision
      PaddleHit(ballObj, paddleProps);

      requestAnimationFrame(render);
    };
    render();
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <canvas
        id="canvas"
        ref={canvasRef}
        onMouseMove={(event) =>
          (paddleProps.x =
            event.clientX -
            (window.innerWidth < 900 ? 10 : (window.innerWidth * 20) / 200) -
            paddleProps.width / 2 -
            10)
        }
        height="500"
        width={
          window.innerWidth < 900
            ? window.innerWidth - 20
            : window.innerWidth - (window.innerWidth * 20) / 100
        }
      />
      
      {/* Leaderboard Section */}
      <div style={{ marginTop: "20px" }}>
        <h2>🏆 Leaderboard</h2>
        <ul>
          {leaderboard.map((entry, index) => (
            <li key={index}>
              {index + 1}. {entry.username}: {entry.score} points
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
