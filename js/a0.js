define(["require", "exports", './pointset'], function (require, exports, ps) {
    //------------------
    // Global utility functions.
    // getRandomColor creates a random web color
    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    // a simple wrapper to reliably get the offset within an element  
    // see: http://www.jacklmoore.com/notes/mouse-position/
    function getOffset(e) {
        e = e || window.event;
        var target = e.target || e.srcElement, rect = target.getBoundingClientRect(), offsetX = e.clientX - rect.left, offsetY = e.clientY - rect.top;
        return { x: offsetX, y: offsetY };
    }
    // A class for our application state and functionality
    var Drawing = (function () {
        // constructor for our state object
        function Drawing(canv) {
            var _this = this;
            this.canv = canv;
            // mouse position when we clicked
            this.clickStart = undefined;
            this.clickStart = undefined;
            this.ctx = canv.getContext("2d");
            this.rects = new Array(0); // start with no rects
            this.points = new ps.PointSet();
            canv.onmousedown = function (ev) {
                _this.clickStart = getOffset(ev);
            };
            canv.onmouseup = function (ev) {
                if (_this.clickStart != undefined) {
                    var clickEnd = getOffset(ev);
                    var rect = {
                        p1: _this.clickStart,
                        p2: clickEnd,
                        color: getRandomColor()
                    };
                    _this.rects.push(rect);
                    console.dir(_this.rects);
                    _this.clickStart = undefined;
                }
            };
            canv.onmousemove = function (ev) {
                var m = getOffset(ev);
                _this.mousePosition = m;
            };
            //when mouse goes off canvas
            canv.onmouseout = function (ev) {
                _this.mousePosition = undefined;
                _this.clickStart = undefined;
            };
        }
        // use the animationFrame to do continuous rendering.  Call it once to get things going.
        Drawing.prototype.render = function () {
            var _this = this;
            // Store the current transformation matrix (and other state)
            this.ctx.save();
            // Use the identity matrix while clearing the canvas (just in case you change it someday!)
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.fillStyle = "lightgrey";
            this.ctx.clearRect(0, 0, this.canv.width, this.canv.height);
            // Restore the transform
            this.ctx.restore();
            // add a point to the points object for the current mouse position (if the mouse position
            // is over the canvas and we've received it from onmousemove below).  
            // If the mouse isn't over the canvas, drop the oldest point instead.
            if (this.mousePosition) {
                console.log("adding point" + this.mousePosition);
                this.points.addPoint(this.mousePosition);
            }
            else {
                console.log("dropping point");
                this.points.dropPoint();
            }
            var rectCount = this.rects.length;
            // draw rectangles first
            for (var i = 0; i < rectCount; i++) {
                this.ctx.fillStyle = this.rects[i].color;
                this.ctx.fillRect(this.rects[i].p1.x, this.rects[i].p1.y, this.rects[i].p2.x - this.rects[i].p1.x, this.rects[i].p2.y - this.rects[i].p1.y);
            }
            var pointCount = this.points.getCount();
            // draw blue points with the oldest ones more transparent, 3x3 in size
            // hint: use the point number to create an rgba color
            // https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#rgba()
            for (var i = 0; i < pointCount; i++) {
                var transparency = i / 30;
                this.ctx.fillStyle = "rgba(0, 0, 255, " + transparency + ")";
                this.ctx.fillRect(this.points.getPoint(i).x - 1.5, this.points.getPoint(i).y - 1.5, 3, 3);
            }
            // if we've clicked, draw the rubber band.  use a strokeStyle of gray, and use strokeRect instead of fillRect
            if (this.clickStart) {
                this.ctx.strokeStyle = "rgb(80,80,80)";
                this.ctx.strokeRect(this.clickStart.x, this.clickStart.y, this.mousePosition.x - this.clickStart.x, this.mousePosition.y - this.clickStart.y);
            }
            // do it again!  and again!  AND AGAIN!  AND ...       
            requestAnimationFrame(function () { return _this.render(); });
        };
        return Drawing;
    })();
    // a global variable for our state
    var myDrawing;
    // main function, to keep things together and keep the globals
    function exec() {
        // find our container
        var div = document.getElementById("drawing");
        // let's create a canvas and to draw in
        var canv = document.createElement("canvas");
        canv.id = "main";
        canv.width = 512;
        canv.height = 512;
        div.appendChild(canv);
        // create a Drawing object
        myDrawing = new Drawing(canv);
        // kick off the rendering!
        myDrawing.render();
    }
    exec();
});
//# sourceMappingURL=a0.js.map