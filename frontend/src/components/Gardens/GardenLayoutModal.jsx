import React, { useState } from 'react';
import { RiLayoutMasonryLine, RiCloseLine } from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { updateGarden } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import './GardenLayoutModal.css';

const GardenLayoutModal = ({ garden, onClose, onGardenUpdated }) => {
  const gridRows = 4;
  const gridCols = 4;
  
  // Existing plants inside garden
  const plants = garden.plants || [];

  // Map plants to grid positions or default slots
  const [layoutMap, setLayoutMap] = useState(() => {
    const initial = {};
    plants.forEach((p, idx) => {
      const row = Math.floor(idx / gridCols);
      const col = idx % gridCols;
      if (row < gridRows) {
        initial[`${row}-${col}`] = p;
      }
    });
    return initial;
  });

  const [selectedCell, setSelectedCell] = useState(null);
  const { addNotification } = useNotification();

  const totalCells = gridRows * gridCols;
  const occupiedCount = Object.keys(layoutMap).length;
  const occupancyPercentage = Math.round((occupiedCount / totalCells) * 100);
  const totalSizeM2 = garden.size || 10;
  const usedSizeM2 = ((occupiedCount / totalCells) * totalSizeM2).toFixed(1);

  const handleCellClick = (row, col) => {
    const key = `${row}-${col}`;
    setSelectedCell({ row, col, plant: layoutMap[key] });
  };

  const handleSaveLayout = () => {
    addNotification('Garden space layout saved successfully!', 'success');
    if (onGardenUpdated) onGardenUpdated();
    onClose();
  };

  return (
    <div className="layout-modal-overlay" onClick={onClose}>
      <div className="layout-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="layout-modal-header">
          <h3>
            <RiLayoutMasonryLine className="layout-header-icon" /> Garden Layout & Space Planner - {garden.name}
          </h3>
          <button className="layout-close-btn" onClick={onClose} aria-label="Close">
            <RiCloseLine />
          </button>
        </div>

        <div className="layout-modal-body">
          {/* Space Stats Bar */}
          <div className="layout-stats-bar">
            <div className="layout-stat">
              <span className="stat-label">Total Size:</span>
              <span className="stat-value">{totalSizeM2} m²</span>
            </div>
            <div className="layout-stat">
              <span className="stat-label">Occupied Area:</span>
              <span className="stat-value">{usedSizeM2} m² ({occupancyPercentage}%)</span>
            </div>
            <div className="layout-stat">
              <span className="stat-label">Free Slots:</span>
              <span className="stat-value">{totalCells - occupiedCount} plots</span>
            </div>
          </div>

          <div className="layout-instructions">
            Click on grid plots to inspect assigned plants or optimize space allocation.
          </div>

          {/* Grid Visualizer */}
          <div className="grid-container">
            {Array.from({ length: gridRows }).map((_, r) => (
              <div key={r} className="grid-row">
                {Array.from({ length: gridCols }).map((_, c) => {
                  const key = `${r}-${c}`;
                  const plant = layoutMap[key];
                  const isSelected = selectedCell?.row === r && selectedCell?.col === c;

                  return (
                    <div
                      key={c}
                      className={`grid-cell ${plant ? 'occupied' : 'empty'} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleCellClick(r, c)}
                    >
                      <span className="cell-coords">P{r * gridCols + c + 1}</span>
                      {plant ? (
                        <div className="cell-plant">
                          <TbPlant2 className="cell-plant-svg" />
                          <span className="cell-name">{plant.name}</span>
                        </div>
                      ) : (
                        <span className="cell-plus">+ Free</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Cell Info Panel */}
          {selectedCell && (
            <div className="cell-details-panel">
              <h4>Plot P{selectedCell.row * gridCols + selectedCell.col + 1} Details</h4>
              {selectedCell.plant ? (
                <div className="selected-plant-details">
                  <p><strong>Plant:</strong> {selectedCell.plant.name}</p>
                  {selectedCell.plant.variety && <p><strong>Variety:</strong> {selectedCell.plant.variety}</p>}
                  <p><strong>Health:</strong> {selectedCell.plant.health || 'Healthy'}</p>
                  <p><strong>Status:</strong> {selectedCell.plant.status || 'Growing'}</p>
                </div>
              ) : (
                <p className="empty-plot-text">
                  This plot is currently vacant. You can plant new crops or seedlings here to maximize yield!
                </p>
              )}
            </div>
          )}

          <div className="layout-modal-actions">
            <button className="btn-secondary" onClick={onClose}>Close</button>
            <button className="btn-primary" onClick={handleSaveLayout}>Save Layout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardenLayoutModal;
