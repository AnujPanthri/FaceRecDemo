async function resize(image_file,max_size=1000){
    // Load the image
    // Get as image data
    const imageBitmap = await createImageBitmap(image_file);
    
    // Resize the image
    var canvas = document.createElement('canvas'),
    
    width = imageBitmap.width,
    height = imageBitmap.height;
    if (width > height) {
        if (width > max_size) {
            height *= max_size / width;
            width = max_size;
        }
    } else {
        if (height > max_size) {
            width *= max_size / height;
            height = max_size;
        }
    }
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(imageBitmap, 0, 0, width, height);
    
    const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg')
        );

    // Turn Blob into File
    return new File([blob], image_file.name, {
        type: blob.type,
    });
}
async function predict(el){

    if(!el.files[0])    return;  
    var image_file=el.files[0];
    image_file=await resize(image_file);
    load_image_preview(image_file);

    formdata=new FormData();
    formdata.append("image",image_file);
    formdata.append("access_key","a6c9339d-1c97-11ee-a91b-e6adec474436");
    
    var loader_txt=show_loader();
    
    const myInterval=start_timer(loader_txt,0.2);

    fetch("https://anuj-panthri-face-rec-api.hf.space/api/face_recognize/",{
        method:"POST",
        body:formdata
        
    }).then(res=>res.json()).then(res=>{
        // console.log(res);
        if (res["message"]!="success") return;

        show_image("data:image/jpeg;base64,"+res["pred_image"]);
        console.log(res["person_ids"]);
        console.log(res["objs_found"]);
        
        clearInterval(myInterval);
        hide_loader();
    });
}

function start_timer(el,interval){
    //interval in seconds
    el.innerText="";
    
    var time=0;
    return setInterval(function () { 
        time+=interval;
        el.innerText=time.toFixed(2)+"s";
    }, interval*1000);
}

function show_loader(){
    var loader=document.querySelector(".loader");
    loader.classList.add("animate");
    return loader.querySelector("#loader_text");
    // document.querySelector(".loader").innerText="loading";
}
function hide_loader(){
    document.querySelector(".loader").classList.remove("animate");
    // document.querySelector(".loader").innerText="";
}

function show_image(base64){
    var el=document.querySelector("#face_box>img");
    el.src = base64;
    el.style.background="white";
}

function load_image_preview(file){

    if (FileReader && file) {
        var fr = new FileReader();
        fr.onload = function () {
            show_image(fr.result);
        }
        fr.readAsDataURL(file);
    }
    
}


