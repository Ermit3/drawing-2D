function useMath() {
  /**
   * @description Fonction qui permet de calculer la largeur et la hauteur d'un rectangle
   */
  const calculateWidthHeight = (x1, y1, x2, y2) => {
    let width = Math.abs(x1 - x2);
    let height = Math.abs(y1 - y2);
    // Si x1 est plus petit que x2, alors width = width, sinon width = -width
    width = x1 < x2 ? width : -width;
    height = y1 < y2 ? height : -height;
    return { width, height };
  };

  /**
   * @description Fonction qui permet de calculer la distance entre deux points
   */
  const calculateDistance = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /**
   * @description Fonction qui permet de calculer la distance entre le curseur et une ligne
   */
  const distancePointToLine = (x, y, x1, y1, x2, y2) => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  return { calculateWidthHeight, calculateDistance, distancePointToLine };
}

export default useMath;
