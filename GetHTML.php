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
	$html=file_get_html($row['link'].".php");
	echo $html->save();
}

?>