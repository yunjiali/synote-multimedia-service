/**
 * multimedia upload client javascript
 */
 
var nexturl; //the link to go to when file uploading finishes
window.addEventListener("load", Ready); 
			
function Ready(){ 
	if(window.File && window.FileReader){ //These are the necessary HTML5 objects the we are going to use 
		document.getElementById('UploadButton').addEventListener('click', StartUpload);  
		document.getElementById('FileBox').addEventListener('change', FileChosen);
	}
	else
	{
		document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
	}
}
var SelectedFile;
function FileChosen(evnt) {
    SelectedFile = evnt.target.files[0];
	document.getElementById('NameBox').value = SelectedFile.name;
}

var baseURL;// = "http://localhost:8888";
var socket = io.connect(baseURL);
var Name;
var FReader;
function StartUpload(){
	if(document.getElementById('FileBox').value != "")
	{
		FReader = new FileReader();
		var randomStr = AlphabeticID.encode(Date.now()+Math.floor(Math.random()*26));
		Name = randomStr+"_"+document.getElementById('NameBox').value;
		var Content = "<span id='NameArea'>Uploading " + SelectedFile.name + " as " + Name + "</span>";
		Content += '<div id="ProgressContainer"><div id="ProgressBar"></div></div><span id="percent">50%</span>';
		Content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(SelectedFile.size / 1048576) + "MB</span>";
		document.getElementById('UploadArea').innerHTML = Content;
		FReader.onload = function(evnt){
			socket.emit('Upload', { 'Name' : Name, Data : evnt.target.result });
		}
		socket.emit('Start', { 'Name' : Name, 'Size' : SelectedFile.size });
	}
	else
	{
		alert("Please Select A File");
	}
}

socket.on('MoreData', function (data){
	UpdateBar(data['Percent']);
	var Place = data['Place'] * 524288; //The Next Blocks Starting Position
	var NewFile; //The Variable that will hold the new Block of Data
	if(SelectedFile.slice) 
		NewFile = SelectedFile.slice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
	else if(SelectedFile.mozSlice)
		NewFile = SelectedFile.mozSlice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
	else if (SelectedFile.webkitSlice) 
		NewFile = SelectedFile.webkitSlice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
	else
	{
		document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
		return;
	}
		
	FReader.readAsBinaryString(NewFile);
});
function UpdateBar(percent){
	document.getElementById('ProgressBar').style.width = percent + '%';
	document.getElementById('percent').innerHTML = (Math.round(percent*100)/100) + '%';
	var MBDone = Math.round(((percent/100.0) * SelectedFile.size) / 1048576);
	document.getElementById('MB').innerHTML = MBDone;
}

socket.on('Done', function (data){
	//show url of the video and a button to copy to clipboard
	var Content = "<p>File Successfully Uploaded!</p>";
	Content+="<br/><a class='button' href=\""+nexturl+"?url="+encodeURIComponent(data.videourl)+"\" title='next'>Next</a>";
	document.getElementById('UploadBox').innerHTML = Content;
});

function Refresh(){
	location.reload(true);
}

function setNextURL(u)
{ 
	nexturl = u;
}

			