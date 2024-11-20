// Function of dummy server to fetch data
async function getdata(link) {
    let response = await fetch(link);
    let data = await response.text();
    let div = document.createElement("div");
    div.innerHTML = data;

    let all_data = div.getElementsByTagName("a");

    let files = [];

    for (let i = 1; i < all_data.length; i++) {
        files[i - 1] = all_data[i].href;
    }

    return files;
}

// creating the elements of songs lists of all albums dynamically
async function create_elements() {
    console.log("hyy");

    let main_songs_area = document.querySelector(".first_half_part2");
    let main_folders = await getdata(`http://127.0.0.1:3004/songs/`);
    
    for (let i = 0; i < main_folders.length; i++) {
        let songs = await getdata(`http://127.0.0.1:3004/songs/${i}/`);
        let songs_names = [];
        for (let j = 0; j < songs.length; j++) {
            // console.log(songs);
            songs_names[j] = songs[j].split("songs/")[1].replaceAll("%20", " ").split(".mp3")[0];
            // console.log(songs_names[j]);

            let main_div = document.createElement("div");
            main_div.classList.add(`_${i}`);
            main_div.classList.add("hidden");
            main_songs_area.appendChild(main_div);

            let child_div = document.createElement("div");
            child_div.classList.add("first_half_part2_1");
            main_div.appendChild(child_div);

            let img1 = document.createElement("img");
            img1.src = "svgs/song.svg";
            let p = document.createElement("p");
            p.innerHTML = songs_names[j];
            let img2 = document.createElement("img");
            img2.classList.add(`_${i}_img`);
            img2.src = "svgs/play_list_song.svg";

            child_div.appendChild(img1);
            child_div.appendChild(p);
            child_div.appendChild(img2);
        }
        console.log(main_songs_area);
        console.log("\n");
    }

}

// fun to format time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    return `${minutes}:${formattedSeconds}`;
}
// fun to show time and name of song
async function show_name_and_time(audio, k, j) {
    // getting the name of all the songs
    let songs = await getdata(`http://127.0.0.1:3004/songs/${k}/`);
    let songs_names = [];
    for (let i = 0; i < songs.length; i++) {
        songs_names[i] = songs[i].split("songs/")[1].replaceAll("%20", " ").split(".mp3")[0];
    }
    // putting data into song_run bar
    if (audio) {
        let song_run = document.querySelector(".song_run");
        song_run.classList.remove("hidden");
        song_run.classList.add("show");
        let songName = document.querySelector(".song_name");
        console.log(songName);
        songName.innerHTML = songs_names[j];
        audio.addEventListener("timeupdate", () => {
            let time = document.querySelector(".time");
            time.innerHTML = `${formatTime(audio.currentTime)}/${formatTime(audio.duration)}`;
            // updating the runing circle
            let circle = document.querySelector(".point");
            let percent = (audio.currentTime / audio.duration) * 100;
            circle.style.left = percent + "%";
            // ensure the clicking effect on bar
            document.querySelector(".bar").addEventListener("click", e => {
                let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
                document.querySelector(".point").style.left = percent + "%";
                audio.currentTime = ((audio.duration) * percent) / 100;
            })
        });


    }

    return songs_names;
}


// fetch songs
var current_audio = null;
async function fetch_songs(i,chk=false,nw_j) {
    let k=i;

    let play = document.getElementsByClassName(`_${k}_img`);
    let songs = await getdata(`http://127.0.0.1:3004/songs/${k}/`);
    let play_button = document.querySelector("#play_song");

     // to check is we have to play previous or next song
     if(chk){
        play[nw_j].click();
        return ;
      }


    for (let j = 0; j < play.length; j++) {

        play[j].addEventListener("click", async () => {
            if (current_audio) {
                current_audio.pause();
            }
            else {
                play_button.src = "svgs/pause.svg";
            }
            current_audio = new Audio(songs[j]);
            current_audio.play();
            console.log(current_audio.volume);

            // updating the play_bar data according to song
            show_name_and_time(current_audio, k, j);

            // closing the hamburgur
            document.querySelector(".first_half").style.left="-100%";
            document.querySelector(".first_half").style.zIndex =0;


            // previous button functionallity
            let previous_button = document.querySelector("#previous_song");
            previous_button.onclick=()=>{
               if(j-1>=0){
                   fetch_songs(i,true,j-1);}
            };

            // next button functionality
            let next_button=document.querySelector("#next_song");
            next_button.onclick=()=>{
                if(j+1<=play.length){
                    fetch_songs(i,true,j+1);}
             };

        });
    } 
}

// main fuction to show lists of songs on click
function main() {
    let main_play = document.getElementsByClassName("play");
    for (let i = 0; i < main_play.length; i++) {
        main_play[i].addEventListener(("click"), () => {

            let list = document.getElementsByClassName(`_${i}`);
            for(let s=0;s<list.length;s++)
                list[s].classList.remove("hidden");
            
            // immedieatly also show from side
            document.querySelector(".first_half").style.left=0;
            document.querySelector(".first_half").style.zIndex =1;
            document.querySelector(".first_half").style.width ="65vw";

            // get all the songs of clicked folder
            fetch_songs(i);
        });

         //  getting the buttons of play_bar and controlling the songs
         let play_button = document.querySelector("#play_song");
         play_button.addEventListener("click", () => {
             if (current_audio) {
                 if (current_audio.paused) {
                     play_button.src = "svgs/pause.svg";
                     current_audio.play();
                 }
                 else {
                     play_button.src = "svgs/play_song.svg";
                     current_audio.pause();
                 }
             }
         });

    }
}

create_elements();
main();

// volume changing effect
let vol_svg=document.querySelector(".vol_svg");
vol_svg.addEventListener("click",()=>{
    document.querySelector(".volume").classList.remove("hidden");
})
let volume=document.querySelector(".volume");
volume.addEventListener("input",()=>{
    if(current_audio) {
        current_audio.volume=volume.value/100;
    }
})


// hamburugur effect
let hamburgur=document.querySelector(".hamburgur");

hamburgur.addEventListener("click",()=>{
    document.querySelector(".first_half").style.left=0;
    document.querySelector(".first_half").style.zIndex =1;
    document.querySelector(".first_half").style.width ="65vw";
});

let cross=document.querySelector(".cross");
cross.addEventListener("click",()=>{
    document.querySelector(".first_half").style.left="-100%";
    document.querySelector(".first_half").style.zIndex =0;
});

