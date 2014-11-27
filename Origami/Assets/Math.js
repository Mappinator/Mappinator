#pragma strict
public class Math extends ScriptableObject
{
public var triangle:int[];
	public var vertice:Vector3[];
	public var normal:Vector3[];
	private function InitFace(i:int,dot1:Vector3,dot2:Vector3,dot3:Vector3){

		vertice[i*3]=dot1;
		vertice[i*3+1]=dot2;
		vertice[i*3+2]=dot3;
		
		triangle[i*3]=i*3;
		triangle[i*3+1]=i*3+1;
		triangle[i*3+2]=i*3+2;
	
	}
	private function InitConvex(Convex:GameObject,Dot:Vector3[]){//It must be in order
		var mesh:Mesh=Convex.GetComponent(MeshFilter).mesh;
		
		var VL=Dot.Length/2;

		vertice=new Vector3[12*VL-12];
		triangle=new int[12*VL-12];
		normal=new Vector3[12*VL-12];

		var T=0;
		for (var i=0;i<VL-2;i++)
		{
			InitFace(T,Dot[0],Dot[i+1],Dot[i+2]);
			T++;
		}

		for (i=VL-2;i<2*VL-4;i++)
		{
			InitFace(T,Dot[VL],Dot[i+4],Dot[i+3]);
			T++;
		}
		for (i=0;i<VL;i++)
		{
			var left=i;
			var right=i+1;
			if (right==VL) right=0;
			InitFace(T,Dot[left],Dot[left+VL],Dot[right+VL]);
			T++;
			InitFace(T,Dot[left],Dot[right+VL],Dot[right]);
			T++;
		}
	
		mesh.vertices=new Vector3[12*VL-12];
		mesh.triangles=new int[12*VL-12];
		mesh.normals=new Vector3[12*VL-12];
	
		mesh.normals=normal;
		mesh.vertices=vertice;
		mesh.triangles=triangle;
	
	    mesh.RecalculateBounds();
	    mesh.RecalculateNormals();
	    
	    Convex.GetComponent(MeshCollider).sharedMesh=Convex.GetComponent(MeshFilter).mesh;
		Convex.GetComponent(MeshCollider).convex=true;
		Convex.GetComponent(MeshCollider).enabled=true;
	}
	public var Paper:GameObject;
	private var paper1:GameObject;
	private var cylinder:GameObject;
function Start () {
    
	paper1=Paper.Instantiate(Paper,Vector3(0,0,0),Quaternion.identity);
	var V=new Vector3[6];
	V[0].Set(2,2,-4);
	V[1].Set(2,-4,2);
	V[2].Set(-4,2,2);
	V[3].Set(3.414,3.414,-2.586);
	V[4].Set(3.414,-2.586,3.414);
	V[5].Set(-2.586,3.414,3.414);
	InitConvex(paper1,V);
	direction=Vector3.up;
}
	private var sumtime:double;
	private var direction:Vector3;
function Update () {
	var trans=paper1.GetComponent(Transform);
	sumtime+=Time.deltaTime;
	if (sumtime>0&&sumtime<6)
	{
		direction=Vector3.up;
	}
	if (sumtime>6&&sumtime<8) return;
	if (sumtime>8&&sumtime<14)
	{
		direction=Vector3.left;
	}
	if (sumtime>14&&sumtime<16) return;
	if (sumtime>16&&sumtime<22)
	{
		direction=Vector3.forward;
	}
	if (sumtime>22&&sumtime<24) return;
	if (sumtime>24&&sumtime<30)
	{
		direction=Vector3.down;
	}
	if (sumtime>30&&sumtime<32) return;
	if (sumtime>32&&sumtime<38)
	{
		direction=Vector3.right;
	}
	if (sumtime>38&&sumtime<40) return;
	if (sumtime>40&&sumtime<46)
	{
		direction=Vector3.back;
	}
	if (sumtime>46&&sumtime<48) return;
	if (sumtime>48)
	{
		sumtime=0;
		return;
	}
	trans.transform.RotateAround(Vector3.zero, direction, 15 * Time.deltaTime);

}
}