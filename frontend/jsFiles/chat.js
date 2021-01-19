const pathName = location.pathname;
const currentChannel = sessionStorage.getItem('connected');
const alreadyConnected = currentChannel === currentChannelId;

//code to share session storage between two tabs or windows
localStorage.setItem('getSessionStorage', Date.now());


// window.addEventListener('storage', (event) => {
//     if(event.key === 'getSessionStorage'){
//         localStorage.setItem('connected', sessionStorage.getItem('connected'));
//         localStorage.removeItem('connected');
//     }
//     if(event.key === 'connected' && !sessionStorage.length ){
//         sessionStorage.setItem('connected', event.newValue);
//     }
// });

const socket = io(pathName);
// import {container , usersContainer, file, camera, voice, stopVoice, deleteVoice, modalBox} from "./utilities/constants"; 
const container = document.getElementsByClassName("message-container")[0];
const usersContainer = document.getElementsByClassName("rightSection")[0];

const file = document.getElementById("file");
const camera = document.getElementById("camera");
const voice = document.getElementById("voice");
const stopVoice = document.getElementById("stop-voice");
const deleteVoice = document.getElementById("delete-voice");
const modalBox = document.getElementsByClassName("modal-box-container")[1];


console.log(socket);
console.log("A user connected!!!");
//contains the current previous username
let prevName = "";

//Adding the class 
console.log('My name is ', name);

//function for automatic scrolling
function scroll(){
    container.scrollTop = container.scrollHeight;
}

//function for creating and appending a document element
function append(input , classname){
    let notice = document.createElement("div");
    notice.innerText = input;
    notice.classList.add(classname);
    container.appendChild(notice);
}

//function to save new messages
const saveNewMessage = (obj) => {

    const {message, channelId, sentBy} = obj;

    fetch('/new-message', {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message,
                channelId,
                sentBy
            })
    }).then(response => {
        return response.json();
    }).then(result => {
        if(result.error){
            console.log(result.error);
        }
        else{
            console.log(result.success);
        }
    }).catch(err => {
        console.log("Error saving new messages!", err);
    });
    
}

//Notify that this User has joined the chat

socket.emit("join" , {
    name,
    _id: userId,
    currentGroup,
    currentChannelId,
    alreadyConnected
});

//store the token in the session storage
socket.on('token', (connection) => {
    console.log("Got the token!");
    sessionStorage.setItem('connected', connection.connected);
});

//get all the users to show the user
// socket.on('usersAvailable', (users) =>{
//     let usersArray = Object.keys(users);
//     console.log(usersArray);
//     //Use the usersContainer
//     //Iterate over all the users
//     usersArray.forEach((userId) => {
//         if(userId !== socket.id && !alreadyPresentUsers[userId]){

//             //Creating a div
//             let perticipant = document.createElement('div');
            
//             //Adding the class 
//             perticipant.classList.add('perticipants');
//             console.log(users[userId]);
//             perticipant.innerHTML = users[userId];

//             //Appending the element to the usersContainer
//             usersContainer.appendChild(perticipant);

//             //Adding the user to the alreadyPresentUser
//             alreadyPresentUsers[userId] = users[userId];
//         }
//     });
// });

// //When an User joins the chat
// socket.on("userJoined" , (name) => {
//     append(name + " joined the chat" , "notification");
//     scroll();
// });

//function for sending text message
function send(){
    let value = document.getElementById("message").value;
    if(value == ""){
        document.getElementById("message").placeholder = "Please type something...";
    }
    else{
        append(value , "right");
        document.getElementById("message").value = "";
        saveNewMessage({
            message: value,
            channelId: currentChannelId,
            sentBy: {
                name,
                _id: userId
            }
        });
        scroll();
        prevName = "";
        document.getElementById("message").placeholder = "Type here...";
        socket.emit("sendMessage" , value);
    }
    // sound.play();
}


// receiving a text message
socket.on("receiveMessage" , (obj) => {
    // append(obj.name + "\n\n" + obj.message , "left");
    let left = document.createElement("div");
    let leftContent = document.createElement('div');
    leftContent.innerText = obj.message;
    leftContent.classList.add("leftContent");
    
    if(prevName != obj.name){
        left.innerText = obj.name;
        left.style.marginTop = 5 + "px";
    }
    left.appendChild(leftContent);
    left.classList.add("left");
    //save the received message
    saveNewMessage({
        message: obj.message,
        channelId: currentChannelId,
        sentBy: {
            name: obj.name,
            _id: obj.userId
        }
    });

    container.appendChild(left);
    scroll();
    prevName = obj.name;
    
});

