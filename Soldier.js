const Soldier = class {

    constructor(x,y,name,faction){
        this.x = x,
        this.y = y;
        this.name = name;
        this.faction = faction;
    }

    angle =0;
    theta = 0;
    radius = radius;
    perceptionBubble= this.perceptionBubble;
    perceptionArray=[];
    waypointX = gameObject.waypointX;
    waypointY = gameObject.waypointY;
    draw = function(){      perceptionArray = gameObject.squadMates[name].perceptionArray;
        let perceptionBubble = gameObject.squadMates[name].perceptionBubble;
        let x = gameObject.squadMates[name].x
        let y = gameObject.squadMates[name].y
        let angle = gameObject.squadMates[name].angle
        let radius = gameObject.squadMates[name].radius
        let adj = gameObject.waypointX - x; //left/right dist to waypoint
        let opp = gameObject.waypointY - y; // up/down distance to waypoint 
        let hyp = sqrt((opp * opp) + (adj * adj)); // only a distance can't give the direction of hyp, fudge coming later...
        gameObject.squadMates[name].hyp = hyp;
        theta = Math.asin(opp / hyp);
        gameObject.squadMates[name].theta = theta;
        //here comes the fudge:
        if (adj < 0) {
          theta = -theta - PI;
          gameObject.squadMates[name].theta = theta;
        } //this corrects for if waypoint is to the left of the soldier; it flips the angle and for some reason I needed to shift it by Pi. Ah, who doesn't love trig?
  
        push(); //draws the green circle
        fill(green)
        circle(x, y, radius);
        noFill();
        pop(); //end of green circle
  
        push(); //draws the orientation line, dependent on this.angle
        stroke(red);
        line(x,
          y,
          x + (radius * cos(angle)),
          y + (radius * sin(angle))
        );
        pop(); //end of orientation line
  
        push(); // a perception bubble drawn around the soldier
        noFill();
        stroke(green);
        circle(x, y, perceptionBubble * 2)
        pop();

        push();
        stroke(blue); // draws a blue line between bots when they are in the perceptionArray
        for (let i = 0; i < perceptionArray.length; i++) {
          let other = perceptionArray[i];
          line(x, y, other.x, other.y)// 
        }
        pop();
    };
    behaviour = function(){ //--->START OF SOLDIER BEHAVIOUR  <---\\
        // 
        //this array will hold all objects that are within the bubble
        let perceptionArray = []
  
        gameObject.squadMates[name].perceptionArray = perceptionArray;
        //start of perception
        // To be perceived by the soldier, an object must have a distance d < bubbleRadius
        //first get a list of all other squadmates (the only other game objects that exist currently)
        let mates = gameObject.squadMates //first check the gameObject for squadmates
        //console.log(Object.keys(mates).length)
        for (let i = 0; i < Object.keys(mates).length; i++) {
          //get distance for the squadMate at index i:
          //console.log(x - mates[i].x)
          //console.log( y - mates[i].y) 
          let other = mates[i]
          // console.log(mates)
          let myX = gameObject.squadMates[name].x;
          let myY = gameObject.squadMates[name].y;
  
  
          let xDist = myX - other.x;
          let yDist = myY - other.y;
          // console.log("x: "+x)
          // console.log("other.x: "+other.x)
          // console.log(xDist)
          //  console.log("xDist: "+xDist)
          //  console.log("yDist: "+yDist)
          // let distance_sq = (xDist*xDist)+(yDist*yDist);
          let dist = Math.sqrt((xDist * xDist) + (yDist * yDist));
          let myBubble = gameObject.squadMates[name].perceptionBubble;
          //console.log("bot "+[name]+": "+dist+"from bot "+[i])
          //   console.log("dist: "+dist)
          if (dist < myBubble) {
            perceptionArray[perceptionArray.length] = mates[i];
          }
        }// now perceptionArray contains all the squadMates within the bubble
        //      console.log(perceptionArray)
        //personal space - loop thru the perceptionArray and anyone within the radius of the soldier causes a force to be exerted
        for (let i = 0; i < perceptionArray.length; i++) {
          
          if (perceptionArray[i]!==
            gameObject.squadMates[name]){        let other = perceptionArray[i]
              let myX = gameObject.squadMates[name].x;
              let myY = gameObject.squadMates[name].y;
              let xDist = myX - other.x;
              let yDist = myY - other.y;
              let dist = Math.sqrt((xDist * xDist) + (yDist * yDist));
              let theta;
              if (dist === 0) { theta = 0 } else {
               theta = Math.asin(yDist / dist)
              }
              //console.log("dist: "+dist+" radius: "+radius)
              if(dist===0){gameObject.squadMates[name].x += 1;}else
              if (dist<=radius){
              gameObject.squadMates[name].x += cos(theta);
              gameObject.squadMates[name].y += sin(theta);
              }
      }
          
  
  
        }
  
  
  
        //these two if statements will restart the angle from 0 if it goes +/- 360 degrees(i.e. 2*Pi radians)
        // console.log(gameObject.squadMates[name].soldierAngle <= -2 * PI);
        let angle = gameObject.squadMates[name].angle
        let theta = gameObject.squadMates[name].theta
        let hyp = gameObject.squadMates[name].hyp
  
        //soldier direction behaviour - orient toward the waypoint // need to solve the problem of spinning the wrong way when angle is near to zero
        //first calculate the difference in radians between angle and theta:
        let diffUsual = angle - theta
        //console.log("diffUsual: "+diffUsual)
        //now calculate the difference +/- a full rotation:
        let diffPlus2pi = diffUsual + 2 * PI;
        let diffMinus2pi = diffUsual - 2 * PI;
        //Now we have 3 distances in radians ... we want to select the one with the lowest absolute value and use it...but we want to keep the + or - sign when we do! I think I need to build a function!!!
        const diff = pickSmallestByMagnitude(diffUsual, diffPlus2pi, diffMinus2pi)
        //console.log("diff: "+diff)
        //console.log(gameObject.squadMates[name].soldierAngle )
        //console.log(diff)
        if (diff < 0) {
          gameObject.squadMates[name].angle += 8*PI / 180;
        };
        if (diff > 0) {
          gameObject.squadMates[name].angle -= 8*PI / 180;
        };
        // console.log("soldier x,y: "+soldier.x+","+soldier.y)
        // console.log("waypoint x,y: "+waypoint.x+","+waypoint.y)
        //soldier movement behaviour; towards waypoint with x/y components scaled for orientation
        //console.log(Math.cos(gameObject.squadMates[name].soldierAngle));
  
        //console.log(hyp)
        //console.log(gameObject.squadMates[name].x)
  
  
        if (hyp > 50) {  // this if statements make them stop when reaching waypoint
          gameObject.squadMates[name].x += cos(angle);
          gameObject.squadMates[name].y += sin(angle);
        }
  
        //--->END OF SOLDIER  <---\\
  
        if (angle >= 2 * PI) {
  
          angle = 0;
        };
        if (angle <= -2 * PI) {
          angle = 0;
        };
        if (theta >= 2 * PI) {
          theta = 0;
        };
        if (theta <= -2 * PI) {
          theta = 0;
        };
  
      }

  


  }

   export default Soldier;