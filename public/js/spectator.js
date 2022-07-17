let socket = io();
let gameEnded = false;
let remainingPlayers = -1;
let result = 0;
let playerStatus = '';

socket.on('status-change', (data) => {
    const e = document.getElementById(`player-${data.id}`).children;
    playerStatus = data.status;
    e[0].innerText = data.status;
    if (data.status == 'ready') {
        e[0].style.color = 'rgb(36, 209, 134)';
    } else if (data.status == 'eliminated' || data.status == 'winner') {
        let status = e[0].cloneNode();
        status.innerText = e[0].innerText;
        let username = e[1].cloneNode();
        username.innerText = e[1].innerText;
        let rank = e[2].cloneNode();
        rank.innerText = result;

        // let s_status = document.createElement('span');
        // let s_username = document.createElement('span');
        // let s_rank = document.createElement('span');
        // s_status.innerText = data.status;
        // s_username.innerText = data.username;
        // s_rank.innerText = result;

        let ol_in = document.getElementById(`list_in`);
        ol_in.removeChild(document.getElementById(`player-${data.id}`))

        status.style.color = 'rgb(255, 0, 0)';

        if (data.status == 'winner') {
            status.style.color = 'rgb(255, 223, 0)';
            username.style.color = 'rgb(255, 223, 0)';
            rank.style.color = 'rgb(255, 223, 0)';
            rank.innerText = '1st';
        }

        status.className = 'out';

        let list_item = document.createElement('li');
        list_item.className = 'out';
        list_item.append(status);
        list_item.append(username);
        list_item.append(rank);

        let ol_out = document.getElementById(`list_out`);
        ol_out.prepend(list_item);


    } else if (data.status == 'playing') {
        e[0].style.color = data.status.colour;
    }
});
socket.on('player-connected', (player) => {

    //create elements and append user to list
    let list_item = document.createElement('li');
    list_item.className = player.status.toLowerCase() !== 'eliminated' ? 'in' : 'out';
    list_item.id = 'player-' + player.id;

    let s_status = document.createElement('span');
    let s_username = document.createElement('span');
    let s_rank = document.createElement('span');
    s_status.innerText = player.status;
    s_username.innerText = player.username;
    s_rank.innerText = '';
    let ol = document.getElementById(`list_${list_item.className}`)
    list_item.appendChild(s_status);
    list_item.appendChild(s_username);
    list_item.appendChild(s_rank);
    ol.appendChild(list_item);

    /**
     * ol
     *  li
     *      span-status
     *      span-username
     */
});

socket.on('remaining-count', (remainingCount) => {
    result = remainingCount;

    let suffix = 'th';

    if (result == 1) {
        suffix = 'st';
    }

    if (((result % 10) == 3) && result != 13) {
        suffix = 'rd';
    }

    if (((result % 10) == 2) && result != 12) {
        suffix = 'nd';
    }
    result = `${result}${suffix}`;
});

socket.on('end-of-game', () => {
    gameEnded = true;
});

socket.on('player-disconnected', () => {
    if(!gameEnded){
        window.location.reload(true);
    }
});

var audio = new Audio("./../audio_files/intro1.mp3");
let isplaying = false;


document.onclick = function () {
    if (!isplaying) {
        audio.play();
        isplaying = true;
    }
    else {
        audio.pause();
        isplaying = false;
    }

}

audio.addEventListener('ended', function () {
    this.currentTime = 0;
    this.play();
}, false);