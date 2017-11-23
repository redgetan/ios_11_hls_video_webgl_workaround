### Demo

http://redgetan.cc/ios_11_hls_webgl_canvas_workaround

### Description

This shows how to use the temporary canvas 2D API (drawImage) for rendering HLS video via WebGL for iOS 11 . Unoptimized code, mostly for demonstration. Basically, instead of passing a video element to texImage2D, we draw it to a temporary canvas first using `drawImage`, then passing that canvas into WebGL's `texImage2D`

    tempCanvasContext.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);




