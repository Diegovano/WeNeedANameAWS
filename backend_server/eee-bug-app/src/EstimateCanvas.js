import React, { useEffect, useRef } from 'react';

export function drawEstimate(ctx, data) {
  console.log("attempting to draw");
  ctx.setLineDash([2, 4]);
  ctx.strokeStyle = 'purple';

  // Add blue dot at (0, 0)
  ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, 2 * Math.PI);
  ctx.fill();

  // Add red dot at (0, 360)
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(0, 360, 8, 0, 2 * Math.PI);
  ctx.fill();

  // Add yellow dot at (240, 360)
  ctx.fillStyle = 'orange';
  ctx.beginPath();
  ctx.arc(240, 360, 8, 0, 2 * Math.PI);
  ctx.fill();

  let currentX = 0;
  let currentY = 0;
  let currentHeading = 0;

  for (const { steps, heading } of data) {
    if (heading !== currentHeading) {
      ctx.beginPath();
      ctx.arc(currentX, currentY, 2, 0, 2 * Math.PI);
      ctx.fill();
    }

    const deltaY = Math.sin((currentHeading + heading)) * steps;
    const deltaX = Math.cos((currentHeading + heading)) * steps;

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
};

export function useEstimateCanvas(data, canvasWidth, canvasHeight) {
  const canvasRefEstimate = useRef(null);

  useEffect(() => {
    const canvasObj = canvasRefEstimate.current;
    if (canvasObj) {
      const ctx = canvasObj.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        drawEstimate(ctx, data);
      } else {
        console.log('getContext() returned null');
      }
    } else {
      console.log('canvasRefEstimate.current is null');
    }
  }, [data, canvasWidth, canvasHeight]);

  return canvasRefEstimate;
}