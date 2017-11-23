"use strict";

function main() {
  var video = document.getElementById("source_video");
  video.addEventListener("loadeddata", function() {
    var renderer = new Renderer(video);
    renderer.setup();
    renderer.drawVideo();
  });
}

function Renderer(videoElement) {
  var video = videoElement;
  var tempCanvas;
  var tempCanvasContext;
  var canvas;
  var gl;

  var positionLocation;
  var texcoordLocation;
  var resolutionLocation;

  var positionBuffer;
  var texcoordBuffer;
  var texture;

  var self = this;


  self.setup = function() {
    // Get A WebGL context
    canvas = document.getElementById("canvas");

    gl = canvas.getContext("webgl");
    tempCanvas = document.getElementById("tempCanvas");
    tempCanvasContext = tempCanvas.getContext("2d");

    if (!gl) {
      throw new Error("WebGL not supported");
    }

    var program = webglUtils.createProgramFromScripts(gl, ["2d-vertex-shader", "2d-fragment-shader"]);
    gl.useProgram(program);

    positionLocation   = gl.getAttribLocation(program, "a_position");
    texcoordLocation   = gl.getAttribLocation(program, "a_texCoord");
    resolutionLocation = gl.getUniformLocation(program, "u_resolution");

    positionBuffer = gl.createBuffer();
    texcoordBuffer = gl.createBuffer();
    
    // Create a texture.
    texture = gl.createTexture();

    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(texcoordLocation);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

  };


  self.drawVideo = function() {
    render();
    requestAnimationFrame(self.drawVideo);
  };

  function render() {
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    tempCanvasContext.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);

    setPositionData();
    setTextureCoordinates();

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
  };

  function setPositionData() {
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    bufferPositionData(0, 0, canvas.clientWidth, canvas.clientHeight);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);
  }

  function setTextureCoordinates() {
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    bufferTextureCoordinateData();

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        texcoordLocation, size, type, normalize, stride, offset);
  }

  function bufferPositionData(x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
       x1, y1,   // start of 1st triangle
       x2, y1,
       x1, y2,    
       x1, y2,   // start of 2nd triangle
       x2, y1,
       x2, y2,
    ]), gl.STATIC_DRAW);
  }

  function bufferTextureCoordinateData() {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0,
    ]), gl.STATIC_DRAW);
  }

}

main();

