const Grid = ({ layerZero, width, height }) => {
  return (
    <canvas
      ref={layerZero}
      className="canvas z-0"
      width={width}
      height={height}
    />
  );
};

export default Grid;
