<?php
$left=$_GET['left'];
$right=$_GET['right'];
$top=$_GET['top'];
$bottom=$_GET['bottom'];
?>
<html>
<head>
</head>
<body>
<script language="javascript">
var mapleft=parseInt("<?=$left?>");
var mapright=parseInt("<?=$right?>");
var maptop=parseInt("<?=$top?>");
var mapbottom=parseInt("<?=$bottom?>");
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
    document.body.innerHTML=xmlHttpRequest.response;
}
function Draw()
{
    var url="GetHTML.php?left="+mapleft+"&right="+mapright+"&top="+maptop+"&bottom="+mapbottom;
	xmlHttpRequest=createXmlHttpRequest();
	xmlHttpRequest.onreadystatechange=reCall;
	xmlHttpRequest.open("POST",url,false);
	xmlHttpRequest.send(null);
}
Draw();
</script>
</body>
</html>