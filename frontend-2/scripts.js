//var text_input = document.getElementById("text-input");
var input_button = document.getElementById("input-button");
var emotion = null;
let get_sentiment = async (text) => {
    url = "http://localhost:8000/"
    const response = await fetch(
        url,
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"text": text})
        });
    return response.json();
}

let get_song = async (emotion) =>{
    url = "http://localhost:8000/get-song";
    const response = await fetch(
       url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"emotion": emotion})
        }
    )
    return response.json();
}

input_button.addEventListener("click", async () => {
    //let message  = text_input.value;
    //text_input.value = ""
    if(!emotion){
        response = await get_sentiment("naomi is awesome")
            .then((data) => { return data });
        emotion = response["emotion"]
        console.log(emotion)
    }
    else{
        response = await get_song(emotion)
            .then((data => {return data}));
        song = response["song-link"];
        console.log(song);
        emotion = null;
    }
})
