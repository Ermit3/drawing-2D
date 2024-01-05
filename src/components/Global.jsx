import { createContext, useContext, useState } from "react";

const CurrentShapeContext = createContext();

export const useCurrentShapeContext = () => {
  return useContext(CurrentShapeContext);
};

export const CurrentShapeProvider = ({ children }) => {
  const [currentShape, _setCurrentShape] = useState({});
  const [shapesInfo, _setShapesInfo] = useState([]);
  const [shapesRaw, _setShapesRaw] = useState([]);
  const [index, _setIndex] = useState(-1);
  const [historic, _setHistoric] = useState([]);
  const [redoHistory, _setRedoHistory] = useState([]);

  const setCurrentShape = (shape) => {
    _setCurrentShape(shape);
  };
  const setShapesInfo = (shapes) => {
    _setShapesInfo(shapes);
  };
  const setShapesRaw = (shapes) => {
    _setShapesRaw(shapes);
  };
  const setIndex = (num) => {
    _setIndex(num);
  };
  const setHistoric = (shapes) => {
    _setHistoric(shapes);
  };
  const setRedoHistory = (shapes) => {
    _setRedoHistory(shapes);
  };

  return (
    <CurrentShapeContext.Provider
      value={{
        currentShape,
        setCurrentShape,
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
      }}
    >
      {children}
    </CurrentShapeContext.Provider>
  );
};
