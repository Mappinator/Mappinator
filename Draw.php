<?php
include 'FileToString.php';
$left=$_GET['left'];
$right=$_GET['right'];
$top=$_GET['top'];
$bottom=$_GET['bottom'];
$connect=mysql_connect("localhost","root","IWillBeWithUForever");
mysql_select_db("mappinator",$connect);
$result=mysql_query("select * from map where mapright>=".$left." and mapleft<=".$right." and maptop<=".$bottom." and mapbottom>=".$top." ");
while ($row=mysql_fetch_array($result))
{
    $filephp=$row['link'].".php";
	$filejs=$row['link'].".js";
	$php=FileToString($filephp,true);
	$js=FileToString($filejs,false);
	$id=$row['id'];
	$mapleft=$row['mapleft'];
	$mapright=$row['mapright'];
	$maptop=$row['maptop'];
	$mapbottom=$row['mapbottom'];
	echo "var div".$id."=document.createElement(\"div\");";
	echo "document.body.appendChild(div".$id.");";
	echo "div".$id.".innerHTML=\"$php\";";
	echo "div".$id.".id=\"frame".$id."\";";
	echo "Draw(div".$id.",$mapleft,$mapright,$maptop,$mapbottom);";
	echo $js;
	echo "Draw".$id."(frame".$id.",0);";
}
?>