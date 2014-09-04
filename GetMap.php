<?php
include 'FileToString.php';
include 'simple_html_dom.php';
$left=$_GET['left'];
$right=$_GET['right'];
$top=$_GET['top'];
$bottom=$_GET['bottom'];
$connect=mysql_connect("localhost","root","IWillBeWithUForever");
mysql_select_db("mappinator",$connect);
$result=mysql_query("select * from map where mapright>=".$left." and mapleft<=".$right." and maptop<=".$bottom." and mapbottom>=".$top." ");
while ($row=mysql_fetch_array($result))
{
    $mapleft=$row['mapleft'];
	$mapright=$row['mapright'];
	$mapwidth=$mapright-$mapleft;
	$maptop=$row['maptop'];
	$mapbottom=$row['mapbottom'];
	$mapheight=$mapbottom-$maptop;
	$height=$bottom-$top;
	$width=$right-$left;
	$id=$row['id'];
	echo "<div id=\"".$id."\" class=\"link\" style=\"position:absolute;left:".(($mapleft-$left)/$width*100)."%".";top:".(($maptop-$top)/$height*100)."%".";height:".($mapheight/$height*100)."%".";width:".($mapwidth/$width*100)."%".";\"></div>";
}

?>