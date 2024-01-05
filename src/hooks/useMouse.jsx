import { useState } from "react";
import useStore from "./useStore";
import useMath from "./useMath";

function useMouse({
  canvasRef,
  setIsDrawing,
  isDragging,
  setIsDragging,
  width,
  height,
  selectedTool,
  upDrawing,
  setUpDrawing,
  localShape,
  setLocalShape,
  isMouseDown,
  setUseCursor,
}) {
  const [positions, setPosition] = useState({});
  const [prevPos, setPrevPos] = useState({});
  const [snapshot, setSnapshot] = useState(null);

  const { addShape, updateShape, dragShape } = useStore({
    canvasRef,
    width,
    height,
  });

  const { distancePointToLine } = useMath();

  /**
   * @description Initialise le contexte du canvas
   */
  const _canvaContext = () => {
    return canvasRef.current.getContext("2d");
  };

  // Partie 1
  /**
   * @description Fonction privée qui permet de mettre à jour la position du curseur
   */
  const _setPosition = (e) => {
    if (!e) return;
    // Je récupère les dimensions du canvas
    const bounds = canvasRef.current.getBoundingClientRect();
    // Je met à jour la position du curseur
    setPosition({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });
  };

  /**
   * @description Fonction qui permet de commencer le dessin
   */
  const startPosition = () => {
    setIsDrawing(true);
    setPrevPos(positions);
    // Un context pour sauvegarder l'image du canvas
    setSnapshot(_canvaContext().getImageData(0, 0, width, height));
  };

  /**
   * @description Fonction qui permet de finaliser le dessin
   */
  const finishedPosition = ({
    type,
    color,
    size: lineWidth,
    prevPos,
    position: pos,
  }) => {
    setIsDrawing(false);
    if (selectedTool === "selector" && upDrawing) {
      updateShape({ shape: localShape, position: pos, dragged: false });
    } else if (selectedTool === "selector" && isDragging) {
      updateShape({ shape: localShape, position: pos, dragged: true });
    }

    setUpDrawing(false);
    setIsDragging(false);

    if (selectedTool !== "selector") {
      addShape({ type, color, size: lineWidth, prevPos, position: pos });
    }
    // Un context pour éviter que les formes se connectent
    _canvaContext().beginPath();
  };

  // Partie 2
  /**
   * @description Fonction privée qui permet de savoir si la souris est dans une forme
   */
  const _isMouseInsideRectangle = ({ pos, shape }) => {
    // Evite que les bordures soient sélectionnées grace au - size
    if (shape.type === "rectangle") {
      if (
        (pos.x >= shape.firstPoint.x - shape.size &&
          pos.x <= shape.lastPoint.x - shape.size &&
          pos.y >= shape.firstPoint.y - shape.size &&
          pos.y <= shape.lastPoint.y - shape.size) ||
        (pos.x >= shape.lastPoint.x - shape.size &&
          pos.x <= shape.firstPoint.x - shape.size &&
          pos.y >= shape.lastPoint.y - shape.size &&
          pos.y <= shape.firstPoint.y - shape.size)
      ) {
        return true;
      }
    } else if (shape.type === "line") {
      const distance = distancePointToLine(
        pos.x,
        pos.y,
        shape.firstPoint.x,
        shape.firstPoint.y,
        shape.lastPoint.x,
        shape.lastPoint.y
      );
      if (distance < shape.size) {
        return true;
      }
    }
    return false;
  };

  /**
   * @description Fonction privée qui permet de savoir si la souris est proche d'un point
   */
  const _nearPoint = ({ pos, shape }) => {
    let pixel = 4;
    if (
      pos.x >= shape.lastPoint.x - pixel &&
      pos.x <= shape.lastPoint.x + pixel &&
      pos.y >= shape.lastPoint.y - pixel &&
      pos.y <= shape.lastPoint.y + pixel
    ) {
      return true;
    }
    return false;
  };

  const _setCurrentShape = (shape) => {
    setLocalShape(shape);
  };

  /**
   * @description Fonction qui permet de savoir si la souris est proche un point
   */
  const closePoint = ({ shapes }) => {
    for (let shape of shapes) {
      if (_nearPoint({ pos: positions, shape })) {
        _setCurrentShape(shape);
        setUseCursor("grab");
        if (isMouseDown) {
          setUpDrawing(true);
        }
        return true;
      }
    }
    setUseCursor("pointer");
    return false;
  };

  /**
   * @description Fonction qui permet de savoir si la souris est sur une forme
   */
  const onShape = ({ shapes }) => {
    for (let shape of shapes) {
      if (
        _isMouseInsideRectangle({ pos: positions, shape }) &&
        !_nearPoint({ pos: positions, shape })
      ) {
        setIsDragging(true);
        _setCurrentShape(shape);
        setUseCursor("grabbing");
        return true;
      }
    }
    setUseCursor("pointer");
    return false;
  };

  /**
   * @description Fonction qui permet de déplacer une forme
   */
  const onDrag = ({ pos, prevPos }) => {
    let dx = pos.x - prevPos.x;
    let dy = pos.y - prevPos.y;
    dragShape({ shape: localShape, dx, dy });
  };

  return {
    pos: positions,
    setPos: _setPosition,
    startPosition,
    finishedPosition,
    prevPos,
    snapshot,
    onShape,
    onDrag,
    closePoint,
  };
}

export default useMouse;
