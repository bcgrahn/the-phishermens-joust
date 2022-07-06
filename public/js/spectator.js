let socket = io();

socket.on('status-change', (data) => {
    const e = document.getElementById(`player-${data.id}`).children;
    e[0].innerText = data.status.status;
    if (data.status.status == 'ready') {
        e[0].style.color = 'rgb(36, 209, 134)';
    } else if (data.status.status == 'eliminated') {
        let status = e[0].cloneNode();
        status.innerText = e[0].innerText;
        let username = e[1].cloneNode();
        username.innerText = e[1].innerText;

        let ol_in = document.getElementById(`list_in`);
        ol_in.removeChild(document.getElementById(`player-${data.id}`))

        status.style.color = 'rgb(255, 0, 0)';
        status.className = 'out';
        let list_item = document.createElement('li');
        list_item.className = 'out';
        list_item.appendChild(status);
        list_item.appendChild(username);
        let ol_out = document.getElementById(`list_out`);
        ol_out.appendChild(list_item);


    } else if (data.status.status == 'playing') {
        e[0].style.color = data.status.colour;
    }
});
socket.on('player-connected', (player) => {

    //create elements and append user to list
    let list_item = document.createElement('li');
    list_item.className = player.status.toLowerCase() !== 'eliminated' ? 'in' : 'out';
    list_item.id = 'player-' + player.id;
    console.log(list_item.className)
    let s_status = document.createElement('span');
    let s_username = document.createElement('span');
    s_status.innerText = player.status;
    s_username.innerText = player.username;
    let ol = document.getElementById(`list_${list_item.className}`)
    list_item.appendChild(s_status);
    list_item.appendChild(s_username);
    ol.appendChild(list_item);

    /**
     * ol
     *  li
     *      span-status
     *      span-username
     */
});