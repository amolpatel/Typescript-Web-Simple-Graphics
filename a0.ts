import ps = require('./pointset');

//------------------
// Global utility functions.
// getRandomColor creates a random web color
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// a simple wrapper to reliably get the offset within an element  
// see: http://www.jacklmoore.com/notes/mouse-position/
function getOffset(e: MouseEvent): ps.MousePosition {
    e = e || <MouseEvent> window.event;

    var target = <Element> e.target || e.srcElement,
        rect = target.getBoundingClientRect(),
        offsetX = e.clientX - rect.left,
        offsetY = e.clientY - rect.top;

    return {x: offsetX, y: offsetY};
}
//------------------

// an interface that describes what our Rectangle object looks like
interface Rectangle {
    p1: ps.MousePosition;
    p2: ps.MousePosition;
    color: string;
}

// A class for our application state and functionality
class Drawing {
    // the public paramater "canv" is automatically created by "public" constructor parameter

    // rendering context for the canvas    
    ctx: CanvasRenderingContext2D;

    // last known mouse position
    mousePosition: ps.MousePosition;

    // mouse position when we clicked
    clickStart: ps.MousePosition = undefined;

    // our current rectangle set.  Grows as we add more rectangles
    rects: Array <Rectangle>;

    // the set of points trailing after the mouse
    points: ps.PointSet;
    
    // use the animationFrame to do continuous rendering.  Call it once to get things going.
    render() {
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
        if(this.mousePosition != undefined) {
            this.points.addPoint(this.mousePosition);
        }
        else{
            this.points.dropPoint();
        }



        const rectCount = this.rects.length;
        // draw rectangles first
        for(var i = 0; i < rectCount; i++){
            this.ctx.fillStyle = this.rects[i].color;
            this.ctx.fillRect(this.rects[i].p1.x, this.rects[i].p1.y, this.rects[i].p2.x - this.rects[i].p1.x, this.rects[i].p2.y - this.rects[i].p1.y);
        }


        const pointCount = this.points.getCount();
        // draw blue points with the oldest ones more transparent, 3x3 in size
        // hint: use the point number to create an rgba color
        // https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#rgba()
        for(var i = 0; i < pointCount; i++){
            var transparency = i/30;
            this.ctx.fillStyle = "rgba(0, 0, 255, " + transparency + ")";
            this.ctx.fillRect(this.points.getPoint(i).x - 1.5, this.points.getPoint(i).y - 1.5, 3, 3);
        }

                    

        // if we've clicked, draw the rubber band.  use a strokeStyle of gray, and use strokeRect instead of fillRect
        if (this.clickStart && this.mousePosition) {
            this.ctx.strokeStyle = "rgb(80,80,80)";
            this.ctx.strokeRect(this.clickStart.x - 0.5, this.clickStart.y - 0.5, this.mousePosition.x - this.clickStart.x, this.mousePosition.y- this.clickStart.y);
        }

        // do it again!  and again!  AND AGAIN!  AND ...       
        requestAnimationFrame(() => this.render());
    }
    
    // constructor for our state object
    constructor (public canv: HTMLCanvasElement) {
        this.clickStart = undefined;
        this.ctx = canv.getContext("2d");
        this.rects = new Array(0);  // start with no rects
        this.points = new ps.PointSet();
 
        canv.onmousedown = (ev: MouseEvent) => {
             this.clickStart = getOffset(ev);        
        }
        
        canv.onmouseup = (ev: MouseEvent) => {
            if (this.clickStart != undefined) {
                const clickEnd = getOffset(ev);
                var rect: Rectangle = {
                    p1: this.clickStart,
                    p2: clickEnd,
                    color: getRandomColor()
                };      
                this.rects.push(rect);
                console.dir(this.rects);
                this.clickStart = undefined; 
            }
        }
        
        canv.onmousemove = (ev: MouseEvent) => {
            const m = getOffset(ev);
            this.mousePosition = m;
        }

        //when mouse goes off canvas
        canv.onmouseout = (ev: MouseEvent) => {
            this.mousePosition = undefined;
            this.clickStart = undefined;
        }
    }
}

// a global variable for our state
var myDrawing: Drawing;

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