//On clicking the I icon different options
//will be shown
function clickedIcon(){
    let element = document.getElementsByClassName("opt-cont-dropdown")[0];
    element.classList.toggle("show");
}

// Open the modal box when the user clicks the file button
function clickedFileButton(){
    // let modalBox = document.getElementsByClassName("modal-box")[0];
    modalBox.style.display = "block";
}

//What if user clicks the camera button
function clickedCamera(){
    let webCamModal = document.getElementsByClassName('modal-box-container')[0];
    webCamModal.style.display = "block";

    //Get the media stream from User device
    navigator.mediaDevices.getUserMedia({audio: true, video: true})
    .then((stream) => {
        let video = document.getElementById("webcam");
        
        console.log("Hell from camera");
        video.srcObject = stream;
        console.log(video.srcObject);

        //Get the capture image button
        let captureImage = document.getElementById('capture-image');
        //What to do when user clicks the captureImage button
        captureImage.onclick = () => {
            //Create a canvas first to hold the snapshot
            let canvas = document.createElement("canvas");
            //Set the width and height of the canvas
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            canvas.getContext("2d").drawImage(video, 0, 0);

            //The data of the canvas as an data:URL
            let imgURL = canvas.toDataURL("image/jpeg");

            //Create a blob to send the data to other peers
            canvas.toBlob((blob) => {
                
                sendImgArrayBuffer(blob);
                
            });

            closeModal(webCamModal);

            createImgFromURL(imgURL);

            // Stop the stream
            // stream.getTracks().forEach((track) => {
            //     track.stop();
            // });

            stopStream(stream);
        };

        //Get the start video button
        let startVideo = document.getElementById("start-video");
        //Define a variable to hold the mediaRecorder for this functional scope
        let mediaRecorder = null;
        //A chunk of data to store the recorded video
        let chunks = [];

        //What to do when the User clicks the startVideo button
        startVideo.onclick = () => {
            console.log("Hello from startvideo click");

            //create a MediaRecorder object
            mediaRecorder = new MediaRecorder(stream, {type: "video/mp4"});
            console.log("MediaRecorder: " + mediaRecorder);
            // pushDataToChunk();
            
            //When data is available from mediaRecorder
            mediaRecorder.ondataavailable = (ev) => {
                //Push the data to the chunks
                chunks.push(ev.data);
                console.log("pushing data: " + ev.data);
                console.log("Chunks of video from pushing: " + chunks);
            }

            mediaRecorder.start();

        };

        console.log("MediaRecorder(global): " + mediaRecorder);


        //Get the stop video button
        let stopVideo = document.getElementById("stop-video");

        //What to do when the User clicks the stopVideo button
        stopVideo.onclick = () => {
            
            stopRecording();

            //Stop the media Recorder
            mediaRecorder.stop();
            
        };

        let closeButton = document.getElementById("camera-close-button");
        closeButton.onclick = () => {
            stopStream(stream);
            closeModal(webCamModal);
        }

        function stopRecording() {
            
            //What to do when the mediaRecorder stops
            mediaRecorder.onstop = () => {
                console.log("Chunks of video: " + chunks);
                
                //Send the chunks data to other peers
                socket.emit("sentVideo", chunks);

                //Create a new Blob
                let blob = new Blob(chunks, {type: "video/mp4"});

                

                createVidFromBlob(blob);

                closeModal(webCamModal);

                // URL.revokeObjectURL(vidURL);
                scroll();
                
                chunks = [];

                // prevName = "";
                
                // Stop the stream
                // stream.getTracks().forEach((track) => {
                //     track.stop();
                // });
                stopStream(stream);

            }
        }

    })
    .catch((err) => {
        let cameraArea = document.getElementsByClassName("camera-area")[0];
        cameraArea.innerHTML = "Sorry! Something went wrong";
        let closeButton = document.getElementById("camera-close-button");
        closeButton.onclick = () => {
            closeModal(webCamModal);
        }

    });
}

// stop the given stream
function stopStream(stream){
    stream.getTracks().forEach((track) => {
        track.stop();
    });
}

//Send blob arrayBuffer to others
function sendImgArrayBuffer(blob){
    blob.arrayBuffer()
    .then((arrayBuffer) => {
        socket.emit("sendImage", {data: arrayBuffer});
        console.log("Sending " + arrayBuffer);
    });
}


