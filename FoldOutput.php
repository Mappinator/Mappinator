<?php
     error_reporting(E_ALL^E_NOTICE);
     $CP=$_POST["CP"];
	 $FileName=$_POST["FileName"];
     $File=fopen($FileName.".cp","w");
     fwrite($File,$CP);
     fclose($File);
	 echo "successful";
?>