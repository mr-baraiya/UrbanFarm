import React from 'react';
import TomatoPlantSVG from './TomatoPlantSVG';

/**
 * TomatoPlant3D - Backward compatibility wrapper delegating to TomatoPlantSVG.
 * Replaced heavy Three.js canvas with lightweight, performant, interactive SVG.
 */
const TomatoPlant3D = (props) => {
  return <TomatoPlantSVG {...props} />;
};

export default TomatoPlant3D;
export { TomatoPlantSVG };
