function useGrid({ layerZero, isGrid }) {
  const grid = () => {
    if (!layerZero) return;
    const canvas = layerZero.current;
    const ctx = canvas.getContext("2d");
    if (!isGrid) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000";
      // Créer ligne horizontale
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      // Créer ligne verticale
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();
    } else {
      // Nettoie le canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return { grid };
}

export default useGrid;
