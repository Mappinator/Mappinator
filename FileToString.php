<?php
function FileToString($filename,$tran)
{
    $file=fopen($filename,"r");
	$string="";
	if ($file)
	{
	    while (!feof($file))
		{
	        $now=fgets($file,2);
			if ($now==='"'&&$tran) 
			{
			    $string=$string.'\\';
				$string=$string.'"';
				continue;
			}
			$string=$string.$now;
		}
	}
	fclose($file);
	$string=str_replace("\n","",$string);
	$string=str_replace("\r","",$string);
	return $string;
}
?>