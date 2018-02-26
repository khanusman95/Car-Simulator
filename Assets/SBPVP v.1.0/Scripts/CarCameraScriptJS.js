
#pragma strict
var car : Transform;	//Car Transform
var distance : float = 6.4;		//Distance from car
var height : float = 1.4; 	//Value on Y axis according to car transform
var rotationDamping : float = 3.0;	 //lower the value , faster the damping will be
var heightDamping : float = 2.0;	 //lower the value , faster the damping will be
var zoomRacio : float = 0.5;	//Change on FOV
var DefaultFOV : float = 60;	//Min FOV
var rotate : boolean = true;	//Look Back While Reversing
private var rotationVector : Vector3;	//Rotation Vector

//Positioning

function LateUpdate () {
var wantedAngel = rotationVector.y;
var wantedHeight = car.position.y + height;
var myAngel = transform.eulerAngles.y;
var myHeight = transform.position.y;
myAngel = Mathf.LerpAngle(myAngel,wantedAngel,rotationDamping*Time.deltaTime);
myHeight = Mathf.Lerp(myHeight,wantedHeight,heightDamping*Time.deltaTime);
var currentRotation = Quaternion.Euler(0,myAngel,0);
transform.position = car.position;
transform.position -= currentRotation*Vector3.forward*distance;
transform.position.y = myHeight;
transform.LookAt(car);
}

//Rotation And FOV Control

function FixedUpdate (){
var localVilocity = car.InverseTransformDirection(car.GetComponent.<Rigidbody>().velocity);
if (localVilocity.z<-0.5 && rotate){
rotationVector.y = car.eulerAngles.y + 180;
}
else {
rotationVector.y = car.eulerAngles.y;
}
var acc = car.GetComponent.<Rigidbody>().velocity.magnitude;
GetComponent.<Camera>().fieldOfView = DefaultFOV + acc*zoomRacio;
}
