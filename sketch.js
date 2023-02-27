let width = 500;
let height = 500;

let waypointTimestamp;

let cnv;

let soldierAngle = 0;
let soldierTheta = 0;
let soldierX = 250;
let soldierY = 250;
let waypointX = soldierX;
let waypointY = soldierY;
let soldierHyp;

function setup() {
  cnv = createCanvas(600, 600)
  cnv.mouseClicked(getWaypoint);
  angleMode(RADIANS);
};

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// };

function draw() {
  const currentTime = new Date().getTime();
  // translate(width / 2, height / 2)
  // scale(1, -1)
  let waypoint = { //waypoint object, most of the maths relating to this happens in the soldier object
    x: waypointX,
    y: waypointY,
    draw: function () {
      if (currentTime < waypointTimestamp + 50) {
        push();
        fill('#ADD8E6')
        circle(this.x, this.y, 50)
        pop();
      }
      if (currentTime < waypointTimestamp + 100) {
        push();
        fill('#ADD8E6')
        circle(this.x, this.y, 25)
        pop();
      }

    }
  };

  let soldier = {//begin soldier object
    x: soldierX,
    y: soldierY,
    angle: soldierAngle, //current orientation of the soldier
    theta: soldierTheta,

    draw: function () {
      let adj = waypoint.x - this.x; //left/right dist to waypoint
      let opp = waypoint.y - this.y; // up/down distance to waypoint 
      let hyp = sqrt((opp * opp) + (adj * adj)); // only a distance can't give the direction of hyp, fudge coming later...
      soldierHyp = hyp;

      this.theta = Math.asin(opp / hyp);
      soldierTheta = this.theta;

      //here comes the fudge:
      if (adj < 0) {
        this.theta = -this.theta - PI;
        soldierTheta = this.theta;
      } //this corrects for if waypoint is to the left of the soldier; it flips the angle and for some reason I needed to shift it by Pi. Ah, who doesn't love trig?

      push(); //draws the green circle
      fill('green')
      circle(this.x, this.y, 50);
      noFill();
      pop(); //end of green circle

      push(); //draws the orientation line, dependent on this.angle
      stroke('red');
      line(this.x,
        this.y,
        this.x + (50 * cos(this.angle)),
        this.y + (50 * sin(this.angle))
      );
      pop(); //end of orientation line

      // push(); //a line going from the center of the soldier to the waypoint, left here in case it is useful for debugging later on
      // stroke('red')
      // line(this.x,this.y,waypoint.x,waypoint.y)
      // pop();

      push(); //draws waypoint direction line, calculated from the value theta
      stroke('blue');
      line(this.x, this.y,
        cos(this.theta) * 50 + this.x,
        sin(this.theta) * 50 + this.y,
      )
      pop();//end of waypoint dir line


    }//end of soldier.draw
  }//end of soldier object


  //these two if statements will restart the angle from 0 if it goes +/- 360 degrees(i.e. 2*Pi radians)
  if (soldierAngle >= 2 * PI) {
    soldierAngle = 0;
  };
  if (soldierAngle <= -2 * PI) {
    soldierAngle = 0;
  };

  //soldier direction behaviour - orient toward the waypoint // need to solve the problem of spinning the wrong way when angle is near to zero

  //first calculate the difference in radians between angle and theta:
  let diffUsual = soldierAngle - soldierTheta
  //now calculate the difference +/- a full rotation:
  let diffPlus2pi = diffUsual + 2 * PI;
  let diffMinus2pi = diffUsual - 2 * PI;
  //Now we have 3 distances in radians ... we want to select the one with the lowest absolute value and use it...but we want to keep the + or - sign when we do! I think I need to build a function!!!

  const diff = pickSmallestByMagnitude(diffUsual, diffPlus2pi, diffMinus2pi)
  if (diff < 0) {
    soldierAngle += PI / 180;
  };
  if (diff > 0) {
    soldierAngle -= PI / 180;
  };


  // console.log("soldier x,y: "+soldier.x+","+soldier.y)
  // console.log("waypoint x,y: "+waypoint.x+","+waypoint.y)

  //soldier movement behaviour; towards waypoint with x/y components scaled for orientation

  if (soldierHyp > 20) {
    soldierX += cos(soldierAngle);
    soldierY += sin(soldierAngle);
  }


  clear();
  background('#A67A5B');

  //show stuff onscreen for debugging
  //text("angle: " + soldierAngle, 20, 100);
  // text("theta: " + soldierTheta, 20, 120);
  // text("2Pi: "+(2*PI),20,140);
  // text("diff: "+ diffUsual,20,160);
  // text("plus 2Pi: " + (diffPlus2pi), 20, 180);
  // text("minus 2Pi " + (diffMinus2pi), 20, 200);


  waypoint.draw();
  soldier.draw();
}; //end of draw loop

function mouseClicked() {
}

function getWaypoint() {
  waypointX = mouseX;
  waypointY = mouseY;
  waypointTimestamp = new Date().getTime()
  console.log(waypointTimestamp)
}

function pickSmallestByMagnitude(a, b, c) {
  const magA = Math.abs(a);
  const magB = Math.abs(b);
  const magC = Math.abs(c);
  let smallest = Math.min(magA, magB, magC)
  if (smallest === magA) { return a; };
  if (smallest === magB) { return b; };
  if (smallest === magC) { return c; };
  console.log("check pickSmallestByMagnitude() function")
  return;
}
