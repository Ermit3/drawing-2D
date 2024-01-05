import { useRef, useState } from "react";

import useDraw from "../hooks/useDraw";
import useGrid from "../hooks/useGrid";
import useMouse from "../hooks/useMouse";
import useStore from "../hooks/useStore";

import { useCurrentShapeContext } from "./Global";

import Rectangle from "../icons/Rectangle";
import Clear from "../icons/Clear";
import Undo from "../icons/Undo";
import Redo from "../icons/Redo";
import Line from "../icons/Line";
import Selector from "../icons/Selector";
import ShowDimension from "./ShowDimension";
import Grid from "./Grid";

function Canvas({ width, height }) {
  const { shapesInfo, historic, redoHistory } = useCurrentShapeContext();

  const layerZero = useRef(null);
  const canvasRef = useRef(null);
  const [isGrid, setIsGrid] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTool, setSelectedTool] = useState("rectangle");
  const [upDrawing, setUpDrawing] = useState(false);
  const [localShape, setLocalShape] = useState({ empty: true });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [useCursor, setUseCursor] = useState("pointer");
  const [isStylesUpdateShape, setIsStylesUpdateShape] = useState(false);

  // Hook personnalisé
  const {
    pos,
    setPos,
    startPosition,
    finishedPosition,
    prevPos,
    snapshot,
    onShape,
    onDrag,
    closePoint,
  } = useMouse({
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
  });
  const { drawing, lineWidth, color, type, updateDrawing } = useDraw({
    canvasRef,
    isDrawing,
    pos,
    setPosition: setPos,
    upDrawing,
  });
  const { clearCanvas, undoLast, redoLast, styleUpdate, styleUpdateShape } =
    useStore({
      canvasRef,
      width,
      height,
    });
  const { grid } = useGrid({ layerZero, isGrid });

  const toolSelect = (tool) => {
    setSelectedTool(tool);
  };

  const onMouseMove = (e) => {
    setPos(e);
    if (selectedTool !== "selector") {
      drawing(e, selectedTool, prevPos, snapshot);
    } else if (isDragging) {
      onDrag({ pos, prevPos, shapes: shapesInfo });
    } else if (selectedTool === "selector") {
      updateDrawing(selectedTool, localShape, snapshot);
      closePoint({ shapes: shapesInfo });
    }
  };

  const onMouseDown = (e) => {
    setPos(e);
    startPosition(e);
    setIsMouseDown(true);
    onShape({ shapes: shapesInfo });
  };

  const onMouseUp = (e) => {
    finishedPosition({
      type,
      color,
      size: lineWidth,
      prevPos,
      position: pos,
    });
    setIsMouseDown(false);
  };

  const onMouseEnter = (e) => {
    setPos(e);
    if (isStylesUpdateShape) {
      const update = styleUpdateShape({ isStylesUpdateShape });
      if (update) setIsStylesUpdateShape(false);
      return;
    }
  };

  const onChangeColorInput = ({ shape, color }) => {
    styleUpdate({ shape, color, size: shape.size });
    setIsStylesUpdateShape(true);
  };

  const onChangeSizeInput = ({ shape, size }) => {
    styleUpdate({ shape, color: shape.color, size });
    setIsStylesUpdateShape(true);
  };

  return (
    <>
      <div className="container">
        <div className="z-20">
          <div className="gridBtn">
            <div>
              <input
                type="checkbox"
                checked={isGrid}
                onChange={() => {
                  setIsGrid(!isGrid);
                  grid();
                }}
              />
              <label>Grid</label>
            </div>
          </div>
          <div className="box">
            <button onClick={() => toolSelect("rectangle")}>
              <Rectangle />
            </button>
            <button onClick={() => toolSelect("line")}>
              <Line />
            </button>
            <button onClick={() => toolSelect("selector")}>
              <Selector />
            </button>
          </div>
          <div className="box">
            <button onClick={clearCanvas}>
              <Clear />
            </button>
            <button
              onClick={undoLast}
              disabled={historic.length === 0 ? true : false}
            >
              <Undo />
            </button>
            <button
              onClick={redoLast}
              disabled={redoHistory.length === 0 ? true : false}
            >
              <Redo />
            </button>
          </div>
        </div>
        <div style={{ width, height }}>
          <Grid layerZero={layerZero} width={width} height={height} />
          <canvas
            ref={canvasRef}
            className={`canvas z-10 ${
              selectedTool === "selector" && useCursor
            }`}
            onMouseMove={onMouseMove}
            onMouseEnter={onMouseEnter}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            id="canvas"
            width={width}
            height={height}
          ></canvas>
          <ShowDimension localShape={localShape} />
        </div>
        <div className="box-shapes">
          {shapesInfo.map((shape, i) => {
            return (
              <div key={i} className="shape-info">
                <div className="box-flex">
                  <span>{shape.id}</span>
                  <span>
                    {shape.type.charAt(0).toUpperCase() + shape.type.slice(1)}
                  </span>
                  {shape.type === "line" ? (
                    <>
                      <span>px :{Math.abs(shape.dimension.pixel)}</span>
                      <span>cm :{Math.abs(shape.dimension.cm)}</span>
                    </>
                  ) : (
                    <>
                      <span>L: {Math.abs(shape.dimension.width)}px</span>
                      <span>l: {Math.abs(shape.dimension.height)}px</span>
                    </>
                  )}
                </div>
                <div className="">
                  <span>Size</span>
                  <input
                    type="range"
                    id={`size ${shape.id}`}
                    name={`size ${shape.id}`}
                    min="1"
                    max="5"
                    value={shape.size}
                    step="1"
                    onChange={(e) => {
                      onChangeSizeInput({ shape, size: e.target.value });
                    }}
                  />
                </div>
                <input
                  type="color"
                  name={`color ${shape.id}`}
                  value={shape.color}
                  onChange={(e) =>
                    onChangeColorInput({ shape, color: e.target.value })
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Canvas;
