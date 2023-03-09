

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
let radius = 10 //the size of the soldier
let perceptionBubble = 200;
let squadSize = 5;

const gameObject = {};
//gameObject.squadMates = {};
gameObject.world = [];
gameObject.waypointX = width / 2;
gameObject.waypointY = height / 2;
gameObject.selected = []
gameObject.prevWaypointX = 0;
gameObject.prevWaypointY = 0;


const Bullet = class {
  constructor(x,y,angle){
    this.x = x,
    this.y = y,
    this.angle = angle;
    this.radius = 2.5;
    this.life=0;
  };
  faction = 'projectile';
  draw = function(){
    push();
    fill('black')
    circle(this.x, this.y,2*this.radius)
    pop();
  }
  behaviour = function(){
    this.life ++
    this.x += cos(this.angle)*5;
    this.y += sin(this.angle)*5;
    if (this.life>35){
     
    gameObject.world.splice(gameObject.world.indexOf(this),1)
    


    }
  }
}

const Soldier = class {
  constructor(x, y, name, faction) {
    this.x = x,
      this.y = y;
    this.name = name;
    this.faction = faction;
    this.angle = 0;
    this.theta = 0;

  }
  health = 100;
  gunAngle = 0;
  angleToEnemy = 0;
  radius = radius;
  perceptionBubble = perceptionBubble;
  perceptionArray = [];
  waypointX = this.x;
  waypointY = this.y;
  shootCooldown = 0;
  draw = function () {
    let perceptionBubble = this.perceptionBubble;
    let x = this.x
    let y = this.y
    let angle = this.angle
    let angleToEnemy = this.angleToEnemy
    let radius = this.radius
    let adj = this.waypointX - this.x; //left/right dist to waypoint
    let opp = this.waypointY - this.y; // up/down distance to waypoint 
    let hyp = sqrt((opp * opp) + (adj * adj)); // only a distance can't give the direction of hyp, fudge coming later...

    this.hyp = hyp;
    let theta;
    if (hyp === 0) { theta = 0 } else {
      theta = Math.asin(opp / hyp)
    }

    this.theta = theta;
    //here comes the fudge:
    if (adj < 0) {
      theta = -theta - PI;
      this.theta = theta;
    } //this corrects for if waypoint is to the left of the soldier; it flips the angle and for some reason I needed to shift it by Pi. Ah, who doesn't love trig?

    push(); //draws the green circle
    if (this.faction === 'enemy') { fill(enemies) } else { fill(friendlies) }
    circle(x, y, 2 * radius);
    noFill();
    pop(); //end of green circle

    // push(); //draws the orientation line, dependent on this.angle
    // stroke(blue);
    // line(x,
    //   y,
    //   x + (radius * cos(this.angle)),
    //   y + (radius * sin(this.angle))
    // );
    // pop(); //end of orientation line

    push(); //draws the gun line
    strokeWeight(2);
    stroke("black");
    line(x,
      y,
      x + (radius * cos(this.gunAngle)),
      y + (radius * sin(this.gunAngle))
    );
    pop(); //end of gun line

    if (gameObject.selected.includes(this)) {

      push(); // a perception bubble drawn around the soldier
      noFill();
      stroke(green);
      circle(x, y, perceptionBubble * 2)
      pop();

      // push();
      // stroke(blue); // draws a blue line between bots when they are in the perceptionArray
      // for (let i = 0; i < this.perceptionArray.length; i++) {
      //   let other = this.perceptionArray[i];
      //   line(x, y, other.x, other.y)// 
      // }
      // pop();

      let angleToEnemy = this.angleToEnemy
      // push();
      // strokeWeight(4)
      // stroke(red); // draws a red line to closest enemy
      // if (this.closestEnemy) {
      //   let other = this.closestEnemy
      //   line(x, y, other.x, other.y)
      //   //console.log('x: '+x)
      //   //console.log(this.angleToEnemy)
      //   let distance = dist(this.x, this.y, other.x, other.y)
      //   stroke(green)
      //   line(
      //     x,
      //     y,
      //     x + distance * cos(angleToEnemy),
      //     y + distance * sin(angleToEnemy))
      

      // }
      // pop();

    }
  }
  behaviour = function () { //--->START OF SOLDIER BEHAVIOUR  <---\\
    this.shootCooldown -=1;
    if (this.shootCooldown<0){this.shootCooldown = 0};
    let distanceToClick = dist(this.x, this.y, gameObject.waypointX, gameObject.waypointY)
    // console.log(distanceToClick)
    let selectedArray = gameObject.selected
    if (distanceToClick <= radius && !selectedArray.includes(this)) {
      if (selectedArray.length > 0) {
        // console.log('soldier '+this.name+' selected')
        // console.log(selectedArray[0].closestEnemy)
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

    //start of perception
    this.perceptionArray = [];
    // To be perceived by the soldier, an object must have a distance d < bubbleRadius
    //first get a list of all other things in the world array 
    for (let i = 0; i < gameObject.world.length; i++) {
      let other = gameObject.world[i];
      let distance = dist(this.x, this.y, other.x, other.y)
      if (distance < this.perceptionBubble && !this.perceptionArray.includes(other)) {
        this.perceptionArray.push(other);
      }
    }

    this.closestEnemy = 0;
    //this.angleToEnemy = 0;
    //personal space - loop thru the perceptionArray and anyone within the radius of the soldier causes a force to be exerted
    for (let i = 0; i < this.perceptionArray.length; i++) {
      if (this.perceptionArray[i] !== this) {
        let other = this.perceptionArray[i]
        let myX = this.x;
        let myY = this.y;
        let xDist = myX - other.x;
        let yDist = myY - other.y;
        let distance = Math.sqrt((xDist * xDist) + (yDist * yDist));
        let theta;
        if (distance === 0) { theta = 0 } else {
          theta = Math.asin(yDist / distance)
        }

        //collision detection:
        if (distance <= this.radius + other.radius) {
          this.x -= cos(theta);
          this.y += sin(theta);

          if (other.faction === 'projectile'){
            gameObject.world.splice(gameObject.world.indexOf(other),1)
            this.health -= 50;
          }
        }
        

        if (other.faction !== 'projectile'){if (other.faction !== this.faction) {
          if (!this.closestEnemy) {
            this.closestEnemy = (other)
          }
          if (this.closestEnemy) {
            const distanceToOther = dist(this.x, this.y, other.x, other.y);
            const distToCurrentClosest = dist(this.x, this.y, this.closestEnemy.x, this.closestEnemy.y)
            if (distanceToOther < distToCurrentClosest) {
              this.closestEnemy = (other)
            }
          }
        }
}

        
        if (this.closestEnemy) {
          let enemy = this.closestEnemy
          let adj = enemy.x - this.x;
          let opp = enemy.y - this.y;
          let hyp = dist(this.x, this.y, enemy.x, enemy.y)
          if (hyp === 0) { this.angleToEnemy = 0 } else { this.angleToEnemy = Math.asin(opp / hyp) }
          
          
          if (adj < 0) {  // ah, fudge
            this.angleToEnemy = -this.angleToEnemy - PI;
            //smallestAngle = -smallestAngle;
          } //this corrects for x axis 
          
          let ang = this.gunAngle - this.angleToEnemy
          let angPlus2pi = ang + 2 * PI;
          let angMinus2pi = ang - 2 * PI;
          //Now we have 3 distances in radians ... we want to select the one with the lowest absolute value and use it...but we want to keep the + or - sign when we do! I think I need to build a function!!!
          let smallestAngle = pickSmallestByMagnitude(ang, angPlus2pi, angMinus2pi);
          // const diff = diffUsual

        
          //  if (diff < 0) {
          //    this.gunAngle -= 1 * PI / 180;
          //  };
          // if (diff > 0) {
          //   this.gunAngle += 1 * PI / 180;
          // };

          // if (adj < 0) {  // ah, fudge
          //   this.angleToEnemy = -this.angleToEnemy - PI;
          //   //smallestAngle = -smallestAngle;
          // } //this corrects for x axis 

          if (smallestAngle > 0){
            this.gunAngle -= PI/180
          }
          if (smallestAngle < 0 ){
            this.gunAngle += PI/180
          }

          if (this.health <=0 ){
            gameObject.world.splice(gameObject.world.indexOf(this),1)
          }

        }
      }
    }


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
    const diff = pickSmallestByMagnitude(diffUsual, diffPlus2pi, diffMinus2pi);
    if (diff < 0) {
      this.angle += 8 * PI / 180;
    };
    if (diff > 0) {
      this.angle -= 8 * PI / 180;
    };


    if (hyp > 25) {  // this if statements make them stop when reaching waypoint
      this.x += cos(angle);
      this.y += sin(angle);
    }


    //these two if statements will restart the angle from 0 if it goes +/- 360 degrees(i.e. 2*Pi radians)
    if (this.angle >= 2 * PI) {
      this.angle = 0;
    };
    if (this.angle <= -2 * PI) {
      this.angle = 0;
    };
    if (this.theta >= 2 * PI) {
      this.theta = 0;
    };
    if (this.theta <= -2 * PI) {
      this.theta = 0;
    };



    let firingAngle = this.gunAngle - this.angleToEnemy
    if (this.closestEnemy !== 0 && 
      Math.abs(firingAngle) < PI/8 && 
      this.shootCooldown ===0){
    this.shootCooldown = 50
   this.shoot()
    }


  }//end of soldier behaviour function
  shoot= function(){
    const bullet = new Bullet(this.x+(this.radius+5)*cos(this.gunAngle), this.y+(this.radius+5)*sin(this.gunAngle), this.gunAngle)
    gameObject.world.push(bullet)
  }
}//end of soldier class
//--->END OF SOLDIER  <---\\

function spawnSoldier(x, y, name, faction) {
  const recruit = new Soldier(x, y, name, faction);
  gameObject.world.push(recruit);
}



function spawnSquad(num, x, y, faction) { //spawns a squad of num soldiers on the screen around the point x,y
  if (num === 0) { return; };
  len = 500;
  wid = 500;
  let xSpace = len / num;
  let ySpace = wid / num;
  for (let i = 0; i < num; i++) {
    let spawnX = i * xSpace + 50
    let spawnY = y + ySpace * Math.random()
    spawnSoldier(spawnX, spawnY, i, faction)
  }
}

function setup() {
  cnv = createCanvas(width, height)
  cnv.mouseClicked(getWaypoint);

  spawnSquad(squadSize, width / 2, height - 250, 'friendly');

  spawnSquad(squadSize, width / 2, 0, 'enemy');
  //console.log(gameObject)

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
    
    if (gameObject.world[i]){
       gameObject.world[i].draw();
      gameObject.world[i].behaviour();
      

      
    }
  
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
}


function pickSmallestByMagnitude(a, b, c) {
  const magA = Math.abs(a);
  const magB = Math.abs(b);
  const magC = Math.abs(c);
  let smallest = Math.min(magA, magB, magC)
  if (smallest === magA) { return a; };
  if (smallest === magB) { return b; };
  if (smallest === magC) { return c; };
  return;
}
