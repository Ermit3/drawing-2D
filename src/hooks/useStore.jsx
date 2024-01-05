import useMath from "./useMath";
import { useCurrentShapeContext } from "../components/Global";
// Fonction qui gère et stock les formes
function useStore({ canvasRef, width, height }) {
  const {
    shapesInfo,
    setShapesInfo,
    shapesRaw,
    setShapesRaw,
    index,
    setIndex,
    historic,
    setHistoric,
    redoHistory,
    setRedoHistory,
  } = useCurrentShapeContext();

  const { calculateWidthHeight, calculateDistance } = useMath();

  const _canvaContext = () => {
    return canvasRef.current.getContext("2d");
  };

  // Partie 1 : Canvas
  /**
   * @description Fonction qui permet de nettoyer le canvas
   */
  function clearCanvas() {
    if (shapesInfo.length === 0) return;
    const ctx = _canvaContext();

    // Nettoie le canvas
    ctx.clearRect(0, 0, width, height);

    // Réinitialise les tableaux
    if (index < 1) {
      setIndex(-1);
      setShapesRaw([]);
      setShapesInfo([]);
      setHistoric([]);
    } else {
      setIndex(index + 1);
      setShapesInfo([]);
      setHistoric([...historic, []]);
    }
  }

  /**
   * @description Fonction privée qui permet de mettre à jour le canvas
   */
  const _updateCanvas = (shapesInfo) => {
    const ctx = _canvaContext();
    ctx.clearRect(0, 0, width, height);
    // ctx.fillStyle = "#c0392b";

    // Dessine les formes
    shapesInfo.forEach((shape, i) => {
      ctx.lineWidth = shape.size;
      ctx.strokeStyle = shape.color;

      if (shape.type === "line") {
        ctx.moveTo(shape.firstPoint.x, shape.firstPoint.y);
        ctx.lineTo(shape.lastPoint.x, shape.lastPoint.y);
        ctx.stroke();
        _grabber({ position: shape.lastPoint });
      } else if (shape.type === "rectangle") {
        ctx.strokeRect(
          shape.firstPoint.x,
          shape.firstPoint.y,
          shape.dimension.width,
          shape.dimension.height
        );
        _grabber({ position: shape.lastPoint });
      }

      ctx.beginPath();
    });
  };

  // Partie 2 : Historic
  /**
   * @description Fonction qui permet d'annuler la dernière action
   */
  const undoLast = () => {
    if (index < 0) {
      clearCanvas();
    } else {
      setIndex(index - 1);

      setHistoric((prev) => {
        const newHistoric = [...prev]; // copie le tableau
        const lastHistoric = newHistoric[newHistoric.length - 1];
        const secondLastHistoric = newHistoric[newHistoric.length - 2] || [];

        setRedoHistory([...redoHistory, lastHistoric]);

        if (lastHistoric.length !== secondLastHistoric.length) {
          setShapesRaw((prev) => {
            const newShapes = [...prev];
            return newShapes;
          });

          setShapesInfo((prev) => {
            const newShapeInfo = [...prev];
            newShapeInfo.pop();
            return newShapeInfo;
          });
        }

        newHistoric.pop();

        _updateCanvas(newHistoric[newHistoric.length - 1] || []);
        return newHistoric;
      });
    }
  };

  /**
   * @description Fonction qui permet de refaire la dernière action annulée
   */
  const redoLast = () => {
    if (redoHistory.length === 0) return;

    setIndex(index + 1);

    setRedoHistory((prev) => {
      const newRedoHistory = [...prev]; // copie le tableau
      const lastShapesInfo = newRedoHistory[newRedoHistory.length - 1];

      setShapesInfo(lastShapesInfo);
      setHistoric([...historic, lastShapesInfo]);
      _updateCanvas(lastShapesInfo);

      newRedoHistory.pop(); // supprime le dernier élément

      return newRedoHistory;
    });
  };

  // Partie 3 : Formes
  /**
   * @description Fonction privée qui permet de calculer la largeur et la hauteur d'un rectangle ou la longueur d'une ligne
   */
  const _dimension = (type, prevPos, position) => {
    if (!prevPos || !position) return;
    if (type === "rectangle") {
      return calculateWidthHeight(prevPos.x, prevPos.y, position.x, position.y);
    } else {
      const distance = Math.round(
        calculateDistance(prevPos.x, prevPos.y, position.x, position.y)
      );
      return {
        pixel: distance,
        cm: parseFloat((distance / 50).toFixed(2)),
      };
    }
  };

  /**
   * @description Fonction privée qui permet de dessiner un point au lastPoint de la forme
   */
  const _grabber = ({ position }) => {
    const ctx = _canvaContext();
    ctx.beginPath();
    ctx.arc(position.x, position.y, 5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  };

  /**
   * @description Fonction qui permet d'ajouter une forme
   */
  function addShape({ type, color, size, prevPos, position }) {
    const ctx = _canvaContext();

    setShapesRaw([...shapesRaw, ctx.getImageData(0, 0, width, height)]); // ajoute l'image du canvas dans le tableau
    setIndex(index + 1);

    let dimension = _dimension(type, prevPos, position);

    setShapesInfo((prev) => {
      const newShapeInfo = [...prev];
      newShapeInfo.push({
        id: index + 1,
        type,
        color,
        size,
        firstPoint: prevPos,
        lastPoint: position,
        dimension,
      });
      setHistoric([...historic, newShapeInfo]);
      return newShapeInfo;
    });

    setRedoHistory([]);
    _grabber({ position });
  }

  /**
   * @description Fonction qui permet de mettre à jour une forme
   */
  const updateShape = ({ shape, position, dragged }) => {
    let dimension = _dimension(shape.type, shape.firstPoint, position);

    let updatedShapeInfo = shapesInfo.map((shapeInfo) => {
      if (shapeInfo.id === shape.id) {
        if (!dragged) {
          return {
            ...shapeInfo,
            lastPoint: position,
            dimension,
          };
        } else {
          return {
            ...shapeInfo,
            firstPoint: {
              x: shapeInfo.firstPoint.x,
              y: shapeInfo.firstPoint.y,
            },
            lastPoint: {
              x: shapeInfo.lastPoint.x,
              y: shapeInfo.lastPoint.y,
            },
          };
        }
      }
      return shapeInfo;
    });

    setIndex(index + 1);
    setRedoHistory([]);
    setShapesInfo((prev) => {
      const newShapeInfo = updatedShapeInfo;
      setHistoric([...historic, newShapeInfo]);
      return newShapeInfo;
    });

    _updateCanvas(updatedShapeInfo);
  };

  /**
   * @description Fonction qui permet de savoir si la souris est sur une forme
   */
  const styleUpdate = ({ shape, color, size }) => {
    let updatedShapeInfo = shapesInfo.map((shapeInfo) => {
      if (shapeInfo.id === shape.id) {
        return {
          ...shapeInfo,
          color,
          size,
        };
      }
      return shapeInfo;
    });

    setShapesInfo(updatedShapeInfo);
    _updateCanvas(updatedShapeInfo);
  };

  /**
   * @description Fonction qui permet de mettre à jour dans l'historique le style d'une forme
   */
  const styleUpdateShape = ({ isStylesUpdateShape }) => {
    if (!isStylesUpdateShape) return;
    setIndex(index + 1);
    setHistoric([...historic, shapesInfo]);
    setRedoHistory([]);
    return true;
  };

  // Partie 4 : Drag
  /**
   * @description Fonction de mettre à jour les formes déplacées
   */
  const dragShape = ({ shape, dx, dy }) => {
    // Met à jour les coordonnées des points first et last
    let updatedShapeInfo = shapesInfo.map((shapeInfo) => {
      if (shapeInfo.id === shape.id) {
        return {
          ...shapeInfo,
          firstPoint: {
            x: shape.firstPoint.x + dx,
            y: shape.firstPoint.y + dy,
          },
          lastPoint: {
            x: shape.lastPoint.x + dx,
            y: shape.lastPoint.y + dy,
          },
        };
      }
      return shapeInfo;
    });

    setShapesInfo(updatedShapeInfo); // Met à jour le tableau des formes avec les nouvelles coordonnées
    _updateCanvas(updatedShapeInfo); // Met à jour le canvas
  };

  return {
    clearCanvas,
    undoLast,
    addShape,
    dragShape,
    shapesInfo,
    setShapesInfo,
    updateShape,
    redoLast,
    styleUpdate,
    styleUpdateShape,
  };
}

export default useStore;
