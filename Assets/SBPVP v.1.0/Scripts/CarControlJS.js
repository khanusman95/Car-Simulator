//2016 Spyblood Productions
//Use for non-commerical games only. do not sell comercially
//without permission first
#pragma strict
@script RequireComponent(typeof(Rigidbody))//we need a Rigidbody for the script to function
@script RequireComponent(typeof(AudioSource))//we need a AudioSource for the script to function
enum DriveType {RWD, FWD, AWD};
var wheels : WheelCollider[] = new WheelCollider[4];//the wheelCollider array. [by default, only 4 wheels are allowed]
var tires : GameObject[] = new GameObject[4];//same as above, but for the wheel objects
var DriveTrain : DriveType = DriveType.RWD;
var centerOfGravity : Vector3;//car's center of mass
var gasPedal : GUITexture;//self explanitory
var brakePedal : GUITexture;//self explanitory
var leftPedal : GUITexture;//self explanitory
var rightPedal : GUITexture;//self explanitory
var maxTorque : float = 1000;//how fast the car can accelerate
var maxReverseTorque : float = 50;//top speed for the car in reverse gear
var handBrakeTorque : float = 500;
var maxSteer : float = 25;//max steering angle
var mobileInput : boolean = false;//do you want this to be a mobile game?
var GearRatio : float[];//determines how many gears the car has, and at what speed the car shifts to the appropriate gear
private var throttleInput : int;//read only
private var steerInput : int;//read only
private var reversing = false;//read only
private var currentSpeed : float;//read only
var maxSpeed : float = 150;//top speed of the vehicle
private var gear : int;//read only

function Start () {
//find all the GUITextures from the scene and assign them
gasPedal = GameObject.Find("GasPedal").GetComponent.<GUITexture>();
brakePedal = GameObject.Find("BrakePedal").GetComponent.<GUITexture>();
leftPedal = GameObject.Find("LeftPedal").GetComponent.<GUITexture>();
rightPedal = GameObject.Find("RightPedal").GetComponent.<GUITexture>();
//Alter the center of mass for stability on your car
GetComponent.<Rigidbody>().centerOfMass = centerOfGravity;
}

function FixedUpdate () {
//its best to call custom functions from Fixedupdate so gameplay is smooth.
//this is especially good for mobile development because the controls
//become unresponsive in standard Update (At least that's what I experienced)
DriveMobile();
Drive();
EngineSound();
AllignWheels();
CalculateAndCapSpeed();
GUIButtonControl();
}

function AllignWheels()
{
//allign the wheel transforms to their wheelcollider's position
         for (var i = 0; i < wheels.Length; i++)
            {
                var quat : Quaternion;
                var position : Vector3;
                wheels[i].GetWorldPose(position,quat);
                tires[i].transform.position = position;
                tires[i].transform.rotation = quat;
                
            }
}

function CalculateAndCapSpeed()
{

currentSpeed = GetComponent.<Rigidbody>().velocity.magnitude * 2.23693629;//convert currentspeed into MPH

var speed : float = GetComponent.<Rigidbody>().velocity.magnitude;
var LocalCurrentSpeed : Vector3;
LocalCurrentSpeed = transform.InverseTransformDirection(GetComponent.<Rigidbody>().velocity);//convert velocity of the rigid body from world space to local space

speed *= 2.23693629;

if (currentSpeed > maxSpeed || (LocalCurrentSpeed.z*2.23693629) < -maxReverseTorque){
//we calculate the float value of the Rigid body's magnitude in local space. If it's speed going backwards is bigger than the reverse speed var, or if it's reached it's top drive speed, we simply multiply
//the x,y, and z velocities by .99, so it stays just below the desired speed.
//why the hell didn't I think of that before?
GetComponent.<Rigidbody>().velocity *= 0.99; 
}
if (LocalCurrentSpeed.z<-0.1)//in local space, if the car is travelling in the direction of the -z axis, (or in reverse), reversing will be true
{
reversing = true;
}
else{
reversing = false;
}
}

function GUIButtonControl()
{
//simple function that disables/enables GUI buttons when we need and dont need them.
if (mobileInput)
{
gasPedal.gameObject.SetActive(true);
leftPedal.gameObject.SetActive(true);
rightPedal.gameObject.SetActive(true);
brakePedal.gameObject.SetActive(true);
}
else{
gasPedal.gameObject.SetActive(false);
leftPedal.gameObject.SetActive(false);
rightPedal.gameObject.SetActive(false);
brakePedal.gameObject.SetActive(false);
}
}

