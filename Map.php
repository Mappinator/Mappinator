<?php
$left=$_GET['left'];
$right=$_GET['right'];
$top=$_GET['top'];
$bottom=$_GET['bottom'];
?>

<html>
<head>
<link rel="stylesheet" href="Map.css" type="text/css"></link>
<script language="javascript">
var mapleft=parseInt("<?=$left?>");
var mapright=parseInt("<?=$right?>");
var maptop=parseInt("<?=$top?>");
var mapbottom=parseInt("<?=$bottom?>");
var windowheight=window.innerHeight;
var windowwidth=window.innerWidth;
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
var HTML=new Array();
function GetHTML(element,fontsize)
{
    var id=element.id;
    if (undefined==HTML[parseInt(id)])
	{
	    var url="GetFile.php?id="+id;
		var xmlHttpRequest=createXmlHttpRequest();
		xmlHttpRequest.onreadystatechange=function HTMLGet(){
		    if (4!=xmlHttpRequest.readyState) return;
		    HTML[parseInt(id)]=xmlHttpRequest.response;
		    element.innerHTML=xmlHttpRequest.response;
			var child=new Array();
			for (var i=0;i<element.children.length;i++)
			{
	    	    child[i]=element.children[i];
			}
			var childlength=element.children.length;
			for (var i=0;i<childlength;i++)
			{
	            Map(child[i],fontsize*parseInt(child[i].style.fontSize)/100);
			}
		};
		xmlHttpRequest.open("POST",url,true);
		xmlHttpRequest.send(null);
	}
	else 
	{
	    element.innerHTML=HTML[parseInt(id)];
		var child=new Array();
		for (var i=0;i<element.children.length;i++)
		{
	        child[i]=element.children[i];
		}
	    var childlength=element.children.length;
	    for (var i=0;i<childlength;i++)
	    {
	        Map(child[i],fontsize*parseInt(child[i].style.fontSize)/100);
	    }
	}
}
function Map(element,fontsize)
{
    var least=0.01;
	if (fontsize<12&&0==element.children.length)
	{
	    element.style.fontSize="0pt";
	}
	if (element.offsetHeight/windowheight<least)
	{ 
	    element.parentNode.removeChild(element);
	    return;
	}
	if (element.offsetWidth/windowwidth<least)
	{ 
	    element.parentNode.removeChild(element);
	    return;
	}
	if (element.className=="link")
	{
		GetHTML(element,fontsize);
		return;
	}
	var child=new Array();
	for (var i=0;i<element.children.length;i++)
	{
	    child[i]=element.children[i];
	}
	var childlength=element.children.length;
	for (var i=0;i<childlength;i++)
	{
	    Map(child[i],fontsize*parseInt(child[i].style.fontSize)/100);
	}
}
function reCall()
{
    if (4!=xmlHttpRequest.readyState) return;
    document.body.innerHTML=xmlHttpRequest.response;
	document.body.style.fontSize=(windowheight/(mapbottom-maptop)*16)+"pt";
	Map(document.body,mapfontSize);
}
function Draw()
{
    document.body.style.fontSize=mapfontSize+"pt";
    var url="GetMap.php?left="+mapleft+"&right="+mapright+"&top="+maptop+"&bottom="+mapbottom;
	xmlHttpRequest=createXmlHttpRequest();
	xmlHttpRequest.onreadystatechange=reCall;
	xmlHttpRequest.open("POST",url,false);
	xmlHttpRequest.send(null);
}

var mapfontSize=16;
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
	Draw();
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
		mapfontSize=mapfontSize/Radio;
		mapleft=newleft;
		mapright=newright;
		maptop=newtop;
		mapbottom=newbottom;
		Draw();
	}
}
</script>
</head>
<body onresize="Draw()" style="overflow:hidden;font-size:16pt">
<script>
Draw();
</script>
</body>
</html>