function createImgFromURL(imgURL){

    //Create a div element to hold the image
    let imgDiv = document.createElement("div");

    let image = document.createElement("img");
    image.src = imgURL;
    imgDiv.appendChild(image);
    imgDiv.classList.add("right-image-container");
    image.classList.add("right-image");
    container.appendChild(imgDiv);

    scroll();

    prevName = "";

}

//Display the captured image for others
socket.on("receivedImage", (data) => {
    let blob = new Blob([data.data], {type: "image/jpeg"});
    console.log("Received data: " + data.data);
    console.log("Received blob: " + blob);

    let imgDivContainer = document.createElement("div");
    if(prevName !== data.name){
        imgDivContainer.innerHTML = data.name;
        prevName = data.name;
    }

    //Create a div element to hold the image
    let imgDiv = document.createElement("div");

    let image = document.createElement("img");

    let imgURL = URL.createObjectURL(blob);
    image.src = imgURL;

    imgDiv.appendChild(image);
    imgDiv.classList.add("left-image-container");
    image.classList.add("left-image");
    imgDivContainer.classList.add("left");
    imgDivContainer.appendChild(imgDiv);

    container.appendChild(imgDivContainer);

    //Automatic scrolling
    scroll();

});

function createVidFromBlob(blob){

    //Create a div element to hold the video element
    let videoDiv = document.createElement("div");

    //Create a video element
    let vid = document.createElement("video");

    //Create an URL for the blob
    let vidURL = URL.createObjectURL(blob);
    console.log("Video URl: " + vidURL);

    vid.src = vidURL;
    console.log("Source of video: " + vid.src);
    vid.controls = true;
    vid.load();

    videoDiv.appendChild(vid);
    vid.classList.add("right-image");
    videoDiv.classList.add("right-image-container");

    container.appendChild(videoDiv);

    prevName = "";

}

//Display the received video
socket.on("receivedVideo", (info) => {
    let blob = new Blob(info.data, {type: "video/mp4"});
    console.log("Received data: " + info.data);
    console.log("Received blob: " + blob);

    let vidDivContainer = document.createElement("div");
    if(prevName !== info.name){
        vidDivContainer.innerHTML = info.name;
        prevName = info.name;
    }

    //Create a div element to hold the image
    let vidDiv = document.createElement("div");

    let video = document.createElement("video");

    let vidURL = URL.createObjectURL(blob);
    video.src = vidURL;
    video.controls = true;
    video.load();

    vidDiv.appendChild(video);
    vidDiv.classList.add("left-image-container");
    video.classList.add("left-image");
    vidDivContainer.classList.add("left");
    vidDivContainer.appendChild(vidDiv);

    container.appendChild(vidDivContainer);

    //Automatic scrolling
    scroll();
});

//Close the modal box
function closeModal(modalBox){
    console.log("Hello from closeModal");
    modalBox.style.display = "none";
}

//Handles what to do when a file is uploaded
function uploadedFile(files){
    let file = files[0];
    console.log(file);

    closeModal(modalBox);

    if(file.type.indexOf("image/") !== -1){
        sendImgArrayBuffer(file);
        let imgURL = URL.createObjectURL(file);
        createImgFromURL(imgURL);
        return;
    }

    if(file.type.indexOf("video/") !== -1){
        
        file.arrayBuffer()
        .then((arrayBuffer) =>{
            //Emit an event
            socket.emit("sentVideo", [arrayBuffer]);
        });
        

        createVidFromBlob(file);

        return;

    }

    modalBox.style.display = "none";
    // append(file.name, "right");

    let div = document.createElement("div");
    let a = document.createElement("a");
    let fileTypeDiv = document.createElement("div");

    fileTypeDiv.classList.add("file-type-displayer");
    fileTypeDiv.innerHTML = "File" ;
    // div.classList.add("right");

    div.innerHTML = file.name;

    a.appendChild(fileTypeDiv);
    a.appendChild(div);
    a.classList.add("right");
    let fileURL = URL.createObjectURL(file);
    a.href = fileURL;
    a.target = "_blank";



    container.appendChild(a);
    
    // let fileReader = new FileReader();

    // fileReader.onload = ()

    // fileReader.readAsDataURL(file);
    prevName = "";

    socket.emit("fileSent", file, file.type, file.name);
}

