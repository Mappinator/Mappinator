<?php
     $CP=$_POST["CP"];
     $File=fopen("Fold.cp","w");
     fwrite($File,$CP);
     fclose($File);
	 echo "successful";
?>