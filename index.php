<?php
$left=$_GET['left'];
$right=$_GET['right'];
$top=$_GET['top'];
$bottom=$_GET['bottom'];
?>
<!DOCTYPE HTML>
<html>
<head>
<script lang="javascript">
function Draw2(framenow,deep)
{
    if (deep>4) return;
    var link=[1];
	var linksum=1;
    RecurDraw(framenow,linksum,link,deep);
}
function Draw1(framenow,deep)
{
    if (deep>4) return;
    var link=[2];
	var linksum=1;
	RecurDraw(framenow,linksum,link,deep);
}
function RecurDraw(frame,linksum,link,deep)
{
    if (deep>4) return;
    for (var i=0;i<linksum;i++)
	{
	    var framenow=document.createElement("div");
		var linknow=document.getElementById("link"+link[i]);
		frame.appendChild(framenow);
		if (linknow!=undefined)
		    framenow.style.cssText=linknow.style.cssText;
		var url="GetFile.php?id="+link[i];
		function GetFilereCall()
		{
		    if (xmlHttpRequest.response=="") return;
    	    framenow.innerHTML=xmlHttpRequest.response;
			eval("Draw"+link[i]+"(framenow,deep+1);");
			delete(xmlHttpRequest);
		}
		var xmlHttpRequest=createXmlHttpRequest();
		xmlHttpRequest.onreadystatechange=GetFilereCall;
		xmlHttpRequest.open("POST",url,false);
		xmlHttpRequest.send(null);
	}
}
</script>
<script lang="javascript">
var mapleft=parseInt("<?=$left?>");
var mapright=parseInt("<?=$right?>");
var maptop=parseInt("<?=$top?>");
var mapbottom=parseInt("<?=$bottom?>");
var mapfontSize=16;
function Draw(id,left,right,top,bottom)
{
	var mapheight=window.innerHeight;
	var mapwidth=window.innerWidth;
	var drawleft=(mapwidth*(left-mapleft)/(mapright-mapleft));
	var drawright=(mapwidth*(right-mapleft)/(mapright-mapleft));
	var drawtop=(mapheight*(top-maptop)/(mapbottom-maptop));
	var drawbottom=(mapheight*(bottom-maptop)/(mapbottom-maptop));
	var StylefontSize=(16*(right-left)/(mapright-mapleft));
	if (StylefontSize<12) StylefontSize=0;
	var Styleleft=drawleft.toString()+"px";
	var Styletop=drawtop.toString()+"px";
	var Stylewidth=(drawright-drawleft).toString()+"px";
	var Styleheight=(drawbottom-drawtop).toString()+"px";
	id.style.left=Styleleft;
	id.style.top=Styletop;
	id.style.width=Stylewidth;
	id.style.height=Styleheight;
	id.style.position="absolute";
	id.style.fontSize=StylefontSize+"pt";
}
</script>
<script lang="javascript">
function createXmlHttpRequest()
{
    if(window.ActiveXObject)
	{
	    return new ActiveXObject("Microsoft.XMLHTTP");
	}
	else if(window.XMLHttpRequest)
	{
	 	return new XMLHttpRequest();
	}
}
var xmlHttpRequest;
function reCall()
{
    //alert(xmlHttpRequest.response);
    eval(xmlHttpRequest.response);
}
function onDraw()
{
    var body=document.getElementsByTagName("body")[0];
	if (body!=undefined) body.innerHTML="";
    var url="Draw.php?left="+mapleft+"&right="+mapright+"&top="+maptop+"&bottom="+mapbottom;
	
	xmlHttpRequest=createXmlHttpRequest();
	xmlHttpRequest.onreadystatechange=reCall;
	xmlHttpRequest.open("POST",url,false);
	xmlHttpRequest.send(null);
}  
function mousePosition(event)
{
	return{X:event.pageX,Y:event.pageY};
}
document.onmousemove=mouseMove;
var mouseX,mouseY;
var Draft;
document.onmousedown=mouseDown;
function mouseDown(event)
{
    event=event||window.event;
	var mouse=mousePosition(event);
	mouseX=mouse.X;
	mouseY=mouse.Y;
	Draft=true;
}
document.onmouseup=mouseUp;
function mouseUp(event)
{
    event=event||window.event;
	event.preventDefault();
	var mouse=mousePosition(event);
	//reDraw(mouse);
	Draft=false;
}
function reDraw(mouse)
{
    var mapheight=window.innerHeight;
    var mapwidth=window.innerWidth;
	var newleft=mapleft-((mouse.X-mouseX)*(mapright-mapleft)/mapwidth);
    var newright=mapright-((mouse.X-mouseX)*(mapright-mapleft)/mapwidth);
    var newtop=maptop-((mouse.Y-mouseY)*(mapbottom-maptop)/mapheight);
	var newbottom=mapbottom-((mouse.Y-mouseY)*(mapbottom-maptop)/mapheight);
	mapleft=newleft;
	mapright=newright;
	maptop=newtop;
	mapbottom=newbottom;
	onDraw();
}
function mouseMove(event)
{
    event=event||window.event;
	event.preventDefault();
	var mouse=mousePosition(event);
	if (Draft)
	{
	    reDraw(mouse);
	}
	mouseX=mouse.X;
	mouseY=mouse.Y;
}
document.onmousewheel=mouseWheel;
function mouseWheel(event)
{
    event=event||window.event;
	event.preventDefault();
	if (event.wheelDelta)
	{
	    var Radio;
		if (event.wheelDelta>0) Radio=0.8;
		    else Radio=1/0.8;
	    var mouse=mousePosition(event);
	    var mapheight=window.innerHeight;
		var mapwidth=window.innerWidth;
		var mapX=(mouse.X*(mapright-mapleft)/mapwidth)+mapleft;
		var mapY=(mouse.Y*(mapbottom-maptop)/mapheight)+maptop;
		var newleft=mapX+((mapleft-mapX)*Radio);
		var newright=mapX+((mapright-mapX)*Radio);
		var newtop=mapY+((maptop-mapY)*Radio);
		var newbottom=mapY+((mapbottom-mapY)*Radio);
		mapleft=newleft;
		mapright=newright;
		maptop=newtop;
		mapbottom=newbottom;
		onDraw();
	}
}
</script>
</head>
<body onresize="onDraw()" style="overflow:hidden;font-size:16pt">
<script>
onDraw();
</script>
</body>
</html>