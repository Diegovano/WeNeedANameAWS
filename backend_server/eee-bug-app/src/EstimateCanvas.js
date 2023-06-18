import React, { useEffect, useRef } from 'react';

export function draw(ctx, data) {
  console.log("attempting to draw");
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setLineDash([2, 4]);
  ctx.strokeStyle = 'purple';

  let currentX = 0;
  let currentY = 0;
  let currentHeading = 0;

  for (const { steps, heading } of data) {
    if (heading !== currentHeading) {
      ctx.beginPath();
      ctx.arc(currentX, currentY, 2, 0, 2 * Math.PI);
      ctx.fill();
    }

    const deltaY = Math.sin((currentHeading + heading) * (Math.PI / 180)) * steps;
    const deltaX = Math.cos((currentHeading + heading) * (Math.PI / 180)) * steps;

    const newX = currentX + deltaX;
    const newY = currentY + deltaY;

    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    ctx.lineTo(newX, newY);
    ctx.stroke();

    currentX = newX;
    currentY = newY;
    currentHeading += heading;
  }
}

export function useEstimateCanvas(data, canvasWidth, canvasHeight) {
  const canvasRefEstimate = useRef(null);

  useEffect(() => {
    const canvasObj = canvasRefEstimate.current;
    if (canvasObj) {
      const ctx = canvasObj.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        draw(ctx, data);
      } else {
        console.log('getContext() returned null');
      }
    } else {
      console.log('canvasRef.current is null');
    }
  }, [data, canvasWidth, canvasHeight]);

  return canvasRefEstimate;
}