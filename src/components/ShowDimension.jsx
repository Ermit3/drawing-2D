const ShowDimension = ({ localShape }) => {
  return (
    <div className="dimension">
      {!localShape.empty ? (
        <>
          {localShape.type === "rectangle" ? (
            <>
              Longueur : {JSON.stringify(localShape.dimension.width)} / Largeur
              : {JSON.stringify(localShape.dimension.height)}
            </>
          ) : (
            <>
              Pixel : {JSON.stringify(localShape.dimension.pixel)} / cm :{" "}
              {JSON.stringify(localShape.dimension.cm)}
            </>
          )}
        </>
      ) : (
        <>50 pixels ≃ 1 centimètre</>
      )}
    </div>
  );
};

export default ShowDimension;
