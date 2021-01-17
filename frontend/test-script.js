var text_input = document.getElementById("text-input");
var input_button = document.getElementById("input-button");

let get_auth_string = async () =>{
    let pls_dont_steal = "764915ada4714643a561bb17286a9882:5f33e816137f43c2979824f69987c63e"
    let auth = 'Basic ' + window.btoa(pls_dont_steal);
    url = "https://accounts.spotify.com/api/token"
    data = "grant_type=client_credentials"
    return fetch("https://accounts.spotify.com/api/token", {
        body: "grant_type=client_credentials",
        headers: {Authorization: auth,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST"
    }).then(function(response){return response.json()}).then(function(data){return data})
}

let lookup_song = async (input,auth) =>{
    let url = `https://api.spotify.com/v1/search?q=${input}&type=track&limit=5&offset=0`
    return fetch(url,{
        method:"GET" ,
        mode:"cors",
        cache:'no-cache',
        headers:{
            "Content-Type":"application/json",
            "Authorization":"Bearer " + auth
        },
        redirect:"follow",
    }).then(function(response){return response.json()}).then(function(data){return data})
}

let is_url = (text) =>{
    return text.substring(0,5) === "https";
}

let not_good_title = (title1,title2) =>{
    let flag = false;
    if(title1.substring(0,title2.length).toLowerCase() === title2.toLowerCase()){
        for(let i = title2.length; i < title1.length; i++){
            c = title1[i].toLowerCase();
            if((c >= '0' && c <= '9') || (c >= 'a' && c <= 'z' )){
                flag = true;
            }
        }
    }
    else{
        flag = true;
    }
    return flag;
}

let get_url = (text,response) =>{
    for(var track of response.tracks.items){
        if(not_good_title(track.name,text)){
            continue;
        }
        else{
            return track.external_urls.spotify;
        }
    }
    return ""
}

let compose_texts = (texts) => {
    let new_texts = [];
    let cur_text = "";
    for(var text of texts){
        if (text.substring(0,5) === "https"){
            if(cur_text.trim() !== ""){
                new_texts.push(cur_text.trim());
            }
            new_texts.push(text);
            cur_text = "";
        }
        else{
            cur_text += text + " "
        }
    }
    if(cur_text.trim() !== ""){
        new_texts.push(cur_text.trim());
    }
    return new_texts;
}

input_button.addEventListener("click", async ()=>{
    let auth_promise = get_auth_string();
    let message = text_input.value;
    text_input.value = ""
    let keywords = message.split(" ");
    let spotify_queries = [];
    let text = [];
    let auth_json = await auth_promise;
    let auth_string = auth_json.access_token
    for(let i = 0; i < keywords.length; i++){
        spotify_queries.push(lookup_song(keywords[i],auth_string));
    }
    for(let i = 0; i < spotify_queries.length; i++){
        let name = keywords[i];
        let response = await spotify_queries[i];
        let song_name = get_url(name,response);
        if(song_name != ""){
            text.push(song_name)
        }
        else{
            text.push(keywords[i])
        }
    }
    let final_texts = compose_texts(text);
    let parent = document.getElementById("text-messages")
    for(text_message of final_texts){
        let tag = document.createElement("p");
        if(is_url(text_message)){
            let link = document.createElement("a");
            link.class = "unstyled-link"
            link.href = text_message;
            link.innerText = text_message;
            tag.append(link);
        }
        else{
            tag.innerText = text_message;
        }
        parent.append(tag)
    }
})
