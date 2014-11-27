#pragma strict

import System;


public class Fold extends ScriptableObject
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
	private function InitConvexs(Convexs:GameObject,Dots:Vector3[]){//It must be in order
		var mesh:Mesh=Convexs.GetComponent(MeshFilter).mesh;
		
		var VL=Dots.Length/2;

		vertice=new Vector3[12*VL-12];
		triangle=new int[12*VL-12];
		normal=new Vector3[12*VL-12];

		var T=0;
		for (var i=0;i<VL-2;i++)
		{
			InitFace(T,Dots[0],Dots[i+1],Dots[i+2]);
			T++;
		}

		for (i=VL-2;i<2*VL-4;i++)
		{
			InitFace(T,Dots[VL],Dots[i+4],Dots[i+3]);
			T++;
		}
		for (i=0;i<VL;i++)
		{
			var left=i;
			var right=i+1;
			if (right==VL) right=0;
			InitFace(T,Dots[left],Dots[left+VL],Dots[right+VL]);
			T++;
			InitFace(T,Dots[left],Dots[right+VL],Dots[right]);
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
	    
	    Convexs.GetComponent(MeshCollider).sharedMesh=Convexs.GetComponent(MeshFilter).mesh;
		Convexs.GetComponent(MeshCollider).convex=true;
		Convexs.GetComponent(MeshCollider).enabled=true;
	}
	public var Paper:GameObject;
	
	public var MAPjson:LitJson.JsonData;
	
	private function DotsCount()
	{
		return MAPjson["dots"].Count;
	}
	private function GetDot(N:int)
	{
		var Dot=MAPjson["dots"][N];
		var Vx=parseFloat(Dot["x"].ToString());
		var Vy=parseFloat(Dot["y"].ToString());
		var Vv=new Vector3();
		Vv.Set(Vx,Vy,0);
		return Vv;
	}
	
	private function ConvexsCount()
	{
		return MAPjson["convexs"].Count;
	}
	private function ConvexsDotsCount(N:int)
	{
		var Convexs=MAPjson["convexs"][N];
		var Dot=Convexs["dots"];
		return Dot.Count;
	}
	private function GetConvexsDot(N:int,M:int)
	{
		var Convexs=MAPjson["convexs"][N];
		var Dot=Convexs["dots"][M];
		return GetDot(parseInt(Dot.ToString()));
	}
	
	private function LinesCount()
	{
		return MAPjson["lines"].Count;
	}
	private function GetLineDot(N:int,M:int)
	{
		var Line=MAPjson["lines"][N];
		var Dot;
		if (0==M) Dot=Line["A"];
		if (1==M) Dot=Line["B"];
		return GetDot(parseInt(Dot.ToString()));
	}
	private function LineConvexsCount(N:int)
	{
		var Line=MAPjson["lines"][N];
		return Line.Count;
	}
	private function GetLineConvexs(N:int,M:int)
	{
		var Line=MAPjson["lines"][N];
		var Convexs;
		if (0==M) Convexs=Line["convexA"];
		if (1==M) Convexs=Line["convexB"];
		return parseInt(Convexs.ToString());
	}
	private function GetLineType(N:int)
	{
		var Line=MAPjson["lines"][N];
		var Type=Line["foldtype"];
		return Type.ToString();
	}
	
	
	function Start () {
	
	var PATH="godluo.CP";
	//System.IO.File.Open(PATH,System.IO.FileMode.Open);
	var MAP=System.IO.File.ReadAllText(PATH);
	//var MAP="{'dots':[{'vector':[-2,2]},{'vector':[2,2]},{'vector':[-2,0]},{'vector':[0,0]},{'vector':[2,0]},{'vector':[-2,-2]},{'vector':[2,-2]}],'convex':[{'dots':[0,1,3]},{'dots':[0,2,3]},{'dots':[1,3,4]},{'dots':[2,3,5]},{'dots':[3,5,6]},{'dots':[3,4,6]}],'lines':[{'dots':[0,1],'convex':[-1,0],'type':'unfold'},{'dots':[2,0],'convex':[-1,1],'type':'unfold'},{'dots':[0,3],'convex':[0,1],'type':'mountain'},{'dots':[1,3],'convex':[2,0],'type':'mountain'},{'dots':[1,4],'convex':[-1,2],'type':'unfold'},{'dots':[3,2],'convex':[1,3],'type':'valley'},{'dots':[4,3],'convex':[2,5],'type':'valley'},{'dots':[2,5],'convex':[-1,3],'type':'unfold'},{'dots':[5,3],'convex':[3,4],'type':'mountain'},{'dots':[6,3],'convex':[4,5],'type':'mountain'},{'dots':[4,6],'convex':[-1,5],'type':'unfold'},{'dots':[5,6],'convex':[-1,4],'type':'unfold'}]}";
	MAPjson=LitJson.JsonMapper.ToObject(MAP);
	
	var ConvexsSum=ConvexsCount();
	var Convexs=new GameObject[ConvexsSum];
	var ConvexsRigidbody=new Rigidbody[ConvexsSum]; 
	var Center=new Vector3[ConvexsSum];
	
	for (var i=0;i<ConvexsSum;i++)
	{
		Convexs[i]=Paper.Instantiate(Paper,Vector3(0,0,0),Quaternion.identity);
		var DotsCount=ConvexsDotsCount(i);
		
		for (var j=0;j<DotsCount;j++)
		{
			Center[i]=Center[i]+GetConvexsDot(i,j);
		}
		Center[i]=Center[i]*(1.0/DotsCount);
		
		var Alpha=0.95;
		var Dot=new Vector3[DotsCount*2];
		for (j=0;j<DotsCount;j++)
		{
			Dot[j]=GetConvexsDot(i,j);
			Dot[j]=(Dot[j]-Center[i])*Alpha+Center[i];
			Dot[j].z=-0.5;
		}
		for (j=0;j<DotsCount;j++)
		{
			Dot[j+DotsCount]=GetConvexsDot(i,j);
			Dot[j+DotsCount]=(Dot[j+DotsCount]-Center[i])*Alpha+Center[i];
			Dot[j+DotsCount].z=0.5;
		}
		InitConvexs(Convexs[i],Dot);
		ConvexsRigidbody[i]=Convexs[i].GetComponent(Rigidbody);
	}
	
	var LineSum=LinesCount();
	//var Hinge=new HingeJoint[LineSum*2];
	var HingeSum1=new int[ConvexsSum];
	var HingeSum2=new int[ConvexsSum];
	//Convexs[0].AddComponent(FixedJoint);
	for (i=0;i<LineSum;i++)
	{
		var LineType=GetLineType(i);
		var Convex1=GetLineConvexs(i,0);
		var Convex2=GetLineConvexs(i,1);
		var Dot1=GetLineDot(i,0);
		var Dot2=GetLineDot(i,1);
		
		//var LineHinge1=new FixedJoint();
		//var LineHinge2=new FixedJoint();
		var LineHinge3=new HingeJoint();
		
		if (-1==Convex1) continue;
		if (-1==Convex2) continue;
		/*Convexs[Convex1].AddComponent(FixedJoint);
		HingeSum1[Convex1]++;
		LineHinge1=Convexs[Convex1].GetComponents(FixedJoint)[HingeSum1[Convex1]-1];
		LineHinge1.enableCollision=true;
		LineHinge1.connectedBody=ConvexsRigidbody[Convex2];
		LineHinge1.autoConfigureConnectedAnchor=false;
		LineHinge1.connectedAnchor=Dot1;
		LineHinge1.anchor=Dot1;
		LineHinge1.axis=-Dot1+Dot2;
		
		Convexs[Convex1].AddComponent(FixedJoint);
		HingeSum1[Convex1]++;
		LineHinge2=Convexs[Convex1].GetComponents(FixedJoint)[HingeSum1[Convex1]-1];
		LineHinge2.enableCollision=true;
		LineHinge2.connectedBody=ConvexsRigidbody[Convex2];
		LineHinge2.autoConfigureConnectedAnchor=false;
		LineHinge2.connectedAnchor=Dot2;
		LineHinge2.anchor=Dot2;
		LineHinge2.axis=-Dot1+Dot2;*/
		
		Convexs[Convex1].AddComponent(HingeJoint);
		HingeSum2[Convex1]++;
		LineHinge3=Convexs[Convex1].GetComponents(HingeJoint)[HingeSum2[Convex1]-1];
		LineHinge3.enableCollision=true;
		LineHinge3.connectedBody=ConvexsRigidbody[Convex2];
		LineHinge3.autoConfigureConnectedAnchor=false;
		LineHinge3.connectedAnchor=0.5*(Dot1+Dot2);
		LineHinge3.anchor=0.5*(Dot1+Dot2);
		LineHinge3.axis=-Dot1+Dot2;
		
		LineHinge3.spring.spring=400000;
		LineHinge3.spring.damper=100;
		LineHinge3.spring.targetPosition=180;
		LineHinge3.limits.min=0;
		LineHinge3.limits.max=180;
		LineHinge3.useSpring=true;
		LineHinge3.useLimits=true;
		if (LineType=="unfold") continue;
		
		var Delta=new Vector3();
		Delta=Center[Convex1]-Dot1;
		var Multi=new Vector3();
		Multi=Vector3.Cross(LineHinge3.axis,Delta);
		
		if (Multi.z<0)
		{
			if (LineType=="mountain")
			{
				//LineHinge1.axis=-LineHinge1.axis;
				//LineHinge2.axis=-LineHinge2.axis;
				LineHinge3.axis=-LineHinge3.axis;
			}
		}
		if (Multi.z>0)
		{
			if (LineType=="valley")
			{
				//LineHinge1.axis=-LineHinge1.axis;
				//LineHinge2.axis=-LineHinge2.axis;
				LineHinge3.axis=-LineHinge3.axis;
			}
		}
		
		
		
		/*LineHinge1.spring.spring=200000;
		LineHinge1.spring.damper=100;
		LineHinge1.spring.targetPosition=180;
		LineHinge1.limits.min=0;
		LineHinge1.limits.max=180;*/
		//Hinge[i*2]=LineHinge1;
		
		/*LineHinge2.spring.spring=200000;
		LineHinge2.spring.damper=100;
		LineHinge2.spring.targetPosition=180;
		LineHinge2.limits.min=0;
		LineHinge2.limits.max=180;
		Hinge[i*2+1]=LineHinge2;*/
	}
	
    }
	function Update () {

	}
	
}