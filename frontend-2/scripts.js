var text_input = document.getElementById("text-input");
var input_form = document.getElementById("input-form");
var emotion = null;
var user_classes = ["chatbox1", "chatbubble-user"];
var bot_classes = ["chatbox2", "chatbubble-bot"]
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

input_form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let message  = text_input.value;
    text_input.value = ""
    let tag = document.createElement("p");
    tag.classList.add(...user_classes);
    parent = document.getElementById("text")
    tag.innerText = message;
    console.log(tag)
    parent.append(tag);
    if(!emotion){
        response = await get_sentiment(message)
            .then((data) => { return data });
        emotion = response["emotion"]
        console.log(emotion)
        let feeling_tag = document.createElement("p");
        feeling_tag.classList.add(...bot_classes);
        feeling_tag.innerText = "Are you feeling " + emotion
        console.log(feeling_tag)
        parent.append(feeling_tag);
    }
    else if(message.toLowerCase() === "yes" || message.toLowerCase() === "ya"){
        response = await get_song(emotion)
            .then((data => {return data}));
        song = response["song-link"];
        console.log(song);
        response_tag = document.createElement("p")
        response_tag.classList.add(...bot_classes);
        response_tag.innerText = "Try listening to this "
        let link = document.createElement("a");
        link.class = "unstyled-link"
        link.href = song;
        link.innerText = song;
        response_tag.append(link)
        parent.append(response_tag)
        emotion = null;
    }
    else{
        response_tag = document.createElement("p");
        response_tag.classList.add(...bot_classes);
        response_tag.innerText = "Then how are you feeling"
        parent.append(response_tag);

    }
})