function DriveMobile(){

if (!mobileInput)
{
return;
//dont call this code at all unless the mobileInput box is checked in the editor
}
for (var touch : Touch in Input.touches){

					//if the gas button is pressed down, speed up the car.
				if (touch.phase == TouchPhase.Stationary && gasPedal.HitTest(touch.position))
				{
					throttleInput = 1;
				}
				//when the gas button is released, slow the car down
			else if (touch.phase == TouchPhase.Ended && gasPedal.HitTest)
				{
					throttleInput = 0;
				}
				//now the same thing for the brakes
			if (touch.phase == TouchPhase.Stationary && brakePedal.HitTest(touch.position))
				{
					throttleInput = -1;
				}
				//stop braking once you put your finger off the brake pedal
			else if (touch.phase == TouchPhase.Ended && brakePedal.HitTest)
				{
					throttleInput = 0;
				}
				//now the left steering column...
				if (touch.phase == TouchPhase.Stationary && leftPedal.HitTest(touch.position))
				{
					//turn the front left wheels according to input direction
					steerInput = -1;
				}
				//and stop the steering once you take your finger off the turn button
				else if (touch.phase == TouchPhase.Ended && leftPedal.HitTest)
				{
					steerInput = 0;
				}
				//now the right steering column...
				if (touch.phase == TouchPhase.Stationary && rightPedal.HitTest(touch.position))
				{
					//turn the front left wheels according to input direction
					steerInput = 1;
				}
				//and stop the steering once you take your finger off the turn button
				else if (touch.phase == TouchPhase.Ended && rightPedal.HitTest)
				{
					steerInput = 0; 
				}
				//now that we have our input values made, it's time to feed them to the car!
				wheels[0].steerAngle = maxSteer * steerInput;
				wheels[1].steerAngle = maxSteer * steerInput;
				//```````````````````````````````````````````````
				
				if (DriveTrain == DriveType.RWD)
				{
					wheels[2].motorTorque = maxTorque * throttleInput;
					wheels[3].motorTorque = maxTorque * throttleInput;
				}
				if (DriveTrain == DriveType.FWD)
				{
					wheels[0].motorTorque = maxTorque * throttleInput;
					wheels[1].motorTorque = maxTorque * throttleInput;
				}
				if (DriveTrain == DriveType.AWD)
				{
					wheels[0].motorTorque = maxTorque * throttleInput;
					wheels[1].motorTorque = maxTorque * throttleInput;
					wheels[2].motorTorque = maxTorque * throttleInput;
					wheels[3].motorTorque = maxTorque * throttleInput;
				}
		}
}
function Drive(){
//this function is called for the desktop gameplay
if (mobileInput)
{
return;
}

				if (DriveTrain == DriveType.RWD)
				{
					wheels[2].motorTorque = maxTorque * Input.GetAxis("Vertical");
					wheels[3].motorTorque = maxTorque * Input.GetAxis("Vertical");
				}
				if (DriveTrain == DriveType.FWD)
				{
					wheels[0].motorTorque = maxTorque * Input.GetAxis("Vertical");
					wheels[1].motorTorque = maxTorque * Input.GetAxis("Vertical");
				}
				if (DriveTrain == DriveType.AWD)
				{
					wheels[0].motorTorque = maxTorque * Input.GetAxis("Vertical");
					wheels[1].motorTorque = maxTorque * Input.GetAxis("Vertical");
					wheels[2].motorTorque = maxTorque * Input.GetAxis("Vertical");
					wheels[3].motorTorque = maxTorque * Input.GetAxis("Vertical");
				}

wheels[0].steerAngle = maxSteer * Input.GetAxis("Horizontal");
wheels[1].steerAngle = maxSteer * Input.GetAxis("Horizontal");
if (Input.GetButton("Jump"))//pressing space triggers the car's handbrake
{
					wheels[2].brakeTorque = handBrakeTorque;
					wheels[3].brakeTorque = handBrakeTorque;
}
else//letting go of space disables the handbrake
{
					wheels[2].brakeTorque = 0;
					wheels[3].brakeTorque = 0;
}
}
function EngineSound()
{
//the function called to give the car basic audio, as well as some gear shifting effects
//it's prefered you use the engine sound included, but you can use your own if you have one.
//~~~~~~~~~~~~[IMPORTANT]~~~~~~~~~~~~~~~~
//make sure your last gear value is higher than the max speed variable or else you will
//get unwanted errors!!

//anyway, let's get started

for (var i = 0; i < GearRatio.Length; i++)
{
if (GearRatio[i] > currentSpeed)
{
//break this value
break;
}
}
var minGearValue = 0.00;
var maxGearValue = 0.00;
if (i == 0)
{
minGearValue = 0;
}
else{
minGearValue = GearRatio[i-1];
}
maxGearValue = GearRatio[i];

var pitch : float = ((currentSpeed - minGearValue)/(maxGearValue - minGearValue)+0.3 * (gear + 1));
GetComponent.<AudioSource>().pitch = pitch;

gear = i;
}

function OnGUI()
{
//show the GUI for the speed and gear we are on.
GUI.Box(Rect(10,10,70,30),"MPH: " + Mathf.Round(GetComponent.<Rigidbody>().velocity.magnitude * 2.23693629));
if (!reversing)
GUI.Box(Rect(10,70,70,30),"Gear: " + gear);
if (reversing)//if the car is going backwards display the gear as R
GUI.Box(Rect(10,70,70,30),"Gear: R");
}