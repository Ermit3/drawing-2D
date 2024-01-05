import { useState } from "react";

function useDraw({ canvasRef, isDrawing, pos, setPosition, upDrawing }) {
  const [lineWidth, setLineWidth] = useState(5);
  const [lineCap, setLineCap] = useState("round");
  const [color, setColor] = useState("#c0392b");
  const [type, setType] = useState("line");

  const _canvaContext = () => {
    return canvasRef.current.getContext("2d");
  };

  /**
   * @description Fonction qui permet de dessiner des formes
   */
  const drawing = (e, tool, prevPos, snapshot) => {
    // Met à jour la position du curseur tout le temps
    setPosition(e);
    if (!isDrawing || upDrawing) return;
    // Set le type d'outil
    setType(tool);

    // Le contexte du canvas
    const ctx = _canvaContext();

    // Paramètres du dessin
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    ctx.strokeStyle = color;

    if (tool === "rectangle") {
      ctx.putImageData(snapshot, 0, 0);
      ctx.strokeRect(pos.x, pos.y, prevPos.x - pos.x, prevPos.y - pos.y);
    } else if (tool === "line") {
      ctx.putImageData(snapshot, 0, 0);
      ctx.moveTo(prevPos.x, prevPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
    }
  };

  /**
   * @description Fonction qui permet de mettre à jour le dessin
   */
  const updateDrawing = (tool, shape, snapshot) => {
    if (!isDrawing || tool !== "selector" || !upDrawing) return;
    // Le contexte du canvas
    const ctx = _canvaContext();

    // Paramètres du dessin
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    ctx.strokeStyle = color;

    setType(tool);

    if (shape.type === "rectangle") {
      ctx.putImageData(snapshot, 0, 0);
      ctx.strokeRect(
        pos.x,
        pos.y,
        shape.firstPoint.x - pos.x,
        shape.firstPoint.y - pos.y
      );
    } else if (shape.type === "line") {
      ctx.putImageData(snapshot, 0, 0);
      ctx.moveTo(shape.firstPoint.x, shape.firstPoint.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
    }
  };

  return {
    drawing,
    lineCap,
    setLineCap,
    lineWidth,
    setLineWidth,
    color,
    setColor,
    type,
    updateDrawing,
  };
}

export default useDraw;