//Handling when one drops a file in the draggable area
(() => {
    // get the draggable area
    let draggableArea = document.getElementById("draggable");
    
    draggableArea.ondragenter = (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
    }

    draggableArea.ondragover = (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
    }

    draggableArea.ondrop = (ev) => {
        //Prevent default behaviour of browser
        ev.stopPropagation();
        ev.preventDefault();

        // get the file that is dropped
        uploadedFile(ev.dataTransfer.files);
    }

})();


//Receive the file
socket.on("receivedFile", (data) => {
    let {file, filetype, fileName, name} = data;

    let newFile = new File([file], fileName, {type: filetype});
    console.log(newFile);

    let fileContainer = document.createElement("div");
    let div = document.createElement("div");
    let a = document.createElement("a");
    let fileTypeDiv = document.createElement("div");

    fileTypeDiv.classList.add("file-type-displayer");
    fileTypeDiv.innerHTML = "File" ;

    fileContainer.classList.add("left");
    if(prevName !== name){
        fileContainer.innerHTML = name;
        prevName = name;
    }
    // div.classList.add("left");
    div.innerHTML = fileName;

    a.appendChild(fileTypeDiv);
    a.appendChild(div);
    a.classList.add("leftContent");
    a.style = "clear: both; display: block;";
    fileContainer.appendChild(a);
    let fileURL = URL.createObjectURL(newFile);
    a.href = fileURL;
    a.target = "_blank";

    container.appendChild(fileContainer);
});

//sending an audio
function sendVoiceMessage(){
    
    
    console.log("Hello  from voice");

    stopVoice.classList.toggle("show");
    deleteVoice.classList.toggle("show");

    //disable the button
    voice.disable = true;

    navigator.mediaDevices.getUserMedia({audio:true , video:false}).then(
        (stream) =>{
            
            console.log("Hello from mediaStream");

            let mediaRecorder = new MediaRecorder(stream , {mimetype : 'audio/webm'});
            let chunks = [];
            let shouldSendVoice = false; 

            //stop after clicking the camera button
            stopVoice.addEventListener('click' , () => {
                shouldSendVoice = true;
                mediaRecorder.stop();
                // console.log("recorded");

                // shouldSendVoice = false;

                // display none for stopVoice and deleteVoice
                stopVoice.classList.toggle("show");
                deleteVoice.classList.toggle("show");

            });

            // delete the recorded audio
            deleteVoice.addEventListener('click' , () => {
                //Stop the recorder
                mediaRecorder.stop();
                
                // display none for stopVoice and deleteVoice
                stopVoice.classList.toggle("show");
                deleteVoice.classList.toggle("show");
            });

            mediaRecorder.ondataavailable = function (ev){
                chunks.push(ev.data);
                console.log("hello" + ev.data);
                console.log("chunks = " + chunks);
            }
            mediaRecorder.onstop = (ev) => {

                if(shouldSendVoice){
                    socket.emit("sentVoiceMessage" , chunks);
                    
                    console.log( chunks);
                    let blob = new Blob(chunks , {'type' : 'audio/webm'});
                    // console.log(blob);
                    

                    //creating an audio element
                    let audio = document.createElement("audio");
                    audio.controls = true;
                    audio.classList.add("audio");
                    audio.classList.add("audio-right");

                    //adding the blob as the source of the audio
                    let audioURL = URL.createObjectURL(blob);
                    audio.src = audioURL;

                    //appending the audio element to the container
                    container.appendChild(audio);

                    // URL.revokeObjectURL(audioURL);

                    //for automatic scrolling
                    scroll();

                }

                chunks = [];

                //stopping the mediaStream
                stream.getTracks().forEach((track) => {
                    track.stop();
                });
            }

            //start the recorder
            mediaRecorder.start();
        }
    );
    
    // container.appendChild(audio);
}

//recieving an audio
socket.on("receivedVoice" , (chunks , name) =>{
    let audioContainer = document.createElement('div');
    let audio = document.createElement('audio');
    audio.controls = true;
    if(prevName != name){
        audioContainer.innerText = name;
        audioContainer.style.marginTop = 5 + "px";
        
    }
    console.log("from receivedVoice " + chunks);
    let anotherBlob = new Blob(chunks , {type : "audio/webm"});
    audio.src = URL.createObjectURL(anotherBlob);
    audio.classList.add("audio");
    // audio.classList.add("audio-left");
    audioContainer.appendChild(audio);
    audioContainer.classList.add('left');
    container.appendChild(audioContainer);
    scroll();
    prevName = name;
});



//when user leaves the chat
socket.on("userLeft" , (name) => {
    append(name + " left the chat", "notification");
    scroll();
});

