//2016 Spyblood Productions
//Use for non-commerical games only. do not sell comercially
//without permission first

using UnityEngine;
using System.Collections;



public enum DriveType
{
	RWD,
	FWD,
	AWD
};
[RequireComponent(typeof(AudioSource))]//needed audiosource
[RequireComponent(typeof(Rigidbody))]//needed Rigid body
public class CarControlCS : MonoBehaviour {


	public WheelCollider[] wheels = new WheelCollider[4];//wheelcolliders. [max allowed: 4]
	public GameObject[] tires = new GameObject[4];//wheel objects. [max allowed: 4]
	public DriveType DriveTrain = DriveType.RWD;
	public Vector3 centerOfGravity;//car's center of mass offset
	public GUITexture gasPedal;
	public GUITexture brakePedal;
	public GUITexture leftPedal;
	public GUITexture rightPedal;
	public float maxTorque = 1000f;//car's acceleration value
	public float maxReverseSpeed = 50f;//top speed for the reverse gear
	public float handBrakeTorque = 500f;//hand brake value
	public float maxSteer = 25f;//max steer angle
	public bool mobileInput = false;//do you want this to be a mobile game?
	public float[] GearRatio;//determines how many gears the car has, and at what speed the car shifts to the appropriate gear
	private int throttleInput;//read only
	private int steerInput;//read only
	private bool reversing;//read only
	private float currentSpeed;//read only
	public float maxSpeed = 150f;//how fast the vehicle can go
	private int gear;//current gear


	// Use this for initialization
	void Start () {
		//find all the GUITextures from the scene and assign them
		gasPedal = GameObject.Find("GasPedal").GetComponent<GUITexture>();
		brakePedal = GameObject.Find("BrakePedal").GetComponent<GUITexture>();
		leftPedal = GameObject.Find("LeftPedal").GetComponent<GUITexture>();
		rightPedal = GameObject.Find("RightPedal").GetComponent<GUITexture>();
		//Alter the center of mass for stability on your car
		GetComponent<Rigidbody>().centerOfMass = centerOfGravity;
	}
	
	// Update is called once per frame
	void FixedUpdate () {
		//its best to call custom functions from Fixedupdate so gameplay is smooth.
		//this is especially good for mobile development because the controls
		//become unresponsive in standard Update (At least that's what I experienced)
		AllignWheels ();
		CalculateAndCapSpeed ();
		GUIButtonControl();
		DriveMobile ();
		Drive ();
		EngineAudio ();
	}

	void AllignWheels()
	{
		//allign the wheel objs to their colliders
		for (int i = 0; i < 4; i++)
		{
			Quaternion quat;
			Vector3 pos;
			wheels[i].GetWorldPose(out pos,out quat);
			tires[i].transform.position = pos;
			tires[i].transform.rotation = quat;
		}
	}

	void CalculateAndCapSpeed()
	{
		currentSpeed = GetComponent<Rigidbody>().velocity.magnitude * 2.23693629f;//convert currentspeed into MPH

		float speed = GetComponent<Rigidbody> ().velocity.magnitude;
		Vector3 localCurrentSpeed;
		localCurrentSpeed = transform.InverseTransformDirection (GetComponent<Rigidbody> ().velocity);

		speed *= 2.23693629f;

		if (currentSpeed > maxSpeed || (localCurrentSpeed.z*2.23693629f) < -maxReverseSpeed){
			//we calculate the float value of the Rigid body's magnitude in local space. If it's speed going backwards is bigger than the reverse speed var, or if it's reached it's top drive speed, we simply multiply
			//the x,y, and z velocities by .99, so it stays just below the desired speed.
			//why the hell didn't I think of that before?
			GetComponent<Rigidbody>().velocity *= 0.99f; 
		}

		if (localCurrentSpeed.z<-0.1f)//in local space, if the car is travelling in the direction of the -z axis, (or in reverse), reversing will be true
		{
			reversing = true;
		}
		else{
			reversing = false;
		}

	}

	void GUIButtonControl()
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

	void DriveMobile()
	{
		if (!mobileInput)
			return;
		//dont call this function if the mobileiput box is not checked in the editor

		foreach (Touch touch in Input.touches) {

			//if the gas button is pressed down, speed up the car.
			if (touch.phase == TouchPhase.Stationary && gasPedal.HitTest(touch.position))
			{
				throttleInput = 1;
			}
			//when the gas button is released, slow the car down
			else if (touch.phase == TouchPhase.Ended && gasPedal.HitTest(touch.position))
			{
				throttleInput = 0;
			}
			//now the same thing for the brakes
			if (touch.phase == TouchPhase.Stationary && brakePedal.HitTest(touch.position))
			{
				throttleInput = -1;
			}
			//stop braking once you put your finger off the brake pedal
			else if (touch.phase == TouchPhase.Ended && brakePedal.HitTest(touch.position))
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
			else if (touch.phase == TouchPhase.Ended && leftPedal.HitTest(touch.position))
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
			else if (touch.phase == TouchPhase.Ended && rightPedal.HitTest(touch.position))
			{
				steerInput = 0; 
			}
			//now that we have our input values made, it's time to feed them to the car!
			wheels[0].steerAngle = maxSteer * steerInput;
			wheels[1].steerAngle = maxSteer * steerInput;
			//`````````````````````````````````````````````
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

	void Drive()
	{
		if (mobileInput)
			return;
		//dont call this function if mobile input is checked in the editor

		//the car will be 4 wheel drive or else it will be slow or feel a little sluggish
		//no matter how much you increase the max torque.
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
			wheels[0].brakeTorque = handBrakeTorque;
			wheels[1].brakeTorque = handBrakeTorque;
			wheels[2].brakeTorque = handBrakeTorque;
			wheels[3].brakeTorque = handBrakeTorque;
		}
		else//letting go of space disables the handbrake
		{
			wheels[0].brakeTorque = 0f;
			wheels[1].brakeTorque = 0f;
			wheels[2].brakeTorque = 0f;
			wheels[3].brakeTorque = 0f;
		}
	}

	void EngineAudio()
	{
		//the function called to give the car basic audio, as well as some gear shifting effects
		//it's prefered you use the engine sound included, but you can use your own if you have one.
		//~~~~~~~~~~~~[IMPORTANT]~~~~~~~~~~~~~~~~
		//make sure your last gear value is higher than the max speed variable or else you will
		//get unwanted errors!!
		
		//anyway, let's get started
		
		for (int i = 0; i < GearRatio.Length; i++) {
			if (GearRatio [i] > currentSpeed) {
				//break this value
				break;
			}

			float minGearValue = 0f;
			float maxGearValue = 0f;
			if (i == 0) {
				minGearValue = 0f;
			} else {
				minGearValue = GearRatio [i];
			}
			maxGearValue = GearRatio [i+1];
		
			float pitch = ((currentSpeed - minGearValue) / (maxGearValue - minGearValue)+0.3f * (gear+1));
			GetComponent<AudioSource> ().pitch = pitch;
		
			gear = i;
		}
	}

	void OnGUI()
	{
		//show the GUI for the speed and gear we are on.
		GUI.Box(new Rect(10,10,70,30),"MPH: " + Mathf.Round(GetComponent<Rigidbody>().velocity.magnitude * 2.23693629f));
		if (!reversing)
			GUI.Box(new Rect(10,70,70,30),"Gear: " + (gear+1));
		if (reversing)//if the car is going backwards display the gear as R
			GUI.Box(new Rect(10,70,70,30),"Gear: R");
	}
}
