<?php
include 'FileToString.php';
include 'simple_html_dom.php';
$left=$_GET['left'];
$right=$_GET['right'];
$top=$_GET['top'];
$bottom=$_GET['bottom'];
function Getstyle($stylestring)
{
    $state=1;
	$properity="";
	$value="";
	$style=array();
	$style['width']=0;
	$style['height']=0;
    for ($i=0;$i<strlen($stylestring);$i++)
	{
	    if ($stylestring[$i]==":")
		{
		    $state=2;
			continue;
		}
		if ($stylestring[$i]==";")
		{
		    if ($value[strlen($value)-1]=="%")
			{
			    $style[$properity]=floatval($value)/100;
			}
			else
		    $style[$properity]=$value;
			$state=1;
			$properity="";
			$value="";
			continue;
		}
	    if ($state==1) $properity=$properity.$stylestring[$i];
		if ($state==2) $value=$value.$stylestring[$i];
	}
	return $style;
}
function HTML($id,$html,$element,$height,$width)
{
    if (null==$html)
	{
	    $result=mysql_query("select * from map where id=".$id." ");
		$row=mysql_fetch_array($result);
	    $html=file_get_html($row['link'].".php");
		$element=$html->root;
	}
    $least=0.01;
    if ($height<$least&&$element==$html->root) return "";
	if ($width<$least&&$element==$html->root) return "";
	if ("link"==$element->tag)
	{
	    $style=Getstyle($element->style);
	    $linkHTML=HTML($element->id,null,null,$height,$width);
		if ($linkHTML!="")
		{
		     $div=str_get_html("<div style=\"".$element->style."\">".$linkHTML."</div>")->root;
			 $element->appendChild($div);
		}
		return "";
	}
	foreach($element->children as $child)
	{
	    $style=Getstyle($child->style);
	    HTML($id,$html,$child,$height*$style['height'],$width*$style['width']);
	}
	if ($element==$html->root)
	{
	    return $html->save();
	}
	return "";
}

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
	echo "<div style=\"position:absolute;left:".(($mapleft-$left)/$width*100)."%".";top:".(($maptop-$top)/$height*100)."%".";height:".($mapheight/$height*100)."%".";width:".($mapwidth/$width*100)."%".";\">";
	echo HTML($id,null,null,$mapheight/$height,$mapwidth/$width);
	echo "</div>";
}

?>