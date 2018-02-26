var gasPedal : GUITexture;//self explanitory
var brakePedal : GUITexture;//self explanitory
var leftPedal : GUITexture;//self explanitory
var rightPedal : GUITexture;//self explanitory

function Start () {
//find all the GUITextures from the scene and assign them
gasPedal = GameObject.Find("GasPedal").GetComponent.<GUITexture>();
brakePedal = GameObject.Find("BrakePedal").GetComponent.<GUITexture>();
leftPedal = GameObject.Find("LeftPedal").GetComponent.<GUITexture>();
rightPedal = GameObject.Find("RightPedal").GetComponent.<GUITexture>();
//Alter the center of mass for stability on your car
//GetComponent.<Rigidbody>().centerOfMass = centerOfGravity;
}

function Update () {
    
//    if(Input.GetKey(KeyCode.UpArrow))
//        transform.Translate(Vector3(0, 0, -1));
//    if (Input.GetKey(KeyCode.LeftArrow))
//        transform.Rotate(Vector3(0, -1, 0));
//    if (Input.GetKey(KeyCode.DownArrow))
//        transform.Translate(Vector3(0, 0, 1));
//    if (Input.GetKey(KeyCode.RightArrow))
//        transform.Rotate(Vector3(0, 1, 0));

for (var touch : Touch in Input.touches){

					//if the gas button is pressed down, speed up the car.
				if (touch.phase == TouchPhase.Stationary && gasPedal.HitTest(touch.position))
				{
					transform.Translate(Vector3(0, 0, -1));
				}
				//when the gas button is released, slow the car down
			else if (touch.phase == TouchPhase.Ended && gasPedal.HitTest)
				{
					transform.Translate(Vector3(0, 0, 0));
				}
				//now the same thing for the brakes
			if (touch.phase == TouchPhase.Stationary && brakePedal.HitTest(touch.position))
				{
					transform.Translate(Vector3(0, 0, 1));
				}
				//stop braking once you put your finger off the brake pedal
			else if (touch.phase == TouchPhase.Ended && brakePedal.HitTest)
				{
					transform.Translate(Vector3(0, 0, 0));
				}
				//now the left steering column...
				if (touch.phase == TouchPhase.Stationary && leftPedal.HitTest(touch.position))
				{
					//turn the front left wheels according to input direction
					transform.Rotate(Vector3(0, -1, 0));
				}
				//and stop the steering once you take your finger off the turn button
				else if (touch.phase == TouchPhase.Ended && leftPedal.HitTest)
				{
					
				}
				//now the right steering column...
				if (touch.phase == TouchPhase.Stationary && rightPedal.HitTest(touch.position))
				{
					//turn the front left wheels according to input direction
					transform.Rotate(Vector3(0, 1, 0));
				}
				//and stop the steering once you take your finger off the turn button
				else if (touch.phase == TouchPhase.Ended && rightPedal.HitTest)
				{
					
				}				
				
		}

        
 }