		    document.write("<script lang=\"javascript\" src=\"json.js\"></script>");
			function createXmlHttpRequest(){
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
			var statebar={
			    type:"statusbar",
				draw:function(editor)
				{
				    editor.context.beginPath();
					editor.context.fillStyle="black";
					editor.context.font="30px Arial";
					editor.context.fillText(editor.mode,editor.width*5/6,editor.width*5/60);
					
					editor.context.font="20px Arial";
					editor.context.fillText("unit "+Math.floor(editor.unitx*100)/100+" "+Math.floor(editor.unity*100)/100,editor.width*5/6,editor.width*5/120);
					if (editor.mode=="modify")
					{
					    editor.context.font="20px Arial";
					    editor.context.fillText("sqrt "+editor.scale,editor.width*5/6,editor.width*5/120*3);
					}
					if (editor.mode=="output")
					{
					    editor.context.font="20px Arial";
					    editor.context.fillText(editor.outputstate,editor.width*5/6,editor.width*5/120*3);
					}
					editor.context.closePath();
					editor.context.fill();
				}
			};
			var editor={
			    type:"editor",
				left:0,
				right:100,
				top:0,
				bottom:100,
				width:800,
				height:800,
				unitx:10,
				unity:10,
				scale:0,
				x:-1,
				y:-1,
				lastx:-1,
				lasty:-1,
				dots:Array(),
				lines:Array(),
				selected:Array(),
				convexs:Array(),
				move:"not",
				context:Object,
				canvas:Object,
				statusbar:statebar,
				outputstate:"sleeping",
				outputfilename:"",
				mode:"draw",
				//find crossover [dot]
				init:function(parent)
				{
				    this.statusbar=Object.create(statebar);
				    this.canvas=document.createElement("canvas");
					parent.appendChild(this.canvas);
					this.canvas.className="mapeditor";
					var mapeditor=this;
					this.context=this.canvas.getContext('2d');
					this.canvas.onmousewheel=function(event){
			    	    event.preventDefault();
			    	    mapeditor.onmousewheel(event);	    
					};
					this.canvas.onmousedown=function(event){
			    	    event.preventDefault();
			    	    mapeditor.onmousedown(event);
					};
					this.canvas.onmouseup=function(event){
			            event.preventDefault();
			    	    mapeditor.move="not";
					};
					this.canvas.onmousemove=function(event){
			    	    event.preventDefault();
			    	    mapeditor.onmousemove(event);	
					};
					parent.onkeypress=function(event){
			    	    event.preventDefault();
					    mapeditor.onkeypress(event);
					};
					parent.ondragstart=function(event){
			    	    event.preventDefault();
					};
					parent.ondragover=function(event){
			    	    event.preventDefault();
					};
					parent.ondragenter=function(event){
			    	    event.preventDefault();
					};
					parent.ondrop=function(event){
			    	    event.preventDefault();
					    var file=event.dataTransfer.files[0];
					    var reader=new FileReader();
						//input from file
						reader.onload=function(file)
						{
				            //[TEST]
				   	        //if (this.mode!="input") return;
				    		mapeditor.selected=new Array();
							mapeditor.outputstate="sleeping";
				    		var result=JSON.parse(this.result);
						    mapeditor.input(result);
					    };
					    reader.readAsBinaryString(file);
					};
					//init [editor]'s width & height
					this.canvas.width=this.width;
					this.canvas.height=this.height;	
					this.draw();
				},
				crossdot:function(line1,line2)
				{
				    var LineA1,LineB1,LineC1;
					LineA1=line1.B.y-line1.A.y;
					LineB1=-(line1.B.x-line1.A.x);
					LineC1=line1.A.y*(line1.B.x-line1.A.x)-line1.A.x*(line1.B.y-line1.A.y);
					
					var LineA2,LineB2,LineC2;
					LineA2=line2.B.y-line2.A.y;
				    LineB2=-(line2.B.x-line2.A.x);
					LineC2=line2.A.y*(line2.B.x-line2.A.x)-line2.A.x*(line2.B.y-line2.A.y);
					
					if (Math.abs((LineA1*LineB2-LineB1*LineA2))<0.0001) return null;
					
					var Crossx,Crossy;
					Crossy=-(LineA1*LineC2-LineA2*LineC1)/(LineA1*LineB2-LineB1*LineA2);
					Crossx=(LineB1*LineC2-LineB2*LineC1)/(LineA1*LineB2-LineB1*LineA2);
					
					if (Crossx<Math.min(line1.A.x,line1.B.x)) return null;
					if (Crossx>Math.max(line1.A.x,line1.B.x)) return null;
					if (Crossx<Math.min(line2.A.x,line2.B.x)) return null;
					if (Crossx>Math.max(line2.A.x,line2.B.x)) return null;
					
					if (Crossy<Math.min(line1.A.y,line1.B.y)) return null;
					if (Crossy>Math.max(line1.A.y,line1.B.y)) return null;
					if (Crossy<Math.min(line2.A.y,line2.B.y)) return null;
					if (Crossy>Math.max(line2.A.y,line2.B.y)) return null;
					
					if (this.existdot(Crossx,Crossy)) return null;
					var dotnew=this.createdot(Crossx,Crossy,0.5,"real","black");
					return dotnew;
					
				},
				//input from file
				input:function(file){
				    for (var index in file)
					{
					    if (typeof(file[index])=="function") continue;
						if (typeof(file[index])=="object")
					    {
						    if (index!="dots"&&index!="lines"&&index!="convexs") continue;
							this[index]=new Array();
							for (var i=0;i<file[index].length;i++)
							{
							    var file2=file[index][i];
							    var objnow;
								if (index=="dots") objnow=Object.create(dot);
								if (index=="lines") objnow=Object.create(line);
								if (index=="convexs") objnow=Object.create(convex);

								for (var index2 in file2)
								{
								    if (typeof(file2[index2])=="function") continue;
									if (typeof(file2[index2])=="object") continue;
									if (index2=="A"||index2=="B") continue;
									objnow[index2]=file2[index2];
								}
								this[index].push(objnow);
							}
						    continue;
						}
						if (index=="outputstate") continue;
						this[index]=file[index];
					}
					for (var index in file)
					{
					    if (typeof(file[index])=="object")
						{
						    if (index!="dots"&&index!="lines"&&index!="convexs") continue;
							for (var i=0;i<file[index].length;i++)
							{
							    var file2=file[index][i];
								for (var index2 in file2)
								{
								    if (index2=="A"||index2=="B")
									{
										this[index][i][index2]=this["dots"][file2[index2]];
									}
									if (index2=="convexA"||index2=="convexB")
									{
									    this[index][i][index2]=this["convexs"][file2[index2]];
									}
								    if (typeof(file2[index2])=="object")
									{
									    
									    this[index][i][index2]=new Array();
										for (var j=0;j<file2[index2].length;j++)
										{
										    this[index][i][index2].push(this[index2][file2[index2][j]]);
										}
									}
								}
							}
						} 
					}
				},
				// create a convex ( with dots )
				createconvex:function(dotset){
				    var convexnew=Object.create(convex);
					convexnew.dots=dotset;
					convexnew.lines=new Array();
					
					for (var i=0;i<dotset.length;i++)
					{
					    var linebetween=this.existline(dotset[i],dotset[(i+1>dotset.length-1)?0:i+1]);
					    convexnew.lines.push(linebetween);
						linebetween.position="border";
					}
					this.convexs.push(convexnew);
					return convexnew;
				},
				// [TEST] color orange to black
				/*orangetoblack:function(){
				    for (var i=0;i<this.lines.length;i++)
					{
					    if (this.lines[i].color=="orange")
						{
						    this.lines[i].color="black";
						}
					}
					this.draw();
				},*/
				// output cp file ( with convexs )
				output:function(url,data,editor){
		            var xmlHttpRequest=createXmlHttpRequest();
		            xmlHttpRequest.onreadystatechange=function outputed(){
					    if (xmlHttpRequest.readystate<4) return;
						alert(xmlHttpRequest.responseText);
					    if (xmlHttpRequest.responseText=="successful")
						{
						    editor.outputstate="successful";
							editor.draw();
						}
						else
						{
						    editor.outputstate="failed";
							editor.draw();
						}
				    };
		            xmlHttpRequest.open("POST",url,true);
					xmlHttpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		            xmlHttpRequest.send(data);
				},
				// save cp file ( without convexs )
				save:function(url,data,editor){
		            var xmlHttpRequest=createXmlHttpRequest();
		            xmlHttpRequest.onreadystatechange=function outputed(){
					    if (xmlHttpRequest.readystate<4) return;
					    if (xmlHttpRequest.responseText=="successful")
						{
						    editor.outputstate="saved";
							editor.draw();
						}
						else
						{
						    editor.outputstate="failed";
							editor.draw();
						}
				    };
		            xmlHttpRequest.open("POST",url,true);
					xmlHttpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		            xmlHttpRequest.send(data);
				},
				// create a dot ( with x , y , r , reality & color )
				createdot:function(x,y,r,reality,color){
				    var dotnew=Object.create(dot);
				    dotnew.x=x;
				    dotnew.y=y;
					dotnew.realx=x;
					dotnew.realy=y;
				    dotnew.r=r;
				    dotnew.reality=reality;
					dotnew.color=color;
					dotnew.lines=new Array();
					this.dots.push(dotnew);
					return dotnew;
				},
				// create a line ( with A[dot] , B[dot] , width , reality , color )
				createline:function(A,B,width,reality,color){
				    var linenew=Object.create(line);
					linenew.reality=reality;
					linenew.color=color;
					linenew.A=A;
					linenew.B=B;
					linenew.width=width;
					this.lines.push(linenew);
									
					linenew.A.lines.push(linenew);
					linenew.B.lines.push(linenew);
				    
					if (reality=="real")
					for (var i=0;i<this.lines.length;i++)
					{
					    if (this.lines[i]==linenew) continue;
						var dotnew=this.crossdot(this.lines[i],linenew);
						if (dotnew==null) continue;
						this.createline(dotnew,this.lines[i].A,width,reality,color);
						this.createline(dotnew,this.lines[i].B,width,reality,color);
						this.createline(dotnew,linenew.A,width,reality,color);
						this.createline(dotnew,linenew.B,width,reality,color);
					    linenew.visible="invisible";
						this.lines[i].visible="invisible";
						this.eraseinvisible();
						return;
					}
				},
				// redraw
				draw:function(){
				    this.context.clearRect(0,0,mapeditor.width,mapeditor.height);
		            
					for (var i=0;i<this.lines.length;i++)
					{
					    this.lines[i].draw(this);
					}
					
					for (var i=0;i<this.dots.length;i++)
					{
					    this.dots[i].draw(this);
					}
					
					this.statusbar.draw(this);
				},
				// erase invisible [dot] & [line]
				eraseinvisible:function(){
				    for (var i=0;i<this.dots.length;i++)
					{
					    if (this.dots[i].visible=="invisible")
						{
						    this.dots[i].invert(this);
						    this.dots.splice(i,1);
							i--;
						}
					}
					for (var i=0;i<this.lines.length;i++)
					{
					    if (this.lines[i].visible=="invisible")
						{
						    this.lines[i].invert(this);
						    this.lines.splice(i,1);
							i--;
						}
					}
					this.draw();
				},
				// set invisible [dot] & [line] to visible
				revisible:function(){
				    for (var i=0;i<this.dots.length;i++)
					{
					    if (this.dots[i].visible=="invisible")
						{
						    this.dots[i].visible="visible";
						}
					}
					for (var i=0;i<this.lines.length;i++)
					{
					    if (this.lines[i].visible=="invisible")
						{
						    this.lines[i].visible="visible";
						}
					}
				},
				// erase vitual [dot] & [line]
				erasevitual:function(){
				    for (var i=0;i<this.dots.length;i++)
					{
					    if (this.dots[i].reality=="vitual")
						{
						    this.dots.splice(i,1);
							i--;
						}
					}
					for (var i=0;i<this.lines.length;i++)
					{
					    if (this.lines[i].reality=="vitual")
						{
						    this.lines.splice(i,1);
							i--;
						}
					}
					for (var i=0;i<this.dots.length;i++)
					{
					    for (var j=0;j<this.dots[i].lines.length;j++)
						{
						    if (-1==this.dots[i].lines[j].label(this))
							{
							    this.dots[i].lines.splice(j,1);
								j--;
							}
						}
					}
					this.draw();
				},
				// back to real position
				backtoreal:function(){
				    for (var i=0;i<this.dots.length;i++)
					{
					    this.dots[i].x=this.dots[i].realx;
						this.dots[i].y=this.dots[i].realy;
					}
				},
				// erase lightskyblue (selected) [dot] & [line]
				eraselightskyblue:function(){
				    for (var i=0;i<this.dots.length;i++)
					{
					    if (this.dots[i].color=="lightskyblue")
						{
					        if (this.dots[i].selected=="selected")
							{
							    this.dots[i].color="plum";
							}
							else
							{
							    this.dots[i].color="black";
							}
						}
					}
					for (var i=0;i<this.lines.length;i++)
					{
					    if (this.lines[i].color=="lightskyblue")
						{
						    if (this.lines[i].selected=="selected")
							{
							    this.lines[i].color="plum";
							}
							else
							{
							    if (this.lines[i].foldtype=="unfold")
								{
								    this.lines[i].color="black";
								}
								if (this.lines[i].foldtype=="mountain")
								{
								    this.lines[i].color="royalblue";
								}
								if (this.lines[i].foldtype=="valley")
								{
								    this.lines[i].color="crimson";
								}
							}
						    
						}
					}
					this.draw();
				},
				// cmp [dot]
				dotcmp:function(dotA,dotB){
				    if (dotA.x>dotB.x) return 1;
					if (dotA.x<dotB.x) return -1;
					if (dotA.y>dotB.y) return 1;
					if (dotA.y<dotB.y) return -1;
					return -1;
				},
				// cmp [line]
				linecmp:function(lineA,lineB){
				    var dotA,dotB,dotC;
				    if (lineA.A==lineB.A) dotA=lineA.A;
					if (lineA.B==lineB.A) dotA=lineA.B;
					if (lineA.A==lineB.B) dotA=lineA.A;
					if (lineA.B==lineB.B) dotA=lineA.B;
					if (dotA==lineA.A) dotB=lineA.B;
					if (dotA==lineA.B) dotB=lineA.A;
					if (dotA==lineB.A) dotC=lineB.B;
					if (dotA==lineB.B) dotC=lineB.A;
					
					var ABdx=dotB.x-dotA.x;
					var ABdy=dotB.y-dotA.y;
					var ACdx=dotC.x-dotA.x;
					var ACdy=dotC.y-dotA.y;
					
					return Math.atan2(ABdy,ABdx)-Math.atan2(ACdy,ACdx);
				},
				// set vitual [dot] & [line] to real
				vitualtoreal:function(){
				    for (var i=0;i<this.dots.length;i++)
					{
					    if (this.dots[i].reality=="vitual")
						{
						    this.dots[i].reality="real";
							this.dots[i].color="black";
							for (var j=0;j<this.lines.length;j++)
							{
							    if (this.lines[j].reality=="vitual") continue;
							    var dotA=this.lines[j].A;
								var dotB=this.lines[j].B;
								var LineA,LineB,LineC;
					    		LineA=dotB.y-dotA.y;
								LineB=-(dotB.x-dotA.x);
								LineC=dotA.y*(dotB.x-dotA.x)-dotA.x*(dotB.y-dotA.y);
								if (Math.abs(this.dots[i].x*LineA+this.dots[i].y*LineB+LineC)<0.0001)
								{
								    if (this.dots[i].x<Math.min(dotA.x,dotB.x)) continue;
									if (this.dots[i].x>Math.max(dotA.x,dotB.x)) continue;
									if (this.dots[i].y<Math.min(dotA.y,dotB.y)) continue;
									if (this.dots[i].y>Math.max(dotA.y,dotB.y)) continue;
									
									
									this.createline(this.dots[i],this.lines[j].A,1,"vitual","grey");
									
									
									this.createline(this.dots[i],this.lines[j].B,1,"vitual","grey");
									
									this.lines[j].visible="invisible";
									this.eraseinvisible(); 
									 
									j--;
									
								}
							}
							//this.vitualtoreal();
						}
					}
					for (var i=0;i<this.lines.length;i++)
					{
					    if (this.lines[i].reality=="vitual")
						{
						    if (this.lines[i].color!="grey")
							{
							    if (this.lines[i].color=="orange")
								{
								    var dotA=this.lines[i].A;
									var dotB=this.lines[i].B;
									var deltax=Math.abs(dotA.x-dotB.x);
									var deltay=Math.abs(dotA.y-dotB.y);
									
									if (deltax!=0) this.unitx=deltax;
									if (deltay!=0) this.unity=deltay;
									
									dotA.invert(this);
									dotB.invert(this);
									continue;
								}
							}
						    var dotA=this.lines[i].A;
							var dotB=this.lines[i].B;
							var LineA,LineB,LineC;
					    	LineA=dotB.y-dotA.y;
							LineB=-(dotB.x-dotA.x);
							LineC=dotA.y*(dotB.x-dotA.x)-dotA.x*(dotB.y-dotA.y);
						    
							var dotset=new Array();
							dotset.push(dotA);
							dotset.push(dotB);
							for (var j=0;j<this.dots.length;j++)
							{
							    if (this.dots[j]==dotA) continue;
								if (this.dots[j]==dotB) continue;
								
								if (this.dots[j].x<Math.min(dotA.x,dotB.x)) continue;
								if (this.dots[j].x>Math.max(dotA.x,dotB.x)) continue;
								if (this.dots[j].y<Math.min(dotA.y,dotB.y)) continue;
								if (this.dots[j].y>Math.max(dotA.y,dotB.y)) continue;
								
								var dotnow=this.dots[j];
								if (Math.abs(dotnow.x*LineA+dotnow.y*LineB+LineC)<0.0001)
								{
								    dotset.push(dotnow);
								}
								
							}
							dotset.sort(this.dotcmp);
							for (var j=0;j<dotset.length-1;j++)
							{
							    dotset[j].invert(this);
								dotset[j+1].invert(this);
							    if (this.existline(dotset[j],dotset[j+1])) continue;
							
								this.createline(dotset[j],dotset[j+1],1,"real","black");
							}
						}
					}
					this.draw();
				},
				// find near [dot] & [line] ( dot first )
				near:function(){
				    var dot=this.neardot();
					if (dot!=null) return dot;
					
					if (this.mode=="draw") return null;
					
					var line=this.nearline();
					if (line!=null) return line;
					return null;
				},
				// find near [dot]
				neardot:function(){
				    for (var i=0;i<this.dots.length;i++)
					{
					    var times=2;
					    if ((this.dots[i].x-this.x)*(this.dots[i].x-this.x)+(this.dots[i].y-this.y)*(this.dots[i].y-this.y)<times*times*this.dots[i].r*this.dots[i].r)
						{
						    if (this.dots[i].reality=="vitual") continue;
						    return this.dots[i];
						}
					}
					return null;
				},
				// find near [line]
				nearline:function(){
				    for (var i=0;i<this.lines.length;i++)
					{
					    var dotA=this.lines[i].A;
						var dotB=this.lines[i].B;
						var times=1;
					    if (this.x>Math.max(dotA.x,dotB.x)+times*this.lines[i].width) continue;
						if (this.x<Math.min(dotA.x,dotB.x)-times*this.lines[i].width) continue;
						if (this.y>Math.max(dotA.y,dotB.y)+times*this.lines[i].width) continue;
						if (this.y<Math.min(dotA.y,dotB.y)-times*this.lines[i].width) continue;
						
					    var LineA,LineB,LineC;
					    LineA=dotB.y-dotA.y;
						LineB=-(dotB.x-dotA.x);
						LineC=dotA.y*(dotB.x-dotA.x)-dotA.x*(dotB.y-dotA.y);
						var Dis=Math.abs(LineA*this.x+LineB*this.y+LineC)/Math.sqrt(LineA*LineA+LineB*LineB);
						if (Dis<times*this.lines[i].width)
						{
						    if (this.lines[i].reality=="vitual") continue;
						    return this.lines[i];
						}
					}
					return null;
				},
				// find if there is a [dot]
				existdot:function(mapx,mapy){
				    for (var i=0;i<this.dots.length;i++)
					{
					    if (this.dots[i].reality!="real") continue;
					    if (Math.abs(this.dots[i].x-mapx)<0.0001&&Math.abs(this.dots[i].y-mapy)<0.0001)
						{
						    return this.dots[i];
						}
					}
					return null;
				},
				// find if there is a [line]
				existline:function(dotA,dotB){
				    for (var i=0;i<this.lines.length;i++)
					{
					    if (this.lines[i].reality!="real") continue;
					    if (this.lines[i].A==dotA&&this.lines[i].B==dotB)
						{
						    return this.lines[i];
						}
						if (this.lines[i].A==dotB&&this.lines[i].B==dotA)
						{
						    return this.lines[i];
						}
					}
					return null;
				},
				//[event] onmousemove
				onmousemove:function(event){
				    event=event||window.event;
				
				    this.revisible();
					this.erasevitual();
				    this.eraselightskyblue();
				    this.backtoreal();
				
			        var x=event.offsetX;
				    var y=event.offsetY;
				
				    var mapx=x/this.width*(this.right-this.left)+this.left;
				    var mapy=y/this.height*(this.bottom-this.top)+this.top;
				    this.x=mapx;
				    this.y=mapy;
				    // move
				    if (this.move=="move")
				    {
				        var deltax=this.x-this.lastx;
					    var deltay=this.y-this.lasty;
					    this.left-=deltax;
					    this.right-=deltax;
					    this.top-=deltay;
					    this.bottom-=deltay;
				    }
				    // find near
				    var near=this.near();
				    if (near!=null) 
				    {  
				        near.onmousemove(this);
				    }
					// find proper dot ( with unitx & unity )
				    if (this.selected.length==0&&this.mode=="draw")
					{
					    var nearx;
						var neary;
						var unitx=this.unitx;
						var unity=this.unity;
						
						var LeftX=-1;
						var RightX=-1;
						var TopY=-1;
						var BottomY=-1;
						for (var i=0;i<this.dots.length;i++)
						{
						    var dotnow=this.dots[i];
							if (-1==LeftX&&dotnow.x<=this.x)
							{
							    LeftX=dotnow.x;
							}
							else if (dotnow.x<=this.x&&dotnow.x>LeftX)
							{
							    LeftX=dotnow.x;   
							}
							if (-1==RightX&&dotnow.x>=this.x)
							{
							    RightX=dotnow.x;
							}
							else if (dotnow.x>=this.x&&dotnow.x<RightX)
							{
							    RightX=dotnow.x;
							}
							
							if (-1==TopY&&dotnow.y<=this.y)
							{
							    TopY=dotnow.y;
							}
							else if (dotnow.y<=this.y&&dotnow.y>TopY)
							{
							    TopY=dotnow.y;
							}
							if (-1==BottomY&&dotnow.y>=this.y)
							{
							    BottomY=dotnow.y;
							}
							else if (dotnow.y>=this.y&&dotnow.y<BottomY)
							{
							    BottomY=dotnow.y;
							}
							
						}
						
						if (-1==LeftX&&-1==RightX)
						{
					        if (this.x-Math.floor(this.x/unitx)*unitx<unitx/2)
							{
							    nearx=Math.floor(this.x/unitx)*unitx;
							}
							else
							{
							    nearx=Math.floor(this.x/unitx+1)*unitx;
							}
						}
						else
						{
						    if (-1==LeftX)
							{
							    if (RightX-this.x-Math.floor((RightX-this.x)/unitx)*unitx<unitx/2)
								{
								    nearx=RightX-Math.floor((RightX-this.x)/unitx)*unitx;
								}
								else
								{
								    nearx=RightX-Math.floor((RightX-this.x)/unitx+1)*unitx;
								}
							}
							if (-1==RightX)
							{
							    if (this.x-LeftX-Math.floor((this.x-LeftX)/unitx)*unitx<unitx/2)
								{
								    nearx=LeftX+Math.floor((this.x-LeftX)/unitx)*unitx;
								}
								else
								{
								    nearx=LeftX+Math.floor((this.x-LeftX)/unitx+1)*unitx;
								}
							}
							if (-1!=LeftX&&-1!=RightX)
							{
							    if (RightX-LeftX>unitx)
								{
								    var nearleftx;
								    if (this.x-LeftX-Math.floor((this.x-LeftX)/unitx)*unitx<unitx/2)
									{
								        nearleftx=LeftX+Math.floor((this.x-LeftX)/unitx)*unitx;
									}
									else
									{
								        nearxleft=LeftX+Math.floor((this.x-LeftX)/unitx+1)*unitx;
										if (nearleftx>RightX) nearleftx=RightX;
									}
									
									var nearrightx;
									if (RightX-this.x-Math.floor((RightX-this.x)/unitx)*unitx<unitx/2)
									{
								        nearrightx=RightX-Math.floor((RightX-this.x)/unitx)*unitx;
									}
									else
									{
								        nearrightx=RightX-Math.floor((RightX-this.x)/unitx+1)*unitx;
										if (nearrightx<LeftX) nearrightx=LeftX;
									}
									
									if (Math.abs(this.x-nearleftx)<Math.abs(this.x-nearrightx))
									{
									    nearx=nearleftx;
									}
									else
									{
									    nearx=nearrightx;
									}
								}
								else
								{
								    if (Math.abs(this.x-LeftX)<Math.abs(this.x-RightX))
									{
									    nearx=LeftX;
									}
									else
									{
									    nearx=RightX;
									}
								}
							}
							
						}
						
						if (-1==TopY&&-1==BottomY)
						{
					        if (this.y-Math.floor(this.y/unity)*unity<unity/2)
							{
							    neary=Math.floor(this.y/unity)*unity;
							}
							else
							{
							    neary=Math.floor(this.y/unity+1)*unity;
							}
						}
						else
						{
						    if (-1==TopY)
							{
							    if (BottomY-this.y-Math.floor((BottomY-this.y)/unity)*unity<unity/2)
								{
								    neary=BottomY-Math.floor((BottomY-this.y)/unity)*unity;
								}
								else
								{
								    neary=BottomY-Math.floor((BottomY-this.y)/unity+1)*unity;
								}
							}
							if (-1==BottomY)
							{
							    if (this.y-TopY-Math.floor((this.y-TopY)/unity)*unity<unity/2)
								{
								    neary=TopY+Math.floor((this.y-TopY)/unity)*unity;
								}
								else
								{
								    neary=TopY+Math.floor((this.y-TopY)/unity+1)*unity;
								}
							}
							if (-1!=TopY&&-1!=BottomY)
							{
							    if (BottomY-TopY>unity)
								{
								    var neartopy;
								    if (this.y-TopY-Math.floor((this.y-TopY)/unity)*unity<unity/2)
									{
								        neartopy=TopY+Math.floor((this.y-TopY)/unity)*unity;
									}
									else
									{
								        neartopy=TopY+Math.floor((this.y-TopY)/unity+1)*unity;
										if (neartopy>BottomY) neartopy=BottomY;
									}
									
									var nearbottomy;
									
									if (BottomY-this.y-Math.floor((BottomY-this.y)/unity)*unity<unity/2)
									{
								        nearbottomy=BottomY-Math.floor((BottomY-this.y)/unity)*unity;
									}
									else
									{
								        nearbottomy=BottomY-Math.floor((BottomY-this.y)/unity+1)*unity;
										if (nearbottomy<TopY) nearbottomy=TopY;
									}
									
									if (Math.abs(this.y-neartopy)<Math.abs(this.y-nearbottomy))
									{
									    neary=neartopy;
									}
									else
									{
									    neary=nearbottomy;
									}
									
								}
								else
								{
								    if (Math.abs(this.y-TopY)<Math.abs(this.y-BottomY))
									{
									    neary=TopY;
									}
									else
									{
									    neary=BottomY;
									}
								}
							}
							
						}	
							
					    if (this.existdot(nearx,neary)!=null) return;
						this.createdot(nearx,neary,0.5,"vitual","grey");
	
						this.draw();
						return;
					}
				},
				//[event] onmousedown
				onmousedown:function(event){
	           	    event=event||window.event;
				    if (event.button==2) return;
				    if (event.button==1)
				    {
				        this.move="move";
					    this.lastx=this.x;
					    this.lasty=this.y;
					    return;
				    }
				
			        var x=event.offsetX;
				    var y=event.offsetY;
				    var mapx=x/this.width*(this.right-this.left)+this.left;
				    var mapy=y/this.height*(this.bottom-this.top)+this.top;
				
				    var near=this.near();
				    if (near!=null) 
				    {  
				        near.onmousedown(this);
				    }
				
				    this.vitualtoreal();
				    this.modifyreal();
					this.draw();
				},
				// toJSON 
				toJSON:function(){
				    var S=new Object();
				    for (var val in this)
					{
					    if (typeof(this[val])==='function')
						{
						    continue;
						}
						if (val==="dots"||val==="lines"||val==="selected"||val==="convexs")
						{
						    S[val]=new Array();
						    for (var i=0;i<this[val].length;i++)
							{
							    S[val].push(this[val][i].toJSON(this));  
							}
							continue;
						}
						if (typeof(this[val])==='object')
						{
						    continue;
						}
						S[val]=this[val];
					}
					return S;
				},
				//[event] onmousewheel
				onmousewheel:function(event){
				    var angle;
				    if (event.wheelDelta)
					{
				        angle=event.wheelDelta;
				    }
				    else if (event.detail)
				    {
				        angle=event.wheelDelta;
				    }
					
				    var scale=0.8;
					if (angle<0) scale=1/scale;
				    this.left=this.x+scale*(this.left-this.x);
					this.right=this.x+scale*(this.right-this.x);
					this.top=this.y+scale*(this.top-this.y);
					this.bottom=this.y+scale*(this.bottom-this.y);             
					this.draw();
				},
				//[event] onkeypress
				onkeypress:function(event){
				    event=event||window.event;
				    var keynum=event.keyCode;
				    var keychar=String.fromCharCode(keynum);
					if (keychar=="i"||keychar=="I")
					{
					    this.mode="input";
						
					}
					if (keychar=="o"||keychar=="O")
					{
					    // save cp file
						document.getElementsByClassName("cp")[0].value=this.toJSON().toJSONString();
						outputfilename=prompt("enter filename");
						if (null==outputfilename) return;
					    var url="FoldOutput.php";
						var data="CP="+this.toJSON().toJSONString()+"&FileName="+outputfilename;
						this.outputstate="outputting";
		                this.save(url,data,this);
						
					    this.mode="output";
						this.draw();
						this.convexs=new Array();
						var lineunfold;
						for (var i=0;i<this.dots.length;i++)
						{
						    this.dots[i].unfoldsum=0;
							this.dots[i].lines.sort(this.linecmp);
						}
						/*for (var i=0;i<this.dots.length;i++)
						{
						    for (var j=0;j<this.dots[i].lines.length;j++)
							{
							    this.dots[i].lines[j].color="orange";
								
								this.draw();
								alert(1);
							}
							//for (var k=0;k<100000000;k++){}
							
							
							for (var j=0;j<this.dots[i].lines.length;j++)
							{
							    this.dots[i].lines[j].color="black";
							}
						}*/
						for (var i=0;i<this.lines.length;i++)
						{
						    if (this.lines[i].foldtype=="unfold")
							{
							    this.lines[i].position="border";
							}
							else
							{
							    this.lines[i].position="center";
							}
							this.lines[i].convexA=null;
							this.lines[i].convexB=null;
						}
						for (var i=0;i<this.lines.length;i++)
						{
						    if (this.lines[i].foldtype=="unfold")
							{
							    this.lines[i].A.unfoldsum++;
								this.lines[i].B.unfoldsum++;
								if (this.lines[i].A.unfoldsum>2||this.lines[i].B.unfoldsum>2)
								{
								    //failed ( exist unproper fold line )
								    this.outputstate="failed";
							        this.draw();
							        error=true;
							        return;
								}
							}
						}
						for (var i=0;i<this.lines.length;i++)
						{
						    if (this.lines[i].foldtype=="unfold")
							{
							    lineunfold=this.lines[i];
								break;
							}
						}
						var error=false;
						var nowline=lineunfold;
						if (lineunfold==undefined)
						{
						    //failed ( not enough unfold line )
							this.outputstate="failed";
							this.draw();
							error=true;
							return;
						}
						
						var firstdot=nowline.A;
						var nowdot=firstdot;
						var dotset=new Array();
						var nextdot;
						//init convex ( the largest )
                        
						while (true)
						{
						    dotset.push(nowdot);
						    if (nowdot==nowline.A)
							{
							    nextdot=nowline.B;
							}
							else
							{
							    nextdot=nowline.A;
							}
							var nextline=null;

							for (var i=0;i<nextdot.lines.length;i++)
							{
							    
							    if (nextdot.lines[i]==nowline) continue;
								if (nextdot.lines[i].foldtype=="unfold")
								{
								    nextline=nextdot.lines[i];
								}
							}
							if (nextline==null)
							{
							    //failed ( incomplete convex )
								this.outputstate="failed";
								this.draw();
								error=true;
				                break;
							}
							nowdot=nextdot;
							nowline=nextline;
							if (nowdot==firstdot) break;
						}
						if (error) return;
						this.createconvex(dotset);
						
						for (var i=0;i<this.convexs.length;i++)
						{
						    //this.orangetoblack();
						    var convexnow=this.convexs[i];
							/*for (var j=0;j<convexnow.lines.length;j++)
							{
							    convexnow.lines[j].color="orange";
							}
							this.draw();
							alert("convex: "+i);*/
							
							//find a center line
							var centerline=convexnow.existcenterline(this);
							if (centerline==null) continue;
							
							/*centerline.color="orange";
							this.draw();
							alert("orange");*/
							
							var linenow=centerline;
							var linenext;
						    var dotnow;
							var dotfirst;
							var dotlast;
							var dotset=new Array();
							if (convexnow.existdot(centerline.A))
							{
							    dotnow=centerline.A;
								dotnext=centerline.B;
							}
							else
							{
							    dotnow=centerline.B;
								dotnext=centerline.A;
							}
							dotfirst=dotnow;
                            
							//find a route to divide the convex into two parts
							while (true)
							{
							    dotset.push(dotnow);
								if (convexnow.existdot(dotnext)) break;
								var label=dotnext.linelabel(linenow);
								while (true)
								{
								    label--;
									if (label<0) label=dotnext.lines.length-1;
									linenext=dotnext.lines[label];
									if (linenext.position=="border") continue;
									break;
								}
								dotnow=dotnext;
								linenow=linenext;
								/*linenow.color="orange";
								this.draw();
								alert("orange");*/
								if (linenext.A==dotnow)
								{
									dotnext=linenext.B;
								}
								else
								{
									dotnext=linenext.A;
								}
							}
							dotlast=dotnext;
							dotset.push(dotlast);
							for (var j=0;j<dotset.length;j++)
							{
							    dotset[j].position="border";
							}
							var dotset1=new Array();
							var dotset2=new Array();
							for (var j=0;j<dotset.length;j++)
							{
							    dotset1.push(dotset[j]);
								dotset2.push(dotset[j]);
							}
							var labelfirst=convexnow.dotlabel(dotfirst);
							var labellast=convexnow.dotlabel(dotlast);
							var labelnow=labellast;
							
							while (true)
							{
							    labelnow++;
								if (labelnow>convexnow.dots.length-1) labelnow=0;
								if (labelnow==labelfirst) break;
								
							    dotset1.push(convexnow.dots[labelnow]);
							}
							var labelnow=labellast;
							while (true)
							{
							    labelnow--;			
								if (labelnow<0) labelnow=convexnow.dots.length-1;
								if (labelnow==labelfirst) break;
								dotset2.push(convexnow.dots[labelnow]);
							}
					
							this.convexs.splice(i,1);
							i--;
							this.createconvex(dotset1);
							this.createconvex(dotset2);
							
						}
						for (var i=0;i<this.lines.length;i++)
						{
						    var linenow=this.lines[i];
						    for (var j=0;j<this.convexs.length;j++)
							{
							    var convexnow=this.convexs[j];
							    if (convexnow.existborderline(linenow)!=null)
							    {
								    if (linenow.convexA==null)
									{ 
									    linenow.convexA=convexnow;
									}
									else
									{
									    linenow.convexB=convexnow;
									}
								}
							}
						}
						/*for (var i=0;i<this.convexs.length;i++)
						{
						    var convexnow=this.convexs[i];
							for (var j=0;j<convexnow.lines.length;j++)
							{
							    var linenow=convexnow.lines[j];
								linenow.color="red";
							}
							this.draw();
							for (var j=0;j<convexnow.lines.length;j++)
							{
							    var linenow=convexnow.lines[j];
								linenow.color="black";
							}
						}*/
						
						//output cp file 
						url="FoldOutput.php";
						data="CP="+this.toJSON().toJSONString();
						this.outputstate="outputting";
						this.draw();
		                this.output(url,data,this);
					}
					if (keychar=="f"||keychar=="F")
					{
					    this.mode="fold";
					}
				    if (keychar=="u"||keychar=="U")
					{
					    this.mode="unit";
					}
				    if (keychar=="s"||keychar=="S")
					{
					    this.mode="select";
					} 
					if (keychar=="d"||keychar=="D")
					{
					    this.mode="draw";
					}
					if (keychar=="e"||keychar=="E")
					{
					    this.mode="erase";
					}
					if (keychar=="m"||keychar=="M")
					{
					    this.mode="modify";
						this.scale="";
					}
					if (this.mode=="output")
					{
					    this.outputstate="sleeping";
					}
					if (this.mode=="select"||this.mode=="draw")
					{
					    if (keychar=="c"||keychar=="C")
						{
						    this.selected=new Array();
							for (var i=0;i<this.dots.length;i++)
							{
							    this.dots[i].invert(this);
							}
							for (var i=0;i<this.lines.length;i++)
							{
							    this.lines[i].invert(this);
							} 
						}
					}
					if (this.mode=="modify")
					{
					    if (keychar=="c"||keychar=="C")
						{
						    this.scale="";
						}
						else
						{
						    if (keychar>='0'&&keychar<='9'||keychar=='.')
						        this.scale+=keychar;
						}
					}
					if (this.mode=="unit")
					{
					    if (keychar=="c"||keychar=="C")
						{
						    this.unitx=10;
							this.unity=10;
						}
						if (keychar=="h"||keychar=="H")
						{
						    this.unitx/=2;
							this.unity/=2;
						}
						if (keychar=="t"||keychar=="T")
						{
						    this.unitx/=3;
							this.unity/=3;
						}
						if (keychar=="r"||keychar=="R")
						{
						    var k=this.unitx;
						    this.unitx=this.unity;
							this.unity=k;
						}
						if (keychar=="x"||keychar=="X")
						{
						    this.unitx=Math.sqrt(this.unitx*this.unitx+this.unity*this.unity);
						}
						if (keychar=="y"||keychar=="Y")
						{
						    this.unity=Math.sqrt(this.unitx*this.unitx+this.unity*this.unity);
						}
					}
					this.erasevitual();
					this.draw();
				},
				//init real position
				modifyreal:function()
				{
				    for (var i=0;i<this.dots.length;i++)
					{
					    this.dots[i].realx=this.dots[i].x;
						this.dots[i].realy=this.dots[i].y;
					}
				}
			};
			var convex={
			    type:"convex",
			    dots:Array(),
				lines:Array(),
				//find if there is a border [line]
				existborderline:function(lineA){
				    for (var i=0;i<this.lines.length;i++)
					{
					    if (this.lines[i].A==lineA.A&&this.lines[i].B==lineA.B) return this.lines[i];
						if (this.lines[i].A==lineA.B&&this.lines[i].B==lineA.A) return this.lines[i];
					}
					return null;
				},
				//find if there is a [dot]
				existdot:function(dotA){
				    for (var i=0;i<this.dots.length;i++)
					{
					    if (this.dots[i]==dotA) return dotA;
					}
					return null;
				},
				//find the [dot]'s label ( it is the Ith dot in the convex ) ( failed -1 )
				dotlabel:function(dotA){
				    for (var i=0;i<this.dots.length;i++)
					{
					    if (this.dots[i]==dotA) return i;
					}
					return -1;
				},
				//find if there is a center [line] ( in the convex )
				existcenterline:function(editor){
				    for (var i=0;i<this.dots.length;i++)
					{
					    var dotA=this.dots[i];
						//dotA.lines.sort(editor.linecmp);
						var labelA=this.dotlabel(dotA);
						var linenow=this.lines[labelA];
						var labelline=dotA.linelabel(linenow);
						var labelnow=labelline;
						while (true)
						{
						    labelnow--;
						    if (labelnow<0) labelnow=dotA.lines.length-1;
						    var linenow=dotA.lines[labelnow];
							
						    if (labelnow==labelline)
						    {
						        break;
						    }
						    if (linenow.position=="border") continue;
							/*linenow.color="purple";
							editor.draw();
							alert("purple");
							linenow.color="black";*/
						    var inner=true;
							
						    /*for (var k=0;k<editor.dots.length;k++)
						    {
						        var rand=Math.random();
							    if (rand<1/editor.dots.length)
								{
								    rand=1/editor.dots.length;
								}
							    if (rand>1-1/editor.dots.length) 
							    {
							        rand=1-1/editor.dots.length;
						     	}
						        var dotC=editor.createdot(linenow.A.x*rand+linenow.B.x*(1-rand),linenow.A.y*rand+linenow.B.y*(1-rand),0.5,"vitual","grey");
							    editor.draw();
								alert("dot");
						        if (!this.dotin(dotC))
							    {
								    inner=false;
								    break;
							    }
							    
						    }*/
							var rand=0.5;
							var dotC=editor.createdot(linenow.A.x*rand+linenow.B.x*(1-rand),linenow.A.y*rand+linenow.B.y*(1-rand),0.5,"vitual","grey");
							if (!this.dotin(dotC)) continue;
							editor.erasevitual();
							/*linenow.color="purple";
							editor.draw();
							alert("purple");*/
							return linenow;
						}
					}
				},
				//toJSON
				toJSON:function(editor){
				    if (editor.type!="editor") return null;
				    var S=new Object();
				    for (var val in this)
					{
					    if (typeof(this[val])==='function')
						{
						    continue;
						}
						if (val==="dots"||val==="lines")
						{
						    S[val]=new Array();
						    for (var i=0;i<this[val].length;i++)
							{
							    S[val].push(this[val][i].label(editor));  
							}
							continue;
						}
						if (typeof(this[val])==='object')
						{
						    continue;
						}
						S[val]=this[val];
					}
					return S;
				},
				//find the [convex]'s label ( it is the Ith convex ) ( failed -1 )
				label:function(editor){
				    for (var i=0;i<editor.convexs.length;i++)
					{
					    if (editor.convexs[i]==this)
						{
						    return i;
						}
					}
					return -1;
				},
				//find if a [dot] is in the [convex]
				dotin:function(dotA){
				    var AngleSum=0;
				    for (var i=0;i<this.dots.length;i++)
					{
					    var dotB=this.dots[i];
						var dotC=this.dots[(i+1>this.dots.length-1)?0:i+1];
						var deltax1=dotB.x-dotA.x;
						var deltay1=dotB.y-dotA.y;
						var deltax2=dotC.x-dotA.x;
						var deltay2=dotC.y-dotA.y;
						
						var CosA=(deltax1*deltax2+deltay1*deltay2)/Math.sqrt(deltax1*deltax1+deltay1*deltay1)/Math.sqrt(deltax2*deltax2+deltay2*deltay2);
						var AngleA=Math.acos(CosA);
						if (deltax1*deltay2-deltax2*deltay1>0)
						{
						    AngleSum+=AngleA;
						}
						else
						{
						    AngleSum-=AngleA;
						}
					}
					//alert(AngleSum);
					if (Math.abs(Math.abs(AngleSum)-Math.PI*2)<0.0001) return true;
					return false;
				}
			};
			var dot={
			    realx:-1,
				realy:-1,
			    x:-1,
				y:-1,
				r:-1,
				reality:"real",
				color:"black",
				selected:"not",
				erased:"not",
				type:"dot",
				visible:"visible",
				lines:Array(),
				unfoldsum:-1,
				//draw
				draw:function(editor){
				    if (this.visible!="visible") return;
				    var context=editor.context;
				    context.fillStyle=this.color;
					
				    context.beginPath();
					var screenx=(this.x-editor.left)/(editor.right-editor.left)*editor.width;
					var screeny=(this.y-editor.top)/(editor.bottom-editor.top)*editor.height;
					var screenr=this.r/(editor.right-editor.left)*editor.width;
					context.arc(screenx,screeny,screenr,0,Math.PI*2,true);
					
					context.closePath();
					context.fill();
					
				},
				//find the [line]'s label ( it is the Ith line from the [dot] ) ( failed -1 )
				linelabel:function(lineA){
				    for (var i=0;i<this.lines.length;i++)
					{
					    if (this.lines[i]==lineA) return i;
					}
					return -1;
				},
				//find the [dot]'s label ( it is the Ith dot )
				label:function(editor){
				    for (var i=0;i<editor.dots.length;i++)
					{
					    if (editor.dots[i]==this) return i;
					}
					return -1;
				},
				//toJSON
				toJSON:function(editor){
				    if (editor.type!="editor") return null;
				    var S=new Object();
				    for (var val in this)
					{
					    if (typeof(this[val])==='function')
						{
						    continue;
						}
						if (val==="lines")
						{
						    S[val]=new Array();
						    for (var i=0;i<this[val].length;i++)
							{
							    var label=this[val][i].label(editor);
								S[val].push(label);
							}
							continue;
						}
						if (typeof(this[val])==='object')
						{
						    continue;
						}
						S[val]=this[val];
					}
					return S;
				},
				//[event] onmousemove
				onmousemove:function(editor){
				    if (editor.mode=="erase")
					{
					    for (var i=0;i<this.lines.length;i++)
						{
						    this.lines[i].erase="vitual";
							this.lines[i].visible="invisible";
						}
						this.erase="vitual";
						this.visible="invisible";
						editor.draw();
						return;
					}
				    if (editor.selected.length==1&&editor.mode=="draw")
					{
					    if (editor.selected[0].type=="dot")
						{
						    if (editor.selected[0]!=this)
							{
							    var dotA=editor.selected[0];
								var dotB=this;
								if (editor.existline(dotA,dotB)==null)
								{ 
									editor.createline(dotA,dotB,1,"vitual","grey");
								}   
							}
						}
					    
					}
					if (editor.selected.length==1&&editor.mode=="unit")
					{
					    if (editor.selected[0].type=="dot")
						{
						    if (editor.selected[0]!=this)
							{
							    var dotA=editor.selected[0];
								var dotB=this;
								
								editor.createline(dotA,dotB,1,"vitual","orange");
							}
						}
					}
				    if ((this.selected=="not"&&editor.mode=="select")||((editor.mode=="draw"||editor.mode=="unit")&&this.selected=="not"))
					{
				        this.color="lightskyblue";
					}
					editor.draw();
				},
				//[event] onmousedown
				onmousedown:function(editor){
				    if (editor.mode=="erase")
					{
					    editor.eraseinvisible();
						editor.draw();
						return;
					}
					if (editor.mode=="select"||((editor.mode=="draw"||editor.mode=="unit")&&editor.selected.length==0||(editor.selected.length==1&&editor.selected[0]==this)))
					{
				        if (this.selected=="not")
						{
					        this.selecting(editor);
						}
					    else
						if (this.selected=="selected")
					    {
					        this.invert(editor);
					    }
					}
					editor.draw();
				},
				//selecting a [dot]
				selecting:function(editor){
				    this.selected="selected";
					this.color="plum";
					
					for (var i=0;i<editor.selected.length;i++)
					{
					    if (editor.selected[i]==this) return;
					}
					
					editor.selected.push(this);
				},
				//invert a [dot]
				invert:function(editor){
				    this.selected="not";
					this.color="black";
					
					for (var i=0;i<editor.selected.length;i++)
					{
					    if (editor.selected[i]==this)
						{
						    editor.selected.splice(i,1);
							break;
						}
					}
				}
			};
			var line={
			    position:"center",
			    width:-1,
				convexA:convex,
				convexB:convex,
				A:dot,
				B:dot,
				color:"black",
				foldtype:"unfold",
				reality:"real",
				selected:"not",
				erased:"not",
				visible:"visible",
				type:"line",
				//draw
				draw:function(editor){
				    if (this.visible!="visible") return;
				    var context=editor.context;
					if (this.fold=="unfold")
					{
					    this.color="black";
					}
					if (this.fold=="mountain")
					{
					    this.color="royalblue";
					}
					if (this.fold=="valley")
					{
					    this.color="crimson";
					}
								
				    context.strokeStyle=this.color;
					context.lineWidth=this.width/(editor.right-editor.left)*editor.width;
                    context.beginPath();
					var screenAx=(this.A.x-editor.left)/(editor.right-editor.left)*editor.width;
					var screenAy=(this.A.y-editor.top)/(editor.bottom-editor.top)*editor.height;
					var screenBx=(this.B.x-editor.left)/(editor.right-editor.left)*editor.width;
					var screenBy=(this.B.y-editor.top)/(editor.bottom-editor.top)*editor.height;
					context.moveTo(screenAx,screenAy);
					context.lineTo(screenBx,screenBy);
					context.stroke();
					
				},
				
				//find the [line]'s label ( it is the Ith line ) ( failed -1 )
				label:function(editor){
				    for (var i=0;i<editor.lines.length;i++)
					{
					    if (editor.lines[i]==this) return i;
					}
					return -1;
				},
				//toJSON
				toJSON:function(editor){
				    if (editor.type!="editor") return null;
				    var S=new Object();
				    for (var val in this)
					{
					    if (typeof(this[val])==='function')
						{
						    continue;
						}
						if (val=="A"||val=="B")
						{
						    S[val]=this[val].label(editor);
						    continue;
						}
						if (val=="convexA"||val=="convexB")
						{
						    if (this[val]==null) S[val]=-1;
							else
							S[val]=this[val].label(editor);
							continue;
						}
						S[val]=this[val];
					}
					return S;
				},
				//[event] onmousemove
				onmousemove:function(editor){
				    if (editor.mode=="modify"&&Math.abs(parseFloat(editor.scale))>0.0001)
					{
					    
					    var scale=Math.sqrt(parseFloat(editor.scale));
						var dotA=this.A;
						var dotB=this.B;
						var deltaX=(scale-1)*Math.abs(dotA.x-dotB.x);
						var deltaY=(scale-1)*Math.abs(dotA.y-dotB.y);
						
						var MaxX=Math.max(dotA.x,dotB.x);
						var MaxY=Math.max(dotA.y,dotB.y);
						
						for (var i=0;i<editor.dots.length;i++)
						{
						    var dotnow=editor.dots[i];
							if (dotnow.x<MaxX) continue;
							dotnow.realx=dotnow.x;
							dotnow.x+=deltaX;
						}
						for (var i=0;i<editor.dots.length;i++)
						{
						    var dotnow=editor.dots[i];
							if (dotnow.y<MaxY) continue;
							dotnow.realy=dotnow.y;
							dotnow.y+=deltaY;
						}
					    return;
					}
				    if (editor.mode=="erase")
					{
					    this.erase="vitual";
					    this.visible="invisible";
						editor.draw();
						return;
					}
				    if (editor.mode=="select")
					{
				        if (this.selected=="not")
						{
					        this.color="lightskyblue";
						}
					}
					if (editor.mode=="fold")
					{
					    this.color="lightskyblue";
					}
					editor.draw();
				},
				//[event] onmousedown
				onmousedown:function(editor){
				    if (editor.mode=="erase")
					{
					    editor.eraseinvisible();
						editor.draw();
						return;
					}
				    if (editor.mode=="select")
					{
				        if (this.selected=="not")
						{
					        this.selecting(editor);
						}
						else 
						if (this.selected=="selected")
						{
					        this.invert(editor);
					    }
					}
					if (editor.mode=="fold")
					{
					    if (this.foldtype=="unfold")
						{
						    this.foldtype="mountain";
							this.color="royalblue";
						}
						else
						if (this.foldtype=="mountain")
						{
						    this.foldtype="valley";
							this.color="crimson";
						}
						else
						if (this.foldtype=="valley")
						{
						    this.foldtype="unfold";
							this.color="black";
						}
					}
					editor.draw();
				},
				//selecting a [line]
				selecting:function(editor){
				    this.selected="selected";
					this.color="plum";
					
					for (var i=0;i<editor.selected.length;i++)
					{
					    if (editor.selected[i]==this) return;
					}
					
					editor.selected.push(this);
				},
				//invert a [line]
				invert:function(editor){
				    this.selected="not";
					this.color="black";
					
					for (var i=0;i<editor.selected.length;i++)
					{
					    if (editor.selected[i]==this)
						{
						    editor.selected.splice(i,1);
							break;
						}
					}
				}
			};		