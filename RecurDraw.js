function RecurDraw(frame,linksum,link)
{
    for (int i=0;i<linksum;i++)
	{
	    var framenow=document.createElement("div");
		var linknow=link[i];
		frame.appendChild(framenow);
		framenow.style.cssText=linknow.style.cssText;
		var url="GetFile.php?id="+parseInt(linknow);
		function GetFilereCall()
		{
    	    framenow.innerHTML=xmlHttpRequest.response;
		}
		xmlHttpRequest=createXmlHttpRequest();
		xmlHttpRequest.onreadystatechange=GetFilereCall;
		xmlHttpRequest.open("POST",url,false);
		xmlHttpRequest.send(null);
	}
}
