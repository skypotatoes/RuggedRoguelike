
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



  //--->START OF SOLDIER BEHAVIOUR WITHIN MAIN DRAW LOOP <---\\
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
//--->END OF SOLDIER BEHAVIOUR WITHIN MAIN DRAW LOOP <---\\