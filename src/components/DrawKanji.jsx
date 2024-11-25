import { useRef, useEffect, useState, useMemo } from 'react';

function DrawKanji() {
  const canvas1Ref = useRef(null);
  const canvas2Ref = useRef(null);
  const [ctx1, setCtx1] = useState(null);
  const [ctx2, setCtx2] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [accuracy, setAccuracy] = useState('N/A');
  const [currentColor, setCurrentColor] = useState('#000000');
  
  const stroke = 16;
  const trainingString = "日本語";
  
  const originRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const lastRef = useRef({ x: 0, y: 0 });
  const offscreenRef = useRef(null);
  const offscreenCtxRef = useRef(null);
  const directionHistoryRef = useRef([]);
  const lastTimeRef = useRef(Date.now());

  const updateDirectionHistory = (dx, dy) => {
    const currentTime = Date.now();
    const timeDelta = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
    lastTimeRef.current = currentTime;

    // Calculate current angle in degrees
    const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Normalize angle to 0-360 range
    const normalizedAngle = (currentAngle + 360) % 360;

    // Add new direction with timestamp
    directionHistoryRef.current.push({
      angle: normalizedAngle,
      timestamp: currentTime,
      weight: Math.min(1, timeDelta) // Weight based on time delta, max 1
    });

    // Keep only last 10 points
    if (directionHistoryRef.current.length > 10) {
      directionHistoryRef.current.shift();
    }
  };

  const getWeightedDirection = () => {
    if (directionHistoryRef.current.length === 0) return null;

    const currentTime = Date.now();
    let xComponent = 0;
    let yComponent = 0;
    let totalWeight = 0;

    directionHistoryRef.current.forEach((point, index) => {
      // Exponential decay based on time difference
      const timeDiff = (currentTime - point.timestamp) / 1000; // Convert to seconds
      const decay = Math.exp(-timeDiff * 2); // Decay factor
      const weight = decay * point.weight;

      // Convert angle to radians
      const angleRad = point.angle * (Math.PI / 180);
      
      // Add weighted components
      xComponent += Math.cos(angleRad) * weight;
      yComponent += Math.sin(angleRad) * weight;
      totalWeight += weight;
    });

    if (totalWeight === 0) return null;

    // Calculate weighted average angle
    const averageAngle = Math.atan2(yComponent / totalWeight, xComponent / totalWeight);
    return (averageAngle * 180 / Math.PI + 360) % 360;
  };

  const straightenLine = (current, last, origin) => {
    const dx = current.x - last.x;
    const dy = current.y - last.y;
    
    // Update direction history
    updateDirectionHistory(dx, dy);
    
    // Get weighted average direction
    const avgDirection = getWeightedDirection();
    if (avgDirection === null) return current;

    // Calculate the distance from the start of the current stroke
    const totalDx = current.x - origin.x;
    const totalDy = current.y - origin.y;
    const strokeLength = Math.sqrt(totalDx * totalDx + totalDy * totalDy);

    // Only apply straightening if the stroke is long enough
    if (strokeLength > 20) {
      const straighteningForce = Math.min(0.4, strokeLength / 400); // Increases with stroke length, max 0.4
      
      // Convert average direction to radians
      const avgRadians = avgDirection * (Math.PI / 180);
      
      // Calculate ideal position based on average direction
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      const idealX = last.x + magnitude * Math.cos(avgRadians);
      const idealY = last.y + magnitude * Math.sin(avgRadians);

      // Blend between actual and ideal positions
      return {
        x: idealX * straighteningForce + current.x * (1 - straighteningForce),
        y: idealY * straighteningForce + current.y * (1 - straighteningForce)
      };
    }

    return current;
  };

  const getMousePos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const adjust = (p) => {
    if (!offscreenCtxRef.current || !offscreenRef.current) return p;

    const imageData = offscreenCtxRef.current.getImageData(
      Math.max(0, p.x - stroke),
      Math.max(0, p.y - stroke),
      stroke * 2,
      stroke * 2
    );
    const data = imageData.data;

    let count = 0;
    let xsum = 0;
    let ysum = 0;
    const radius = stroke * stroke;

    for (let y = 0; y < stroke * 2; y++) {
      const dy = y - stroke;
      for (let x = 0; x < stroke * 2; x++) {
        const dx = x - stroke;
        if (dx * dx + dy * dy <= radius) {
          const i = (y * stroke * 2 + x) * 4;
          if (data[i] === 0) {
            count++;
            xsum += x + p.x - stroke;
            ysum += y + p.y - stroke;
          }
        }
      }
    }

    if (count < 1) return p;

    const magnetStrength = 0.9;
    const newX = (xsum / count) * magnetStrength + p.x * (1 - magnetStrength);
    const newY = (ysum / count) * magnetStrength + p.y * (1 - magnetStrength);

    const magnetizedPoint = {
      x: newX,
      y: newY
    };

    // Apply straightening if we're drawing and have a last point
    if (isDrawing && lastRef.current) {
      return straightenLine(magnetizedPoint, lastRef.current, originRef.current);
    }

    return magnetizedPoint;
  };

  const brezLine = (x1, y1, x2, y2, ctx) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = currentColor;
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const pos = getMousePos(e, canvas1Ref.current);
    const adjustedPos = adjust(pos);
    originRef.current = adjustedPos;
    currentRef.current = adjustedPos;
    lastRef.current = adjustedPos;
    // Clear direction history on new stroke
    directionHistoryRef.current = [];
    lastTimeRef.current = Date.now();
    draw(e);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    
    lastRef.current = { ...currentRef.current };
    const pos = getMousePos(e, canvas1Ref.current);
    
    // First apply magnetization
    const magnetizedPos = adjust(pos);
    
    // Then apply straightening to the magnetized position
    const straightenedPos = straightenLine(magnetizedPos, lastRef.current, originRef.current);
    
    // Apply final smoothing
    const smoothing = 0.4;
    currentRef.current = {
      x: straightenedPos.x * (1 - smoothing) + lastRef.current.x * smoothing,
      y: straightenedPos.y * (1 - smoothing) + lastRef.current.y * smoothing
    };
    
    draw(e);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    compare();
    if (ctx2) {
      ctx2.clearRect(0, 0, canvas2Ref.current.width, canvas2Ref.current.height);
    }
  };

  const draw = (e) => {
    if (!ctx1 || !ctx2) return;

    const p = getMousePos(e, canvas1Ref.current);
    const adjustedP = adjust(p);
    
    if (isDrawing && lastRef.current) {
      brezLine(
        lastRef.current.x,
        lastRef.current.y,
        adjustedP.x,
        adjustedP.y,
        ctx1
      );
    } else {
      ctx2.clearRect(0, 0, canvas2Ref.current.width, canvas2Ref.current.height);
      brezLine(adjustedP.x, adjustedP.y, adjustedP.x, adjustedP.y, ctx2);
    }
  };

  const compare = () => {
    if (!ctx1) return;

    const offscreen = new OffscreenCanvas(canvas1Ref.current.width, canvas1Ref.current.height);
    const ctx = offscreen.getContext('2d');
    
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);

    const fontSize = 200;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "black";
    ctx.fillText(trainingString, 0, fontSize);

    const imageData = ctx1.getImageData(0, 0, canvas1Ref.current.width, canvas1Ref.current.height);
    const data = imageData.data;

    const imageData2 = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
    const data2 = imageData2.data;

    let diff = 0;
    let max = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      if(data[i] * data2[i] < data[i] + data2[i]) {
        diff++;
      }
      if(data2[i] < 0xff) {
        max++;
      }
    }

    let accuracyValue = Math.min(Math.max(1.0 - diff / max, 0.0), 1.0);
    accuracyValue = smoothstep(smoothstep(accuracyValue));
    setAccuracy(`${Math.ceil(100.0 * accuracyValue)}%`);
  };

  const smoothstep = (x) => {
    return 3.0 * Math.pow(x, 2) - 2.0 * Math.pow(x, 3);
  };

  const clearCanvas = () => {
    if (!ctx1) return;
    
    ctx1.fillStyle = "white";
    ctx1.fillRect(0, 0, canvas1Ref.current.width, canvas1Ref.current.height);

    const fontSize = 200;
    ctx1.font = `${fontSize}px Arial`;
    ctx1.fillStyle = "lightgray";
    ctx1.fillText(trainingString, 0, fontSize);
    
    setAccuracy('N/A');
  };

  // Create and setup offscreen canvas once
  useEffect(() => {
    offscreenRef.current = new OffscreenCanvas(600, 600);
    const ctx = offscreenRef.current.getContext('2d');
    
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 600, 600);

    const fontSize = 200;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "black";
    ctx.fillText(trainingString, 0, fontSize);
    
    offscreenCtxRef.current = ctx;
  }, []);

  useEffect(() => {
    const canvas1 = canvas1Ref.current;
    const canvas2 = canvas2Ref.current;
    const context1 = canvas1.getContext('2d', { willReadFrequently: true });
    const context2 = canvas2.getContext('2d', { willReadFrequently: true });

    setCtx1(context1);
    setCtx2(context2);

    const updateCanvasSize = () => {
      canvas1.width = canvas2.width = 600;
      canvas1.height = canvas2.height = 600;

      context1.fillStyle = "white";
      context1.fillRect(0, 0, 600, 600);

      const fontSize = 200;
      context1.font = `${fontSize}px Arial`;
      context1.fillStyle = "lightgray";
      context1.fillText(trainingString, 0, fontSize);

      // Set initial canvas style
      context1.lineWidth = stroke;
      context1.lineCap = 'round';
      context1.lineJoin = 'round';
      context2.lineWidth = stroke;
      context2.lineCap = 'round';
      context2.lineJoin = 'round';
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  return (
    <div className="draw-kanji-container">
      <div className="draw-kanji-header">
        <h1>Draw Kanji</h1>
        <p>Accuracy: {accuracy}</p>
      </div>
      
      <div className="drawing-tools">
        <div className="brush-settings">
          <div className="tool-group">
            <label>Color</label>
            <input 
              type="color" 
              value={currentColor} 
              onChange={(e) => setCurrentColor(e.target.value)}
            />
          </div>
        </div>
        <button onClick={clearCanvas} className="clear-button">
          Clear Canvas
        </button>
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvas1Ref}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseOut={handleMouseUp}
        />
        <canvas
          ref={canvas2Ref}
          style={{ position: 'absolute', pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}

export default DrawKanji;
