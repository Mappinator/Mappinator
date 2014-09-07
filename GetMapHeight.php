<?php 
$id=$_GET['id'];
$connect=mysql_connect("localhost","root","IWillBeWithUForever");
mysql_select_db("mappinator",$connect);
$result=mysql_query("select * from map where id=".$id." ");
while ($row=mysql_fetch_array($result))
{
    echo ($row['mapbottom']-$row['maptop']);
}