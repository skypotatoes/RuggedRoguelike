

let width = innerWidth;
let height = innerHeight;
const cappucino = [`#4b3832`, `#854442`, `#fff4e6`, `#3c2f2f`, `#be9b7b`];
let bgColour = cappucino[3]
const colours = ['#008744', `#0057e7`, `#d62d20`, `#ffa700`, `#ffffff`];
const green = colours[0];
const red = colours[2];
const blue = colours[1];
const yellow = colours[3];
const white = colours[4];
const friendlies = green;
const enemies = red;
const neutrals = yellow;

let waypointTimestamp;

let cnv;
let radius = 25 //the size of the soldier
let perceptionBubble = 200;
let squadSize = 5;

const gameObject = {};
//gameObject.squadMates = {};
gameObject.world =[];
gameObject.waypointX = width / 2;
gameObject.waypointY = height / 2;
gameObject.selected = []
gameObject.prevWaypointX = 0;
gameObject.prevWaypointY = 0;


const Soldier = class {
  constructor(x, y, name, faction) {
    this.x = x,
    this.y = y;
    this.name = name;
    this.faction = faction;
    this.angle = 0;
    this.theta =0;

  }
  radius = radius;
  perceptionBubble = perceptionBubble;
  perceptionArray = [];
  waypointX = this.x;
  waypointY = this.y;
  draw = function () {
    //console.log(gameObject)


  
    let perceptionBubble = this.perceptionBubble;
    let x = this.x
    let y = this.y
    let angle = this.angle
    let radius = this.radius
    let adj = this.waypointX - this.x; //left/right dist to waypoint
    let opp = this.waypointY - this.y; // up/down distance to waypoint 
    let hyp = sqrt((opp * opp) + (adj * adj)); // only a distance can't give the direction of hyp, fudge coming later...

    this.hyp = hyp;
    let theta; 
    if (hyp===0){theta = 0}else{theta = Math.asin(opp / hyp)}

    
    
    this.theta = theta;
    //here comes the fudge:
    if (adj < 0) {
      theta = -theta - PI;
      this.theta = theta;
    } //this corrects for if waypoint is to the left of the soldier; it flips the angle and for some reason I needed to shift it by Pi. Ah, who doesn't love trig?

    push(); //draws the green circle
    if (this.faction==='enemy'){fill(enemies)}else{ fill(friendlies)}
    circle(x, y, 2*radius);
    noFill();
    pop(); //end of green circle

    push(); //draws the orientation line, dependent on this.angle
    stroke(blue);
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
    for (let i = 0; i < this.perceptionArray.length; i++) {
      let other = this.perceptionArray[i];
      line(x, y, other.x, other.y)// 
    }
    pop();
  }
  behaviour = function () { //--->START OF SOLDIER BEHAVIOUR  <---\\

    let distanceToClick = dist(this.x, this.y, gameObject.waypointX, gameObject.waypointY)
    // console.log(distanceToClick)
    let selectedArray = gameObject.selected
    if (distanceToClick <= radius && !selectedArray.includes(this)) {
      if (selectedArray.length > 0) {
       // console.log('soldier '+this.name+' selected')
        console.log(selectedArray[0].perceptionArray)
        gameObject.selected[0].waypointX = gameObject.prevWaypointX;
        gameObject.selected[0].waypointY = gameObject.prevWaypointY;
        gameObject.selected.pop();
        gameObject.selected.push(this);
      }
      if (selectedArray.length === 0) { //console.log(selectedArray)
        // gameObject.selected[0].waypointX=this.x
        // gameObject.selected[0].waypointY=this.y
        gameObject.selected.push(this);
      }


    }

    if (distanceToClick > radius && gameObject.selected.includes(this)) {
      this.waypointX = gameObject.waypointX;
      this.waypointY = gameObject.waypointY
    };
    //     if (gameObject.selected.length>0){console.log(gameObject.selected[0].name)}

    //console.log(selectedArray[0])



    //start of perception
    let perceptionArray = [];
    // To be perceived by the soldier, an object must have a distance d < bubbleRadius
    //first get a list of all other things in the world array 

for (let i = 0; i < gameObject.world.length; i++) {
  let other = gameObject.world[i];
  let distance = dist(this.x,this.y,other.x,other.y)



if (distance < this.perceptionBubble && !this.perceptionArray.includes(other)) {
         this.perceptionArray.push(other);}
}

    


    //personal space - loop thru the perceptionArray and anyone within the radius of the soldier causes a force to be exerted
    for (let i = 0; i < this.perceptionArray.length; i++) {

      if (this.perceptionArray[i] !==this) {
        let other = this.perceptionArray[i]
        console.log(this.x)
        let myX = this.x;
        let myY = this.y;
        let xDist = myX - other.x;
        let yDist = myY - other.y;
        let dist = Math.sqrt((xDist * xDist) + (yDist * yDist));
        let theta;
        if (dist === 0) { theta = 0 } else {
          theta = Math.asin(yDist / dist)
        }
        //console.log("dist: "+dist+" radius: "+radius)
        //collision detection:
        if (dist <= 2*radius) {
          this.x -= cos(theta);
          this.y += sin(theta);
        }
      }



    }



    //these two if statements will restart the angle from 0 if it goes +/- 360 degrees(i.e. 2*Pi radians)
    // console.log(gameObject.squadMates[name].soldierAngle <= -2 * PI);
    let angle = this.angle
    let theta = this.theta
    let hyp = this.hyp

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
      this.angle += 8 * PI / 180;
    };
    if (diff > 0) {
      this.angle -= 8 * PI / 180;
    };
    // console.log("soldier x,y: "+soldier.x+","+soldier.y)
    // console.log("waypoint x,y: "+waypoint.x+","+waypoint.y)
    //soldier movement behaviour; towards waypoint with x/y components scaled for orientation
    //console.log(Math.cos(gameObject.squadMates[name].soldierAngle));

    //console.log(hyp)
    //console.log(gameObject.squadMates[name].x)


    if (hyp > 50) {  // this if statements make them stop when reaching waypoint
      this.x += cos(angle);
      this.y += sin(angle);
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


function spawnSoldier(x, y, name, faction) {

  const recruit = new Soldier(x, y, name, faction);

  gameObject.world.push(recruit);


  //console.log(gameObject)
}



function spawnSquad(num, x, y, faction) { //spawns a squad of num soldiers on the screen around the point x,y
  if (num === 0) { return; };

  // if (num === 2){
  //   spawnSoldier(x, y, 'Albert');
  //   spawnSoldier(x+100, y-100, 'Charlie');
  // }
//spawn within a 500x500 space around the point
  len = 500;
  wid = 500;
  let xSpace=len/num;
  let ySpace=wid/num;

 
  for (let i = 0; i < num; i++) {

    // spawnSoldier(i*width/num,y,i);
    //console.log("#soldier "+i+" spawned")
    //console.log(i)

    let spawnX = x+i*xSpace
    let spawnY =y+ySpace*Math.random()
    spawnSoldier(spawnX, spawnY, i, faction)



  }
}//1 soldier will just spawn on the coords

function setup() {
  cnv = createCanvas(width, height)
  cnv.mouseClicked(getWaypoint);

  // angleMode(RADIANS);
  // spawnSoldier(width / 2, height / 2, "Tommy");
  // spawnSoldier(width/2-100,height/2-100,"Billy")
  //console.log(gameObject)
  spawnSquad(squadSize, width / 2, height-250, 'friendly');
  spawnSquad(squadSize, width / 2, 0, 'enemy');
  console.log(gameObject)

};

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};

//start of the main draw loop
function draw() {


  //start of waypoint logic
  const currentTime = new Date().getTime();
  // translate(width / 2, height / 2)
  // scale(1, -1)
  let waypoint = { //waypoint object, most of the maths relating to this happens in the soldier object
    x: gameObject.waypointX,
    y: gameObject.waypointY,
    draw: function () {
      //  console.log(this.y)
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


  clear();
  background(bgColour);



 // console.log(gameObject)
  //let squadMates = gameObject.squadMates;

  // //decide here which game objects you want to render

  for (let i = 0; i < gameObject.world.length; i++) {
    // let faction = gameObject.factions[i];
   // console.log(gameObject[faction])
 
      gameObject.world[i].behaviour();
      gameObject.world[i].draw();

  }
  waypoint.draw();

}; //end of draw loop

function mouseClicked() {

}

function getWaypoint() {
  gameObject.prevWaypointX = gameObject.waypointX;
  gameObject.prevWaypointY = gameObject.waypointY;
  gameObject.waypointX = mouseX;
  gameObject.waypointY = mouseY;
  waypointTimestamp = new Date().getTime()

  // if the waypoint is on top of you, you have been selected

}


function pickSmallestByMagnitude(a, b, c) {
  const magA = Math.abs(a);
  const magB = Math.abs(b);
  const magC = Math.abs(c);
  let smallest = Math.min(magA, magB, magC)
  if (smallest === magA) { return a; };
  if (smallest === magB) { return b; };
  if (smallest === magC) { return c; };
  //console.log("check pickSmallestByMagnitude() function")
  return;
}
