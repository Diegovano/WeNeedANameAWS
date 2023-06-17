import React, { useEffect, useRef } from 'react';


export function draw(ctx, coordinates) {
    console.log("attempting to draw");
    ctx.fillStyle = 'green';
    coordinates.forEach((coordinate) => {
        ctx.beginPath();
        ctx.arc(coordinate.x, coordinate.y, 2, 0, 2 * Math.PI);
        ctx.fill();
    });
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
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(240, 360, 8, 0, 2 * Math.PI);
    ctx.fill();

};




export function useCanvas(coordData, canvasWidth, canvasHeight) {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvasObj = canvasRef.current;
        if (canvasObj) {
            const ctx = canvasObj.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                draw(ctx, coordData);
                // Draw lines between consecutive points
                ctx.beginPath();
                ctx.strokeStyle = "purple";
                ctx.lineWidth = 2;
                for (let i = 0; i < coordData.length - 1; i++) {
                    const startPoint = coordData[i];
                    const endPoint = coordData[i + 1];
                    ctx.moveTo(startPoint.x, startPoint.y);
                    ctx.lineTo(endPoint.x, endPoint.y);
                }
                ctx.stroke();
            } else {
                console.log("getContext() returned null");
            }
        } else {
            console.log("canvasRef.current is null");
        }
    }, [coordData, canvasWidth, canvasHeight]);

    return canvasRef;
}





